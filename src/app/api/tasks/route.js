import { NextResponse } from 'next/server';
import { taskOperations, activityOperations, notificationOperations, prisma } from '@/lib/prisma';

// GET /api/tasks - Get tasks
export async function GET(request) {
  const url = new URL(request.url);
  
  // Check if this is /api/tasks/all
  if (url.pathname.endsWith('/all')) {
    try {
      const tasks = await taskOperations.getAll();
      return NextResponse.json({ tasks });
    } catch (error) {
      console.error('Get all tasks error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  // Original GET logic for /api/tasks
  try {
    const { searchParams } = url;
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');
    const priority = searchParams.get('priority');

    let tasks;
    const filters = {};
    
    if (status) filters.status = status.toUpperCase();
    if (assigneeId) filters.assigneeId = assigneeId;
    if (priority) filters.priority = priority.toUpperCase();

    if (projectId) {
      tasks = await taskOperations.getByProjectId(projectId, filters);
    } else if (userId) {
      tasks = await taskOperations.getByUserId(userId, filters);
    } else {
      // Fallback: return empty array (for legacy GET)
      return NextResponse.json({ tasks: [] });
    }

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Create task request body:', body);
    
    const {
      title,
      description,
      type = 'TASK',
      priority = 'MEDIUM',
      status = 'TODO',
      projectId,
      assigneeId,
      createdById,
      dueDate,
      estimatedTime,
      functionId,
      sprintId,
      sprintName, // New field for sprint name
    } = body;

    console.log('Extracted data:', {
      title,
      description,
      type,
      priority,
      status,
      projectId,
      assigneeId,
      createdById,
      sprintName
    });

    // Validate required fields
    if (!title || !projectId || !createdById) {
      return NextResponse.json(
        { error: 'Title, project ID, and creator ID are required' },
        { status: 400 }
      );
    }

    let finalSprintId = sprintId;

    // Handle sprint creation if sprintName is provided
    if (sprintName && !sprintId) {
      // Check if sprint already exists
      let sprint = await prisma.sprint.findFirst({
        where: {
          name: sprintName,
          projectId: projectId
        }
      });

      // Create sprint if it doesn't exist
      if (!sprint) {
        // Calculate dates for the sprint (14 days duration)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 14);

        sprint = await prisma.sprint.create({
          data: {
            name: sprintName,
            goal: `Goals for ${sprintName}`,
            startDate: startDate,
            endDate: endDate,
            projectId: projectId,
            isActive: false,
            isCompleted: false
          }
        });
      }
      
      finalSprintId = sprint.id;
    }

    const taskData = {
      title,
      description,
      type: type.toUpperCase(),
      priority: priority.toUpperCase(),
      status: status.toUpperCase(),
      projectId,
      assigneeId: assigneeId || null, // Ensure null if empty
      createdById,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedTime: estimatedTime ? parseFloat(estimatedTime) : null,
      functionId: functionId || null, // Ensure null if empty
      sprintId: finalSprintId || null, // Ensure null if empty
    };

    console.log('Task data to create:', taskData);

    const task = await taskOperations.create(taskData);
    console.log('Task created successfully:', task.id);

    // Log activity
    await activityOperations.create({
      type: 'TASK_CREATED',
      description: `Task "${title}" was created`,
      userId: createdById,
      projectId,
      taskId: task.id,
    });

    // Create notification for assignee
    if (assigneeId && assigneeId !== createdById) {
      await notificationOperations.create({
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `You have been assigned to task "${title}"`,
        userId: assigneeId,
        taskId: task.id,
        actionUrl: `/tasks/${task.id}`,
      });

      // Log assignment activity
      await activityOperations.create({
        type: 'TASK_ASSIGNED',
        description: `Task "${title}" was assigned to ${task.assignee?.name || 'user'}`,
        userId: createdById,
        projectId,
        taskId: task.id,
      });
    }

    return NextResponse.json({ 
      task,
      message: 'Task created successfully' 
    });

  } catch (error) {
    console.error('Create task error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Task with this title already exists in the project' },
        { status: 409 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid project, assignee, or creator ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
