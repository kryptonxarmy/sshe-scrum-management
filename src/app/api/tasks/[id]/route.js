import { NextResponse } from 'next/server';
import { taskOperations, activityOperations, notificationOperations, prisma } from '@/lib/prisma';

// GET /api/tasks/[id] - Get task details
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const task = await taskOperations.findById(id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });

  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, ...updateData } = body;

    console.log('PUT /api/tasks/[id] called:', { id, updateData });

    // Get current task
    const currentTask = await taskOperations.findById(id);
    if (!currentTask) {
      console.log('Task not found:', id);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const processedUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'dueDate' && updateData[key]) {
          processedUpdateData[key] = new Date(updateData[key]);
        } else if (key === 'estimatedTime' && updateData[key]) {
          processedUpdateData[key] = parseFloat(updateData[key]);
        } else if (['type', 'priority', 'status'].includes(key)) {
          processedUpdateData[key] = updateData[key].toUpperCase();
        } else if (key === 'assigneeId') {
          // Handle assigneeId - convert "unassigned" to null
          if (updateData[key] === 'unassigned' || updateData[key] === '') {
            processedUpdateData[key] = null;
          } else {
            processedUpdateData[key] = updateData[key];
          }
        } else if (key === 'updatedById') {
          // Skip updatedById as it's not in the Task model
          console.log('UpdatedById received:', updateData[key]);
        } else if (key === 'sprintName') {
          // Handle sprintName - we'll create or find sprint by name
          // For now, skip this and handle it separately
          console.log('Sprint name received:', updateData[key]);
        } else {
          processedUpdateData[key] = updateData[key];
        }
      }
    });
    
    // Handle sprint assignment
    if (updateData.sprintName) {
      // Find or create sprint with the given name
      let sprint = await prisma.sprint.findFirst({
        where: {
          name: updateData.sprintName,
          projectId: currentTask.projectId,
        },
      });
      
      // If sprint doesn't exist, create it
      if (!sprint) {
        const sprintNumber = parseInt(updateData.sprintName.split(' ')[1]) || 1;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 14); // 2 week sprint by default
        
        sprint = await prisma.sprint.create({
          data: {
            name: updateData.sprintName,
            projectId: currentTask.projectId,
            startDate,
            endDate,
          },
        });
      }
      
      processedUpdateData.sprintId = sprint.id;
    }
    
    console.log('Processed update data:', processedUpdateData);

    // Add completion timestamp if status changed to DONE
    if (processedUpdateData.status === 'DONE' && currentTask.status !== 'DONE') {
      processedUpdateData.completedAt = new Date();
    } else if (processedUpdateData.status !== 'DONE' && currentTask.status === 'DONE') {
      processedUpdateData.completedAt = null;
    }

    // Add updatedAt timestamp
    processedUpdateData.updatedAt = new Date();

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: processedUpdateData,
      include: {
        project: true,
        assignee: true,
        createdBy: true,
        function: true,
        sprint: true,
      },
    });

    // Log activities for significant changes
    if (userId) {
      const activities = [];

      // Status change
      if (processedUpdateData.status && processedUpdateData.status !== currentTask.status) {
        activities.push({
          type: 'TASK_STATUS_CHANGED',
          description: `Task "${updatedTask.title}" status changed from ${currentTask.status} to ${processedUpdateData.status}`,
          userId,
          projectId: updatedTask.projectId,
          taskId: id,
        });
      }

      // Assignment change
      if (processedUpdateData.assigneeId !== undefined && processedUpdateData.assigneeId !== currentTask.assigneeId) {
        if (processedUpdateData.assigneeId) {
          activities.push({
            type: 'TASK_ASSIGNED',
            description: `Task "${updatedTask.title}" was assigned to ${updatedTask.assignee?.name || 'user'}`,
            userId,
            projectId: updatedTask.projectId,
            taskId: id,
          });

          // Create notification for new assignee
          if (processedUpdateData.assigneeId !== userId) {
            await notificationOperations.create({
              type: 'TASK_ASSIGNED',
              title: 'Task Assigned to You',
              message: `You have been assigned to task "${updatedTask.title}"`,
              userId: processedUpdateData.assigneeId,
              taskId: id,
              actionUrl: `/tasks/${id}`,
            });
          }
        } else {
          activities.push({
            type: 'TASK_UPDATED',
            description: `Task "${updatedTask.title}" assignee was removed`,
            userId,
            projectId: updatedTask.projectId,
            taskId: id,
          });
        }
      }

      // General update if no specific activities
      if (activities.length === 0) {
        activities.push({
          type: 'TASK_UPDATED',
          description: `Task "${updatedTask.title}" was updated`,
          userId,
          projectId: updatedTask.projectId,
          taskId: id,
        });
      }

      // Create all activities
      for (const activity of activities) {
        await activityOperations.create(activity);
      }
    }

    return NextResponse.json({ 
      task: updatedTask,
      message: 'Task updated successfully' 
    });

  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get current task
    const task = await taskOperations.findById(id);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete task (cascade will handle related records)
    await prisma.task.delete({
      where: { id },
    });

    // Log activity
    if (userId) {
      await activityOperations.create({
        type: 'TASK_DELETED',
        description: `Task "${task.title}" was deleted`,
        userId,
        projectId: task.projectId,
      });
    }

    return NextResponse.json({ 
      message: 'Task deleted successfully' 
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
