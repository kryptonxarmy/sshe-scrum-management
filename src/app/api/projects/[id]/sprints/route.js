import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const { projectId } = params;
  try {
    // Get sprints for the project
    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      orderBy: { startDate: "asc" },
      include: {
        tasks: {
          include: {
            assignees: true,
          },
        },
      },
    });

    // Map sprints with insights and overdue detection
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
      const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      const backlogCandidates = tasks.filter((t) => t.isOverdue && t.status !== "DONE").length;
      return {
        id: sprint.id,
        name: sprint.name,
        status: sprint.isActive ? "ACTIVE" : sprint.isCompleted ? "COMPLETED" : "PLANNING",
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        completionRate,
        tasks,
        backlogCandidates,
        overdue,
      };
    });

    return NextResponse.json({ sprints: sprintData });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
