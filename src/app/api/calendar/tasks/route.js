import { NextResponse } from "next/server";
import { taskOperations, projectOperations, prisma } from "@/lib/prisma";

// GET /api/calendar/tasks - Get tasks for calendar with specific filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const filter = searchParams.get("filter"); // "ALL_TASKS", "MY_TASKS", "PROJECT_TASKS"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log("[API/calendar/tasks] GET called", { userId, filter });

    let tasks = [];

    switch (filter) {
      case "MY_TASKS":
        // Get only tasks assigned to the user
        tasks = await prisma.task.findMany({
          where: {
            assignees: {
              some: {
                userId: userId,
              },
            },
            isArchived: false,
          },
          include: {
            project: {
              include: {
                owner: true,
                scrumMaster: true,
              },
            },
            assignees: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            function: true,
            sprint: true,
            _count: {
              select: {
                comments: true,
                taskAttachments: true,
              },
            },
          },
          orderBy: {
            dueDate: "asc",
          },
        });
        break;

      case "PROJECT_TASKS":
        // Get all tasks from projects where user is involved
        const userProjects = await projectOperations.getUserProjects(userId);
        const projectIds = userProjects.map((p) => p.id);

        if (projectIds.length === 0) {
          tasks = [];
        } else {
          tasks = await prisma.task.findMany({
            where: {
              projectId: {
                in: projectIds,
              },
              isArchived: false,
            },
            include: {
              project: {
                include: {
                  owner: true,
                  scrumMaster: true,
                },
              },
              assignees: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              function: true,
              sprint: true,
              _count: {
                select: {
                  comments: true,
                  taskAttachments: true,
                },
              },
            },
            orderBy: {
              dueDate: "asc",
            },
          });
        }
        break;

      case "ALL_TASKS":
      default:
        // Get tasks from projects where user is involved (owner, scrum master, or member)
        // Plus tasks assigned to the user
        const allUserProjects = await projectOperations.getUserProjects(userId);
        const allProjectIds = allUserProjects.map((p) => p.id);

        tasks = await prisma.task.findMany({
          where: {
            OR: [
              // Tasks from user's projects
              {
                projectId: {
                  in: allProjectIds,
                },
              },
              // Tasks assigned to user (even from other projects)
              {
                assignees: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
            isArchived: false,
          },
          include: {
            project: {
              include: {
                owner: true,
                scrumMaster: true,
              },
            },
            assignees: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            function: true,
            sprint: true,
            _count: {
              select: {
                comments: true,
                taskAttachments: true,
              },
            },
          },
          orderBy: {
            dueDate: "asc",
          },
        });
        break;
    }

    // Remove duplicates if any (in case task is both assigned to user and in their project)
    const uniqueTasks = tasks.reduce((acc, current) => {
      const exists = acc.find((task) => task.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`[API/calendar/tasks] Returning ${uniqueTasks.length} tasks for filter: ${filter}`);

    return NextResponse.json({
      tasks: uniqueTasks,
      filter: filter,
      count: uniqueTasks.length,
    });
  } catch (error) {
    console.error("Get calendar tasks error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
