import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id: projectId } = params;

    // Validate projectId parameter
    if (!projectId || typeof projectId !== "string" || projectId.trim().length === 0) {
      console.error(`Invalid projectId parameter:`, projectId);
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    console.log(`Fetching sprints for project: ${projectId}`);

    // First, verify that the project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId.trim() },
      select: { id: true, name: true },
    });

    if (!project) {
      console.error(`Project not found: ${projectId}`);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log(`Project found: ${project.name} (${project.id})`);

    // Get sprints for the project, include summary info only
    const sprints = await prisma.sprint.findMany({
      where: { projectId: project.id },
      orderBy: { startDate: "asc" },
      include: {
        tasks: {
          where: {
            projectId: project.id, // Only tasks from the same project
            sprintId: { not: null }, // Only tasks that are actually assigned to a sprint
          },
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
            sprintId: true, // Include sprintId for debugging
            projectId: true, // Include projectId for debugging
          },
        },
      },
    });

    console.log(`Found ${sprints.length} sprints for project ${project.name}`);

    // Debug: Log all tasks found across sprints
    const allTasksInSprints = sprints.flatMap((sprint) => sprint.tasks || []);
    allTasksInSprints.forEach((task) => {
      if (task.projectId !== project.id) {
        console.error(`Task belongs to different project! Expected: ${project.id}, Actual: ${task.projectId}`);
      }
    });

    // Map sprints with summary insights
    const sprintData = sprints.map((sprint) => {
      const now = new Date();

      // Only include tasks that belong to THIS specific sprint AND the correct project
      const sprintTasks = (sprint.tasks || []).filter((task) => {
        const belongsToSprint = task.sprintId === sprint.id;
        const belongsToProject = task.projectId === project.id;

        if (!belongsToSprint) {
          console.warn(`Task "${task.title}" belongs to different sprint: ${task.sprintId}`);
        }
        if (!belongsToProject) {
          console.error(`Task "${task.title}" belongs to different project: ${task.projectId}`);
        }

        return belongsToSprint && belongsToProject;
      });

      const tasks = sprintTasks.map((task) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE";
        return {
          id: task.id,
          title: task.title,
          status: task.status,
          dueDate: task.dueDate,
          isOverdue,
        };
      });

      const completed = tasks.filter((t) => t.status === "DONE").length;
      const overdue = tasks.filter((t) => t.isOverdue).length;
      const todo = tasks.filter((t) => t.status === "TODO").length;
      const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
      const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

      return {
        id: sprint.id,
        name: sprint.name,
        status: sprint.isActive ? "ACTIVE" : sprint.isCompleted ? "COMPLETED" : "PLANNING",
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        completionRate,
        totalTasks: tasks.length,
        completedTasks: completed,
        overdueTasks: overdue,
        todoTasks: todo,
        inProgressTasks: inProgress,
        tasks, // for detail view - only tasks assigned to this sprint
      };
    });

    return NextResponse.json({ sprints: sprintData });
  } catch (error) {
    console.error(`Error fetching sprints for project ${params?.id || "unknown"}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
