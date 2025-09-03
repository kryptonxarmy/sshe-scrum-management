import { NextResponse } from "next/server";
import { taskOperations, activityOperations, notificationOperations, prisma } from "@/lib/prisma";
import { sendTaskNotification } from "@/lib/email";

// GET /api/tasks - Get tasks
export async function GET(request) {
  const url = new URL(request.url);

  // Check if this is /api/tasks/all
  if (url.pathname.endsWith("/all")) {
    try {
      const tasks = await taskOperations.getAll();
      return NextResponse.json({ tasks });
    } catch (error) {
      console.error("Get all tasks error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  // Original GET logic for /api/tasks
  try {
    const { searchParams } = url;
    const projectId = searchParams.get("projectId");
    const projectIds = searchParams.get("projectIds");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");
    const sprintId = searchParams.get("sprintId");
    const priority = searchParams.get("priority");

    let tasks;
    const filters = {};

    if (status) filters.status = status.toUpperCase();
    if (assigneeId) filters.assigneeId = assigneeId;
    if (sprintId) filters.sprintId = sprintId;
    if (priority) filters.priority = priority.toUpperCase();

    console.log("[API/tasks] GET called", { projectId, projectIds, userId, status, assigneeId, sprintId, priority, filters });

    if (projectIds) {
      // Handle multiple project IDs
      const projectIdArray = projectIds.split(",").filter((id) => id.trim());
      try {
        tasks = await taskOperations.getByProjectIds(projectIdArray, filters);
      } catch (err) {
        console.error("Error in getByProjectIds:", err);
        return NextResponse.json({ error: "Failed to fetch tasks for projects", details: err.message }, { status: 500 });
      }
    } else if (projectId) {
      try {
        tasks = await taskOperations.getByProjectId(projectId, filters);
      } catch (err) {
        console.error("Error in getByProjectId:", err);
        return NextResponse.json({ error: "Failed to fetch tasks for project", details: err.message }, { status: 500 });
      }
    } else if (userId) {
      try {
        tasks = await taskOperations.getByUserId(userId, filters);
      } catch (err) {
        console.error("Error in getByUserId:", err);
        return NextResponse.json({ error: "Failed to fetch tasks for user", details: err.message }, { status: 500 });
      }
    } else {
      // Fallback: return empty array (for legacy GET)
      return NextResponse.json({ tasks: [] });
    }

    if (!Array.isArray(tasks)) {
      console.error("Tasks result is not array:", tasks);
      return NextResponse.json({ error: "Tasks result is not array", details: tasks }, { status: 500 });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

// POST /api/tasks - Create new task
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Create task request body:", body);

    const {
      title,
      description,
      priority = "MEDIUM",
      status = "TODO",
      projectId,
      assignees = [], // Array of assignee IDs
      assigneeIds = [], // Also support assigneeIds field
      createdById,
      dueDate,
      functionId,
      sprintId,
      sprintName, // New field for sprint name
    } = body;

    // Combine assignees and assigneeIds arrays
    const finalAssigneeIds = [...new Set([...assignees, ...assigneeIds])];

    console.log("Extracted data:", {
      title,
      description,
      priority,
      status,
      projectId,
      assigneeIds: finalAssigneeIds,
      createdById,
      sprintName,
    });

    // Validate required fields
    if (!title || !projectId || !createdById) {
      return NextResponse.json({ error: "Title, project ID, and creator ID are required" }, { status: 400 });
    }

    let finalSprintId = sprintId;

    // Handle sprint creation if sprintName is provided
    if (sprintName && !sprintId) {
      // Check if sprint already exists
      let sprint = await prisma.sprint.findFirst({
        where: {
          name: sprintName,
          projectId: projectId,
        },
      });

      // Create sprint if it doesn't exist
      if (!sprint) {
        // Calculate dates for the sprint (14 days duration)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 14);

        // Compose goal with SprintName, Project, and Task title
        const sprintGoal = `Goals for ${sprintName} in Project "${projectId}": Task "${title}"`;

        sprint = await prisma.sprint.create({
          data: {
            name: sprintName,
            goal: sprintGoal,
            startDate: startDate,
            endDate: endDate,
            projectId: projectId,
            isActive: false,
            isCompleted: false,
          },
        });
      }

      finalSprintId = sprint.id;
    }

    const taskData = {
      title,
      description,
      priority: priority.toUpperCase(),
      status: status.toUpperCase(),
      projectId,
      createdById,
      dueDate: dueDate ? new Date(dueDate) : null,
      functionId: functionId || null, // Ensure null if empty
      sprintId: finalSprintId || null, // Ensure null if empty
    };

    console.log("Task data to create:", taskData);

    // Create task first
    const task = await prisma.task.create({
      data: taskData,
      include: {
        project: true,
        assignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    });

    // Create task assignments if there are assignees
    if (finalAssigneeIds.length > 0) {
      const taskAssignments = finalAssigneeIds.map((userId) => ({
        taskId: task.id,
        userId: userId,
      }));

      await prisma.taskAssignee.createMany({
        data: taskAssignments,
      });
    }

    // Fetch the complete task with assignees
    const completeTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        project: true,
        assignees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
    });

    console.log("Task created successfully:", completeTask.id);

    // Log activity
    await activityOperations.create({
      type: "TASK_CREATED",
      description: `Task "${title}" was created`,
      userId: createdById,
      projectId,
      taskId: completeTask.id,
    });

    // Create notifications for assignees
    if (finalAssigneeIds.length > 0) {
      // Collect assignee emails (exclude creator)
      const assigneeEmails = completeTask.assignees.filter((a) => a.user && a.user.email && a.user.id !== createdById).map((a) => a.user.email);

      for (const assigneeId of finalAssigneeIds) {
        if (assigneeId !== createdById) {
          await notificationOperations.create({
            type: "TASK_ASSIGNED",
            title: "New Task Assigned",
            message: `You have been assigned to task "${title}"`,
            userId: assigneeId,
            taskId: completeTask.id,
            actionUrl: `/tasks/${completeTask.id}`,
          });

          // Log assignment activity
          await activityOperations.create({
            type: "TASK_ASSIGNED",
            description: `Task "${title}" was assigned to user`,
            userId: createdById,
            projectId,
            taskId: completeTask.id,
          });
        }
      }

      // Send email notification to assignees
      if (assigneeEmails.length > 0) {
        try {
          const priorityColors = {
            HIGH: { bg: "#fee2e2", text: "#dc2626", badge: "#ef4444" },
            MEDIUM: { bg: "#fef3c7", text: "#d97706", badge: "#f59e0b" },
            LOW: { bg: "#d1fae5", text: "#059669", badge: "#10b981" },
          };

          const priorityColor = priorityColors[priority] || priorityColors.MEDIUM;
          const formattedDueDate = dueDate
            ? new Date(dueDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "No due date";

          await sendTaskNotification({
            to: assigneeEmails,
            subject: `[SSHE SCRUM] New Task Assignment - ${title} <do_not_reply>`,
            text: `You have been assigned to a new task in project "${completeTask.project.name}":\n\nTitle: ${title}\nDescription: ${description}\nPriority: ${priority}\nDue Date: ${formattedDueDate}\n\nPlease check the SSHE Scrum Management app for details.\n\nThis is an automated message, please do not reply.`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Task Assignment</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px 24px; text-align: center;">
                  <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; padding: 12px; margin-bottom: 16px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12l2 2 4-4"></path>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                    </svg>
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">New Task Assignment</h1>
                  <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">SSHE Scrum Management</p>
                </div>

                <!-- Content -->
                <div style="padding: 32px 24px;">
                  <div style="margin-bottom: 24px;">
                    <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Hi there! 👋</p>
                    <p style="margin: 0; font-size: 16px; color: #374151;">You've been assigned to a new task in the <strong style="color: #1f2937;">${completeTask.project.name}</strong> project.</p>
                  </div>

                  <!-- Task Details Card -->
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1f2937; display: flex; align-items: center;">
                      <span style="display: inline-block; width: 6px; height: 6px; background-color: #3b82f6; border-radius: 50%; margin-right: 12px;"></span>
                      ${title}
                    </h2>
                    
                    ${
                      description
                        ? `<div style="margin-bottom: 20px;">
                      <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Description</h4>
                      <p style="margin: 0; font-size: 15px; color: #374151; background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">${description}</p>
                    </div>`
                        : ""
                    }

                    <!-- Task Metadata -->
                    <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 20px;">
                      <div style="flex: 1; min-width: 140px;">
                        <h4 style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Priority</h4>
                        <span style="display: inline-flex; align-items: center; padding: 6px 12px; background-color: ${priorityColor.bg}; color: ${
              priorityColor.text
            }; border-radius: 20px; font-size: 14px; font-weight: 600; border: 1px solid ${priorityColor.badge}20;">
                          <span style="display: inline-block; width: 6px; height: 6px; background-color: ${priorityColor.badge}; border-radius: 50%; margin-right: 6px;"></span>
                          ${priority}
                        </span>
                      </div>
                      
                      <div style="flex: 1; min-width: 140px;">
                        <h4 style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Due Date</h4>
                        <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 500;">📅 ${formattedDueDate}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Call to Action -->
                  <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${process.env.APP_URL || "https://sshe-scrum-management.vercel.app"}/tasks/${completeTask.id}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); transition: all 0.2s;">
                      View Task Details →
                    </a>
                  </div>

                  <!-- Additional Info -->
                  <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; align-items: flex-start;">
                      <span style="display: inline-block; margin-right: 12px; margin-top: 2px;">💡</span>
                      <div>
                        <h4 style="margin: 0 0 6px; font-size: 14px; font-weight: 600; color: #1e40af;">Quick Tip</h4>
                        <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.5;">You can manage this task, update its status, and collaborate with your team directly in the SSHE Scrum Management app.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center;">
                  <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">Best regards,<br><strong style="color: #374151;">SSHE Scrum Management Team</strong></p>
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.4;">
                    This is an automated notification. Please do not reply to this email.<br>
                    If you have any questions, please contact your project manager or system administrator.
                  </p>
                </div>
              </div>
            </body>
            </html>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send task assignment email:", emailError);
        }
      }
    }

    return NextResponse.json({
      task: completeTask,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Create task error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Task with this title already exists in the project" }, { status: 409 });
    }

    if (error.code === "P2003") {
      return NextResponse.json({ error: "Invalid project, assignee, or creator ID" }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
