import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const sprintName = searchParams.get("sprintName");

    if (!projectId || !sprintName) {
      return NextResponse.json(
        { error: "Missing projectId or sprintName" },
        { status: 400 }
      );
    }

    // First find the sprint by name and project
    const sprint = await prisma.sprint.findFirst({
      where: {
        name: sprintName,
        projectId: projectId,
      },
    });

    if (!sprint) {
      return NextResponse.json({ 
        overdueCount: 0,
        totalTasks: 0,
        latestDueDate: null,
        sprintName,
        projectId 
      });
    }

    // Get all tasks for the specific sprint
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
        sprintId: sprint.id,
      },
    });

    // Count overdue tasks (not DONE and past due date)
    const now = new Date();
    const overdueCount = tasks.filter(task => {
      if (!task.dueDate || task.status === "DONE") return false;
      return new Date(task.dueDate) < now;
    }).length;

    // Find the latest due date in this sprint
    const latestDueDate = tasks.reduce((latest, task) => {
      if (!task.dueDate) return latest;
      const taskDueDate = new Date(task.dueDate);
      return !latest || taskDueDate > new Date(latest) ? task.dueDate : latest;
    }, null);

    return NextResponse.json({ 
      overdueCount,
      totalTasks: tasks.length,
      latestDueDate,
      sprintName,
      projectId 
    });

  } catch (error) {
    console.error("Error fetching overdue count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
