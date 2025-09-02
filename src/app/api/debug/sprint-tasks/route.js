import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  try {
    console.log(`🔍 [DEBUG] Starting sprint-task debug for project: ${projectId || "ALL"}`);

    // Get all projects if no specific project requested
    const projects = projectId ? await prisma.project.findMany({ where: { id: projectId } }) : await prisma.project.findMany();

    console.log(`📊 [DEBUG] Found ${projects.length} projects to analyze`);

    const debugInfo = [];

    for (const project of projects) {
      console.log(`\n🏢 [DEBUG] Analyzing project: ${project.name} (${project.id})`);

      // Get all sprints for this project
      const sprints = await prisma.sprint.findMany({
        where: { projectId: project.id },
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              projectId: true,
              sprintId: true,
            },
          },
        },
      });

      console.log(`📋 [DEBUG] Project has ${sprints.length} sprints`);

      // Get all tasks for this project (including those not assigned to sprints)
      const allProjectTasks = await prisma.task.findMany({
        where: { projectId: project.id },
        select: {
          id: true,
          title: true,
          status: true,
          projectId: true,
          sprintId: true,
        },
      });

      console.log(`📝 [DEBUG] Project has ${allProjectTasks.length} total tasks`);

      // Analyze task assignments
      const tasksWithSprints = allProjectTasks.filter((task) => task.sprintId !== null);
      const tasksWithoutSprints = allProjectTasks.filter((task) => task.sprintId === null);
      const tasksFromDifferentProjects = allProjectTasks.filter((task) => task.projectId !== project.id);

      console.log(`   ✅ Tasks with sprints: ${tasksWithSprints.length}`);
      console.log(`   📦 Tasks without sprints: ${tasksWithoutSprints.length}`);
      console.log(`   ⚠️  Tasks from different projects: ${tasksFromDifferentProjects.length}`);

      const sprintDetails = sprints.map((sprint) => {
        const sprintTasks = sprint.tasks || [];
        const correctTasks = sprintTasks.filter((task) => task.projectId === project.id && task.sprintId === sprint.id);
        const incorrectTasks = sprintTasks.filter((task) => task.projectId !== project.id || task.sprintId !== sprint.id);

        console.log(`   📋 Sprint "${sprint.name}": ${sprintTasks.length} tasks (${correctTasks.length} correct, ${incorrectTasks.length} incorrect)`);

        if (incorrectTasks.length > 0) {
          console.log(`   ❌ INCORRECT TASKS FOUND:`);
          incorrectTasks.forEach((task) => {
            console.log(`      - "${task.title}" (ID: ${task.id}, Project: ${task.projectId}, Sprint: ${task.sprintId})`);
          });
        }

        return {
          id: sprint.id,
          name: sprint.name,
          isActive: sprint.isActive,
          isCompleted: sprint.isCompleted,
          totalTasks: sprintTasks.length,
          correctTasks: correctTasks.length,
          incorrectTasks: incorrectTasks.length,
          tasks: sprintTasks.map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            projectId: task.projectId,
            sprintId: task.sprintId,
            isCorrect: task.projectId === project.id && task.sprintId === sprint.id,
          })),
        };
      });

      debugInfo.push({
        projectId: project.id,
        projectName: project.name,
        totalSprints: sprints.length,
        totalTasks: allProjectTasks.length,
        tasksWithSprints: tasksWithSprints.length,
        tasksWithoutSprints: tasksWithoutSprints.length,
        tasksFromDifferentProjects: tasksFromDifferentProjects.length,
        sprints: sprintDetails,
        unassignedTasks: tasksWithoutSprints.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          projectId: task.projectId,
          sprintId: task.sprintId,
        })),
      });
    }

    console.log(`✅ [DEBUG] Debug analysis complete`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      projectsAnalyzed: projects.length,
      debugInfo,
    });
  } catch (error) {
    console.error(`❌ [DEBUG] Error in sprint-task debug:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
