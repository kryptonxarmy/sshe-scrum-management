import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const { projectId } = params;
  try {
    // Get sprints for the project, include summary info only
    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      orderBy: { startDate: "asc" },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });

    // Map sprints with summary insights
    const sprintData = sprints.map((sprint) => {
      const now = new Date();
      const tasks = (sprint.tasks || []).map((task) => {
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
        tasks, // for detail view
      };
    });

    return NextResponse.json({ sprints: sprintData });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
