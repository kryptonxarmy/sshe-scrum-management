import { NextResponse } from "next/server";
import { projectOperations, taskOperations } from "@/lib/prisma";

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

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');
		console.log('[TeamMemberReport] userId:', userId);
		if (!userId) {
			return NextResponse.json({ error: "User ID is required" }, { status: 400 });
		}

		// Get all tasks assigned to this user (or created by them)
		const rawTasks = await taskOperations.getByUserId(userId);
		console.log('[TeamMemberReport] rawTasks:', Array.isArray(rawTasks) ? rawTasks.length : rawTasks);
		if (!rawTasks || rawTasks.length === 0) {
			return NextResponse.json({
				message: "No assigned tasks found for this user",
				data: {
					projectOverview: [],
					taskDistribution: [],
					performanceMetrics: {},
					priorityBreakdown: [],
					completionTrends: [],
					allTasks: []
				}
			});
		}

		// Build unique projects array from assigned tasks
		const projectMap = {};
		rawTasks.forEach(task => {
			if (task.project && task.project.id) {
				projectMap[task.project.id] = task.project;
			}
		});
		const projects = Object.values(projectMap);

		// Map tasks to always include required fields for frontend
		const allTasks = rawTasks.map(task => {
			let assignee = null;
			if (task.assignee) {
				assignee = {
					id: task.assignee.id,
					name: task.assignee.name || task.assignee.email,
					avatarUrl: task.assignee.avatarUrl || '',
				};
			} else if (Array.isArray(task.assignees) && task.assignees.length > 0 && task.assignees[0].user) {
				assignee = {
					id: task.assignees[0].user.id,
					name: task.assignees[0].user.name || task.assignees[0].user.email,
					avatarUrl: task.assignees[0].user.avatarUrl || '',
				};
			}
			return {
				id: task.id,
				title: task.title || '(untitled)',
				status: task.status,
				priority: task.priority || null,
				assignee,
				dueDate: task.dueDate || null,
				completedAt: task.completedAt || null,
				activityLog: Array.isArray(task.activityLogs) ? task.activityLogs : [],
				project: task.project ? { name: task.project.name } : null,
				projectId: task.projectId || (task.project && task.project.id) || null,
			};
		});

		// Calculate project overview metrics
		const projectOverview = projects.map(project => {
			const projectTasks = allTasks.filter(task => task.projectId === project.id);
			const completedTasks = projectTasks.filter(task => task.status === 'DONE').length;
			const inProgressTasks = projectTasks.filter(task => task.status === 'IN_PROGRESS').length;
			const todoTasks = projectTasks.filter(task => task.status === 'TODO').length;
			const overdueTasks = projectTasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE').length;
			const totalTasks = projectTasks.length;
			const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
			const velocityData = [
				{ completed: completedTasks },
				{ completed: Math.max(0, completedTasks - 1) },
				{ completed: Math.max(0, completedTasks - 2) }
			];
			return {
				id: project.id,
				name: project.name,
				status: project.status,
				priority: project.priority,
				totalTasks,
				completedTasks,
				inProgressTasks,
				todoTasks,
				overdueTasks,
				completionRate,
				velocityData,
				startDate: project.startDate,
				endDate: project.endDate,
				department: project.department,
				scrumMasterName: project.scrumMaster ? project.scrumMaster.name : "N/A"
			};
		});

		// Task status distribution
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

		// Completion trends (last 7 days)
		const completionTrends = [];
		const today = new Date();
		for (let i = 6; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);
			const completedOnDay = allTasks.filter(task =>
				task.status === 'DONE' &&
				task.completedAt &&
				new Date(task.completedAt) >= startOfDay &&
				new Date(task.completedAt) <= endOfDay
			).length;
			completionTrends.push({
				date: date.toISOString().split('T')[0],
				completed: completedOnDay
			});
		}

		return NextResponse.json({
			success: true,
			data: {
				projectOverview,
				taskDistribution,
				performanceMetrics,
				priorityBreakdown,
				completionTrends,
				allTasks
			}
		});
	} catch (error) {
		console.error("Error fetching team member reports:", error);
		return NextResponse.json(
			{ error: "Failed to fetch report data" },
			{ status: 500 }
		);
	}
}
