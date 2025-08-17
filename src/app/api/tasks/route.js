import { NextResponse } from 'next/server';
import { taskOperations, activityOperations, notificationOperations } from '@/lib/prisma';

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
      assigneeId,
      createdById,
      dueDate,
      estimatedTime,
      functionId,
      sprintId,
    } = body;

    // Validate required fields
    if (!title || !projectId || !createdById) {
      return NextResponse.json(
        { error: 'Title, project ID, and creator ID are required' },
        { status: 400 }
      );
    }

    const taskData = {
      title,
      description,
      type: type.toUpperCase(),
      priority: priority.toUpperCase(),
      status: status.toUpperCase(),
      projectId,
      assigneeId,
      createdById,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedTime: estimatedTime ? parseFloat(estimatedTime) : null,
      functionId,
      sprintId,
    };

    const task = await taskOperations.create(taskData);

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
