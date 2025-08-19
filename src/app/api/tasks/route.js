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
    const {
      title,
      description,
      type = 'TASK',
      priority = 'MEDIUM',
      status = 'TODO',
      projectId,
      assigneeIds = [], // array of userId
      createdById,
      dueDate,
      estimatedTime,
      functionId,
      sprintId,
      sprintName, // New field for sprint name
    } = body;

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
      const { prisma } = require('@/lib/prisma');
      
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
      createdById,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedTime: estimatedTime ? parseFloat(estimatedTime) : null,
      functionId,
      sprintId: finalSprintId,
    };

    const task = await taskOperations.create(taskData);

    // Create TaskAssignee records for each assignee
    if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      await Promise.all(
        assigneeIds.map(userId =>
          prisma.taskAssignee.create({
            data: {
              taskId: task.id,
              userId,
            }
          })
        )
      );
    }

    // Log activity
    await activityOperations.create({
      type: 'TASK_CREATED',
      description: `Task "${title}" was created`,
      userId: createdById,
      projectId,
      taskId: task.id,
    });

    // Create notification for each assignee
    if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      await Promise.all(
        assigneeIds
          .filter(userId => userId !== createdById)
          .map(userId => notificationOperations.create({
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: `You have been assigned to task "${title}"`,
            userId,
            taskId: task.id,
            actionUrl: `/tasks/${task.id}`,
          }))
      );
      // Log assignment activity for each assignee
      await Promise.all(
        assigneeIds.map(userId => activityOperations.create({
          type: 'TASK_ASSIGNED',
          description: `Task "${title}" was assigned to userId ${userId}`,
          userId: createdById,
          projectId,
          taskId: task.id,
        }))
      );
    }

    return NextResponse.json({ 
      task,
      message: 'Task created successfully' 
    });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
