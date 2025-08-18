import { NextResponse } from "next/server";
import { projectOperations, taskOperations } from "@/lib/prisma";

// Helper function to calculate average completion time
function calculateAverageCompletionTime(tasks) {
  const completedTasks = tasks.filter(task => 
    task.status === 'DONE' && 
    task.createdAt && 
    task.completedAt
  );

  if (completedTasks.length === 0) return 0;

  const totalDays = completedTasks.reduce((sum, task) => {
    const startDate = new Date(task.createdAt);
    const endDate = new Date(task.completedAt);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / completedTasks.length);
}

// Helper function to generate assignee performance data
function generateAssigneePerformance(tasks) {
  const assigneeStats = {};
  
  // Group tasks by assignee
  tasks.forEach(task => {
    if (!task.assignee) return;
    
    const assigneeId = task.assignee.id;
    if (!assigneeStats[assigneeId]) {
      assigneeStats[assigneeId] = {
        assignee: task.assignee,
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 0,
          overdueTasks: 0,
          completionRate: 0,
          avgCompletionDays: 0,
          totalStoryPoints: 0,
          completedStoryPoints: 0,
          productivityScore: 0
        },
        performance: {
          rating: 'Average',
          trend: 'stable',
          strengths: [],
          improvements: []
        }
      };
    }
    
    const stats = assigneeStats[assigneeId].metrics;
    stats.totalTasks++;
    stats.totalStoryPoints += task.storyPoints || 0;
    
    if (task.status === 'DONE') {
      stats.completedTasks++;
      stats.completedStoryPoints += task.storyPoints || 0;
    } else if (task.status === 'IN_PROGRESS') {
      stats.inProgressTasks++;
    } else if (task.status === 'TODO') {
      stats.todoTasks++;
    }
    
    // Check if task is overdue
    if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE') {
      stats.overdueTasks++;
    }
  });
  
  // Calculate performance metrics and ratings
  Object.values(assigneeStats).forEach(assigneeData => {
    const { metrics } = assigneeData;
    
    // Calculate completion rate
    metrics.completionRate = metrics.totalTasks > 0 
      ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) 
      : 0;
    
    // Calculate average completion time for completed tasks
    const completedTasks = tasks.filter(task => 
      task.assignee?.id === assigneeData.assignee.id && 
      task.status === 'DONE' && 
      task.createdAt && 
      task.completedAt
    );
    
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const startDate = new Date(task.createdAt);
        const endDate = new Date(task.completedAt);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      metrics.avgCompletionDays = Math.round(totalDays / completedTasks.length);
    }
    
    // Calculate productivity score (0-100)
    let productivityScore = 0;
    productivityScore += metrics.completionRate * 0.4; // 40% weight on completion rate
    productivityScore += Math.max(0, (100 - metrics.avgCompletionDays * 5)) * 0.3; // 30% weight on speed
    productivityScore += Math.max(0, (100 - metrics.overdueTasks * 10)) * 0.2; // 20% weight on meeting deadlines
    productivityScore += (metrics.completedStoryPoints / Math.max(1, metrics.totalStoryPoints)) * 100 * 0.1; // 10% weight on story points
    
    metrics.productivityScore = Math.round(Math.min(100, productivityScore));
    
    // Determine performance rating
    if (metrics.productivityScore >= 90) {
      assigneeData.performance.rating = 'Excellent';
      assigneeData.performance.trend = 'up';
    } else if (metrics.productivityScore >= 75) {
      assigneeData.performance.rating = 'Good';
      assigneeData.performance.trend = 'up';
    } else if (metrics.productivityScore >= 60) {
      assigneeData.performance.rating = 'Average';
      assigneeData.performance.trend = 'stable';
    } else if (metrics.productivityScore >= 40) {
      assigneeData.performance.rating = 'Below Average';
      assigneeData.performance.trend = 'down';
    } else {
      assigneeData.performance.rating = 'Poor';
      assigneeData.performance.trend = 'down';
    }
    
    // Generate strengths and improvements
    const strengths = [];
    const improvements = [];
    
    if (metrics.completionRate >= 80) {
      strengths.push('High task completion rate');
    } else if (metrics.completionRate < 50) {
      improvements.push('Improve task completion consistency');
    }
    
    if (metrics.avgCompletionDays <= 5) {
      strengths.push('Fast task turnaround time');
    } else if (metrics.avgCompletionDays > 10) {
      improvements.push('Focus on faster task delivery');
    }
    
    if (metrics.overdueTasks === 0) {
      strengths.push('Excellent deadline management');
    } else if (metrics.overdueTasks > 2) {
      improvements.push('Better time management needed');
    }
    
    if (metrics.completedStoryPoints >= metrics.totalStoryPoints * 0.8) {
      strengths.push('Strong story point delivery');
    } else if (metrics.completedStoryPoints < metrics.totalStoryPoints * 0.5) {
      improvements.push('Focus on completing assigned work');
    }
    
    // Default messages if no specific strengths/improvements found
    if (strengths.length === 0) {
      strengths.push('Consistent team contributor', 'Reliable task execution');
    }
    if (improvements.length === 0) {
      improvements.push('Continue current performance', 'Explore new skill areas');
    }
    
    assigneeData.performance.strengths = strengths;
    assigneeData.performance.improvements = improvements;
  });
  
  // Sort by productivity score (highest first)
  return Object.values(assigneeStats).sort((a, b) => 
    b.metrics.productivityScore - a.metrics.productivityScore
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get all projects owned by this user
    const projects = await projectOperations.getByOwnerId(userId);

    if (projects.length === 0) {
      return NextResponse.json({
        message: "No projects found for this user",
        data: {
          projectOverview: [],
          taskDistribution: [],
          performanceMetrics: {},
          sprintProgress: [],
          teamProductivity: [],
          priorityBreakdown: [],
          completionTrends: [],
          assigneePerformance: []
        }
      });
    }

    const projectIds = projects.map(p => p.id);

    // Get all tasks for these projects
    const allTasks = await taskOperations.getByProjectIds(projectIds);

    // Calculate project overview metrics
    const projectOverview = projects.map(project => {
      const projectTasks = allTasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'DONE').length;
      const inProgressTasks = projectTasks.filter(task => task.status === 'IN_PROGRESS').length;
      const todoTasks = projectTasks.filter(task => task.status === 'TODO').length;
      const totalTasks = projectTasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        priority: project.priority,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionRate,
        startDate: project.startDate,
        endDate: project.endDate,
        department: project.department
      };
    });

    // Task status distribution across all projects
    const taskDistribution = [
      { 
        name: 'To Do', 
        value: allTasks.filter(task => task.status === 'TODO').length,
        color: '#ef4444',
        percentage: Math.round((allTasks.filter(task => task.status === 'TODO').length / allTasks.length) * 100) || 0
      },
      { 
        name: 'In Progress', 
        value: allTasks.filter(task => task.status === 'IN_PROGRESS').length,
        color: '#f59e0b',
        percentage: Math.round((allTasks.filter(task => task.status === 'IN_PROGRESS').length / allTasks.length) * 100) || 0
      },
      { 
        name: 'In Review', 
        value: allTasks.filter(task => task.status === 'IN_REVIEW').length,
        color: '#3b82f6',
        percentage: Math.round((allTasks.filter(task => task.status === 'IN_REVIEW').length / allTasks.length) * 100) || 0
      },
      { 
        name: 'Done', 
        value: allTasks.filter(task => task.status === 'DONE').length,
        color: '#10b981',
        percentage: Math.round((allTasks.filter(task => task.status === 'DONE').length / allTasks.length) * 100) || 0
      },
      { 
        name: 'Blocked', 
        value: allTasks.filter(task => task.status === 'BLOCKED').length,
        color: '#dc2626',
        percentage: Math.round((allTasks.filter(task => task.status === 'BLOCKED').length / allTasks.length) * 100) || 0
      }
    ].filter(item => item.value > 0);

    // Priority breakdown
    const priorityBreakdown = [
      { 
        name: 'Critical', 
        value: allTasks.filter(task => task.priority === 'CRITICAL').length,
        color: '#dc2626'
      },
      { 
        name: 'High', 
        value: allTasks.filter(task => task.priority === 'HIGH').length,
        color: '#ea580c'
      },
      { 
        name: 'Medium', 
        value: allTasks.filter(task => task.priority === 'MEDIUM').length,
        color: '#d97706'
      },
      { 
        name: 'Low', 
        value: allTasks.filter(task => task.priority === 'LOW').length,
        color: '#65a30d'
      }
    ].filter(item => item.value > 0);

    // Performance metrics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'DONE').length;
    const overdueTasks = allTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
    ).length;
    const avgCompletionTime = calculateAverageCompletionTime(allTasks);

    const performanceMetrics = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      overdueTasks,
      avgCompletionTime,
      totalStoryPoints: allTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0),
      completedStoryPoints: allTasks
        .filter(task => task.status === 'DONE')
        .reduce((sum, task) => sum + (task.storyPoints || 0), 0)
    };

    // Team productivity by project
    const teamProductivity = projects.map(project => {
      const projectTasks = allTasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'DONE').length;
      const totalTasks = projectTasks.length;
      
      return {
        projectName: project.name,
        totalTasks,
        completedTasks,
        productivity: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };
    });

    // Sprint burndown data (last 30 days)
    const sprintBurndown = generateSprintBurndown(allTasks);

    // Release tracking data
    const releaseTracking = generateReleaseTracking(projects, allTasks);

    // Completion trends (last 7 days)
    const completionTrends = generateCompletionTrends(allTasks);

    // Assignee performance data
    const assigneePerformance = generateAssigneePerformance(allTasks);

    return NextResponse.json({
      success: true,
      data: {
        projectOverview,
        taskDistribution,
        performanceMetrics,
        sprintBurndown,
        releaseTracking,
        teamProductivity,
        priorityBreakdown,
        completionTrends,
        assigneePerformance
      }
    });

  } catch (error) {
    console.error("Error fetching project owner reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}

// Helper function to generate sprint burndown data
function generateSprintBurndown(tasks) {
  const today = new Date();
  const sprintData = [];
  
  // Generate data for last 14 days (2 weeks sprint)
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Calculate remaining tasks on this date
    const remainingTasks = tasks.filter(task => {
      if (task.status === 'DONE' && task.completedAt) {
        return new Date(task.completedAt) > date;
      }
      return task.status !== 'DONE';
    }).length;

    // Calculate ideal burndown line
    const totalTasks = tasks.length;
    const idealRemaining = Math.max(0, totalTasks - ((totalTasks / 14) * (14 - i)));

    sprintData.push({
      date: date.toISOString().split('T')[0],
      remaining: remainingTasks,
      ideal: Math.round(idealRemaining)
    });
  }
  
  return sprintData;
}

// Helper function to generate release tracking data
function generateReleaseTracking(projects, tasks) {
  const releaseData = [];
  const today = new Date();
  
  // Generate data for last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Calculate planned vs actual completion
    const totalTasks = tasks.length;
    const completedByDate = tasks.filter(task => 
      task.status === 'DONE' && 
      task.completedAt && 
      new Date(task.completedAt) <= date
    ).length;
    
    // Planned is linear progression
    const plannedPercentage = Math.min(100, ((30 - i) / 30) * 100);
    const actualPercentage = totalTasks > 0 ? (completedByDate / totalTasks) * 100 : 0;
    
    releaseData.push({
      date: date.toISOString().split('T')[0],
      planned: Math.round(plannedPercentage),
      actual: Math.round(actualPercentage)
    });
  }
  
  return releaseData;
}

// Helper function to generate completion trends
function generateCompletionTrends(tasks) {
  const trends = [];
  const today = new Date();
  
  // Generate data for last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const completedOnDay = tasks.filter(task => 
      task.status === 'DONE' && 
      task.completedAt && 
      new Date(task.completedAt) >= startOfDay &&
      new Date(task.completedAt) <= endOfDay
    ).length;
    
    trends.push({
      date: date.toISOString().split('T')[0],
      completed: completedOnDay
    });
  }
  
  return trends;
}
