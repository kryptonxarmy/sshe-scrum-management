// Debug script to check tasks data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugTasks() {
  try {
    console.log('🔍 Debugging tasks...\n');

    // 1. Check if tasks exist at all
    const totalTasks = await prisma.task.count();
    console.log(`📊 Total tasks in database: ${totalTasks}`);

    // 2. Check if task_assignees table exists
    try {
      const totalAssignees = await prisma.taskAssignee.count();
      console.log(`👥 Total task assignees: ${totalAssignees}`);
    } catch (error) {
      console.log('❌ task_assignees table not found or error:', error.message);
    }

    // 3. Get sample tasks (without relations first)
    console.log('\n📋 Sample tasks (basic data):');
    const basicTasks = await prisma.task.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        projectId: true,
      }
    });
    console.log(basicTasks);

    // 4. Try to get tasks with taskAssignees relation
    console.log('\n👥 Trying tasks with taskAssignees relation:');
    try {
      const tasksWithAssignees = await prisma.task.findMany({
        take: 3,
        include: {
          taskAssignees: {
            include: {
              user: true,
            },
          },
        }
      });
      console.log('✅ Tasks with assignees:', tasksWithAssignees.length);
    } catch (error) {
      console.log('❌ Error getting tasks with assignees:', error.message);
    }

    // 5. Check specific project tasks
    console.log('\n🏗️ Tasks by project:');
    const projects = await prisma.project.findMany({
      take: 3,
      select: { id: true, name: true }
    });
    
    for (const project of projects) {
      const projectTasks = await prisma.task.count({
        where: { projectId: project.id }
      });
      console.log(`Project ${project.name}: ${projectTasks} tasks`);
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTasks();
