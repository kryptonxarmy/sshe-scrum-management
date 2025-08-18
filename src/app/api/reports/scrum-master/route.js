import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to calculate task completion rate
function calculateCompletionRate(tasks) {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'DONE').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

// Helper function to calculate average completion time
function calculateAvgCompletionTime(tasks) {
  const completedTasks = tasks.filter(task => 
    task.status === 'DONE' && task.completedAt && task.createdAt
  );
  
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((acc, task) => {
    const completedAt = new Date(task.completedAt);
    const createdAt = new Date(task.createdAt);
    const timeDiff = completedAt - createdAt;
    return acc + timeDiff;
  }, 0);
  
  const avgTime = totalTime / completedTasks.length;
  return Math.round(avgTime / (1000 * 60 * 60 * 24)); // Convert to days
}

// Helper function to get task distribution by status
function getTaskDistribution(tasks) {
  const distribution = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
    BLOCKED: 0
  };
  
  tasks.forEach(task => {
    if (distribution.hasOwnProperty(task.status)) {
      distribution[task.status]++;
    }
  });
  
  return distribution;
}

// Helper function to calculate productivity score
function calculateProductivityScore(tasks, totalDays = 30) {
  const completedTasks = tasks.filter(task => {
    if (task.status !== 'DONE' || !task.completedAt) return false;
    const completedAt = new Date(task.completedAt);
    const thirtyDaysAgo = new Date(Date.now() - (totalDays * 24 * 60 * 60 * 1000));
    return completedAt >= thirtyDaysAgo;
  });
  
  const storyPoints = completedTasks.reduce((acc, task) => acc + (task.storyPoints || 1), 0);
  return Math.round(storyPoints / totalDays * 7); // Weekly average
}

// GET /api/reports/scrum-master
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user and verify they are scrum master
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'SCRUM_MASTER') {
      return NextResponse.json(
        { error: 'Access denied. Only Scrum Masters can access this report.' },
        { status: 403 }
      );
    }

    // Get projects where user is a member (as scrum master)
    let projectsQuery = {
      members: {
        some: {
          userId: userId
        }
      }
    };

    // If specific project is requested
    if (projectId) {
      projectsQuery.id = projectId;
    }

    const projects = await prisma.project.findMany({
      where: projectsQuery,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            createdBy: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    if (projects.length === 0) {
      return NextResponse.json({
        success: true,
        projects: [],
        teamPerformance: [],
        projectsSummary: {
          totalProjects: 0,
          totalTasks: 0,
          totalMembers: 0,
          avgCompletionRate: 0
        }
      });
    }

    // Calculate team performance for each project
    const teamPerformance = [];
    let totalTasks = 0;
    let totalMembers = 0;
    let totalCompletionRates = 0;

    projects.forEach(project => {
      const projectTasks = project.tasks;
      totalTasks += projectTasks.length;
      totalMembers += project.members.length;

      // Group tasks by assignee
      const tasksByAssignee = {};
      projectTasks.forEach(task => {
        if (task.assignee) {
          const assigneeId = task.assignee.id;
          if (!tasksByAssignee[assigneeId]) {
            tasksByAssignee[assigneeId] = {
              user: task.assignee,
              tasks: []
            };
          }
          tasksByAssignee[assigneeId].tasks.push(task);
        }
      });

      // Calculate performance metrics for each team member
      Object.values(tasksByAssignee).forEach(({ user, tasks }) => {
        const completionRate = calculateCompletionRate(tasks);
        const avgCompletionTime = calculateAvgCompletionTime(tasks);
        const taskDistribution = getTaskDistribution(tasks);
        const productivityScore = calculateProductivityScore(tasks);
        
        totalCompletionRates += completionRate;

        teamPerformance.push({
          projectId: project.id,
          projectName: project.name,
          user: user,
          metrics: {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'DONE').length,
            inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
            todoTasks: tasks.filter(t => t.status === 'TODO').length,
            blockedTasks: tasks.filter(t => t.status === 'BLOCKED').length,
            completionRate: completionRate,
            avgCompletionTime: avgCompletionTime,
            productivityScore: productivityScore,
            taskDistribution: taskDistribution
          }
        });
      });
    });

    // Calculate project summary
    const projectsSummary = {
      totalProjects: projects.length,
      totalTasks: totalTasks,
      totalMembers: totalMembers,
      avgCompletionRate: teamPerformance.length > 0 
        ? Math.round(totalCompletionRates / teamPerformance.length) 
        : 0
    };

    // Calculate team statistics
    const teamStats = {
      highPerformers: teamPerformance.filter(tp => tp.metrics.completionRate >= 80).length,
      averagePerformers: teamPerformance.filter(tp => tp.metrics.completionRate >= 50 && tp.metrics.completionRate < 80).length,
      needsAttention: teamPerformance.filter(tp => tp.metrics.completionRate < 50).length,
      mostProductiveMember: teamPerformance.length > 0 
        ? teamPerformance.reduce((max, tp) => 
            tp.metrics.productivityScore > (max?.metrics.productivityScore || 0) ? tp : max
          )
        : null
    };

    // Calculate project-wise performance
    const projectPerformance = projects.map(project => {
      const projectTasks = project.tasks;
      const completionRate = calculateCompletionRate(projectTasks);
      const taskDistribution = getTaskDistribution(projectTasks);
      
      return {
        id: project.id,
        name: project.name,
        owner: project.owner,
        totalTasks: projectTasks.length,
        completionRate: completionRate,
        taskDistribution: taskDistribution,
        memberCount: project.members.length,
        performance: completionRate >= 80 ? 'high' : completionRate >= 50 ? 'medium' : 'low'
      };
    });

    return NextResponse.json({
      success: true,
      projects: projects,
      teamPerformance: teamPerformance,
      projectPerformance: projectPerformance,
      projectsSummary: projectsSummary,
      teamStats: teamStats
    });

  } catch (error) {
    console.error('Get scrum master reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
