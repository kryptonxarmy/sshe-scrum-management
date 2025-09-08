import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTaskNotification } from "@/lib/email";

export async function POST(req) {
  try {
    const { 
      sprintId, 
      projectId, 
      scrumMasterId, 
      projectOwnerId,
      summary 
    } = await req.json();

    // Validate required fields
    if (!sprintId || !projectId || !scrumMasterId || !projectOwnerId || !summary) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get full details from database
    const [sprint, project, scrumMaster, projectOwner] = await Promise.all([
      prisma.sprint.findUnique({
        where: { id: sprintId },
        include: {
          tasks: {
            include: {
              assignees: {
                include: { user: true }
              }
            }
          }
        }
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          owner: true
        }
      }),
      prisma.user.findUnique({
        where: { id: scrumMasterId }
      }),
      prisma.user.findUnique({
        where: { id: projectOwnerId }
      })
    ]);

    if (!sprint || !project || !scrumMaster || !projectOwner) {
      return NextResponse.json(
        { error: "Sprint, project, scrum master, or project owner not found" },
        { status: 404 }
      );
    }

    // Format tasks by status
    const tasksByStatus = {
      DONE: sprint.tasks.filter(task => task.status === "DONE"),
      IN_PROGRESS: sprint.tasks.filter(task => task.status === "IN_PROGRESS"),
      TODO: sprint.tasks.filter(task => task.status === "TODO")
    };

    // Create email content
    const emailSubject = `[SSHE Scrum] Sprint Report: ${summary.sprintName} - ${summary.projectName} <do_not_reply>`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sprint Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            background-color: #f8fafc;
          }
          .email-container { 
            max-width: 900px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 16px; 
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); 
            overflow: hidden;
          }
          
          /* Header */
          .header { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="80" r="2.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="1.2" fill="rgba(255,255,255,0.1)"/></svg>');
            pointer-events: none;
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 800; 
            margin-bottom: 12px; 
            letter-spacing: -0.8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
          }
          .header .subtitle { 
            font-size: 18px; 
            opacity: 0.95; 
            margin-bottom: 25px;
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
          }
          .sprint-info { 
            background: rgba(255, 255, 255, 0.15); 
            border-radius: 16px; 
            padding: 25px; 
            margin-top: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 1;
          }
          .sprint-info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            text-align: left;
          }
          .info-item { margin-bottom: 8px; }
          .info-label { font-weight: 700; opacity: 0.85; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-value { font-size: 17px; margin-top: 4px; font-weight: 600; }
          
          /* Content */
          .content { padding: 40px 30px; }
          
          /* Stats Section */
          .stats-section { margin-bottom: 40px; }
          .section-title { 
            font-size: 22px; 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          }
          .section-title::before {
            content: '';
            width: 5px;
            height: 28px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
            border-radius: 3px;
            margin-right: 15px;
          }
          
          .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); 
            gap: 20px; 
            margin-bottom: 25px;
          }
          .stat-card { 
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); 
            border: 2px solid #e2e8f0;
            padding: 28px 24px; 
            border-radius: 16px; 
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--card-color, #3b82f6);
          }
          .stat-card:hover { 
            transform: translateY(-4px); 
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
            border-color: var(--card-color, #3b82f6);
          }
          .stat-number { 
            font-size: 36px; 
            font-weight: 900; 
            margin-bottom: 10px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          .stat-label { 
            font-size: 13px; 
            color: #6b7280; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          .stat-total { color: #3b82f6; }
          .stat-completed { color: #10b981; }
          .stat-progress { color: #f59e0b; }
          .stat-todo { color: #6b7280; }
          .stat-overdue { color: #ef4444; }
          
          /* Completion Bar */
          .completion-section { 
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
            padding: 25px; 
            border-radius: 16px; 
            border: 2px solid #0ea5e9;
            position: relative;
            overflow: hidden;
          }
          .completion-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0ea5e9 0%, #06b6d4 100%);
          }
          .completion-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 12px;
          }
          .completion-label { 
            font-weight: 600; 
            color: #374151; 
            font-size: 16px;
          }
          .completion-percentage { 
            font-weight: 700; 
            font-size: 18px; 
            color: #10b981;
          }
          .completion-bar { 
            width: 100%; 
            height: 16px; 
            background: rgba(255, 255, 255, 0.8); 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #cbd5e1;
          }
          .completion-fill { 
            height: 100%; 
            background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%); 
            transition: width 0.5s ease;
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
          }
          
          /* Tasks Section */
          .tasks-section { margin-top: 40px; }
          .tasks-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 25px; 
            margin-top: 25px;
          }
          .task-column { 
            background: #ffffff; 
            border: 2px solid #e5e7eb; 
            border-radius: 16px; 
            overflow: hidden;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
          }
          .task-column:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          }
          .task-column-header { 
            padding: 20px 24px; 
            font-weight: 700; 
            font-size: 17px;
            border-bottom: 2px solid rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .header-completed { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; }
          .header-progress { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; }
          .header-todo { background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); color: #374151; }
          .header-overdue { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #991b1b; }
          
          .task-list { padding: 24px; min-height: 140px; }
          .task-item { 
            padding: 16px 0; 
            border-bottom: 1px solid #f3f4f6;
            transition: all 0.2s ease;
          }
          .task-item:hover {
            background: #f9fafb;
            margin: 0 -12px;
            padding-left: 12px;
            padding-right: 12px;
            border-radius: 8px;
          }
          .task-item:last-child { border-bottom: none; }
          .task-title { 
            font-weight: 700; 
            color: #111827; 
            margin-bottom: 8px; 
            font-size: 15px;
            line-height: 1.5;
          }
          .task-assignees { 
            font-size: 12px; 
            color: #6b7280; 
            margin-bottom: 4px;
            display: flex;
            align-items: center;
          }
          .task-description { 
            font-size: 12px; 
            color: #9ca3af; 
            line-height: 1.4;
          }
          .task-due-date { 
            font-size: 12px; 
            color: #ef4444; 
            font-weight: 600;
            margin-bottom: 4px;
          }
          .empty-state { 
            text-align: center; 
            color: #9ca3af; 
            font-style: italic; 
            padding: 50px 20px;
            font-size: 15px;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 12px;
            margin: 8px;
          }
          
          /* Footer */
          .footer { 
            background: #f8fafc; 
            border-top: 1px solid #e5e7eb; 
            padding: 30px; 
            text-align: center;
          }
          .footer-text { 
            font-size: 14px; 
            color: #6b7280; 
            line-height: 1.6;
          }
          .footer-contact { 
            font-weight: 600; 
            color: #374151; 
            margin-top: 8px;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .email-container { margin: 10px; border-radius: 12px; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .stats-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; }
            .tasks-grid { grid-template-columns: 1fr; gap: 20px; }
            .sprint-info-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <h1>� Sprint Completion Report</h1>
            <div class="subtitle">SSHE Scrum Management System</div>
            
            <div class="sprint-info">
              <div class="sprint-info-grid">
                <div class="info-item">
                  <div class="info-label">Sprint</div>
                  <div class="info-value">${summary.sprintName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Project</div>
                  <div class="info-value">${summary.projectName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Scrum Master</div>
                  <div class="info-value">${scrumMaster.name}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Period</div>
                  <div class="info-value">${new Date(summary.startDate).toLocaleDateString()} - ${new Date(summary.endDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Stats Section -->
            <div class="stats-section">
              <h2 class="section-title">📈 Sprint Overview</h2>
              
              <div class="stats-grid">
                <div class="stat-card" style="--card-color: #3b82f6;">
                  <div class="stat-number stat-total">${summary.stats.total}</div>
                  <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-card" style="--card-color: #10b981;">
                  <div class="stat-number stat-completed">${summary.stats.completed}</div>
                  <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card" style="--card-color: #f59e0b;">
                  <div class="stat-number stat-progress">${summary.stats.inProgress}</div>
                  <div class="stat-label">In Progress</div>
                </div>
                <div class="stat-card" style="--card-color: #6b7280;">
                  <div class="stat-number stat-todo">${summary.stats.todo}</div>
                  <div class="stat-label">To Do</div>
                </div>
                <div class="stat-card" style="--card-color: #ef4444;">
                  <div class="stat-number stat-overdue">${summary.stats.overdueCount || 0}</div>
                  <div class="stat-label">Overdue</div>
                </div>
              </div>
              
              <!-- Completion Bar -->
              <div class="completion-section">
                <div class="completion-header">
                  <span class="completion-label">🎯 Sprint Progress</span>
                  <span class="completion-percentage">${summary.stats.completionRate}%</span>
                </div>
                <div class="completion-bar">
                  <div class="completion-fill" style="width: ${summary.stats.completionRate}%"></div>
                </div>
              </div>
            </div>

            <!-- Tasks Section -->
            <div class="tasks-section">
              <h2 class="section-title">📋 Task Breakdown</h2>
              
              <div class="tasks-grid">
                <!-- Completed Tasks -->
                <div class="task-column">
                  <div class="task-column-header header-completed">
                    ✅ Completed Tasks (${tasksByStatus.DONE.length})
                  </div>
                  <div class="task-list">
                    ${tasksByStatus.DONE.length > 0 ? 
                      tasksByStatus.DONE.map(task => `
                        <div class="task-item">
                          <div class="task-title">${task.title}</div>
                          ${task.assignees.length > 0 ? `<div class="task-assignees">👤 ${task.assignees.map(a => a.user.name).join(', ')}</div>` : ''}
                          ${task.description ? `<div class="task-description">${task.description.replace(/<[^>]*>/g, '').substring(0, 80)}${task.description.length > 80 ? '...' : ''}</div>` : ''}
                        </div>
                      `).join('') 
                      : '<div class="empty-state">🎉 No completed tasks yet</div>'
                    }
                  </div>
                </div>

                <!-- In Progress Tasks -->
                <div class="task-column">
                  <div class="task-column-header header-progress">
                    🔄 In Progress (${tasksByStatus.IN_PROGRESS.length})
                  </div>
                  <div class="task-list">
                    ${tasksByStatus.IN_PROGRESS.length > 0 ? 
                      tasksByStatus.IN_PROGRESS.map(task => `
                        <div class="task-item">
                          <div class="task-title">${task.title}</div>
                          ${task.assignees.length > 0 ? `<div class="task-assignees">👤 ${task.assignees.map(a => a.user.name).join(', ')}</div>` : ''}
                          ${task.description ? `<div class="task-description">${task.description.replace(/<[^>]*>/g, '').substring(0, 80)}${task.description.length > 80 ? '...' : ''}</div>` : ''}
                        </div>
                      `).join('') 
                      : '<div class="empty-state">⚡ No tasks in progress</div>'
                    }
                  </div>
                </div>

                <!-- TODO Tasks -->
                <div class="task-column">
                  <div class="task-column-header header-todo">
                    📋 To Do (${tasksByStatus.TODO.length})
                  </div>
                  <div class="task-list">
                    ${tasksByStatus.TODO.length > 0 ? 
                      tasksByStatus.TODO.map(task => `
                        <div class="task-item">
                          <div class="task-title">${task.title}</div>
                          ${task.assignees.length > 0 ? `<div class="task-assignees">👤 ${task.assignees.map(a => a.user.name).join(', ')}</div>` : ''}
                          ${task.description ? `<div class="task-description">${task.description.replace(/<[^>]*>/g, '').substring(0, 80)}${task.description.length > 80 ? '...' : ''}</div>` : ''}
                        </div>
                      `).join('') 
                      : '<div class="empty-state">📝 No pending tasks</div>'
                    }
                  </div>
                </div>

                <!-- Overdue Tasks -->
                <div class="task-column">
                  <div class="task-column-header header-overdue">
                    ⚠️ Overdue (${sprint.tasks.filter(task => {
                      if (!task.dueDate || task.status === "DONE") return false;
                      return new Date(task.dueDate) < new Date();
                    }).length})
                  </div>
                  <div class="task-list">
                    ${sprint.tasks.filter(task => {
                      if (!task.dueDate || task.status === "DONE") return false;
                      return new Date(task.dueDate) < new Date();
                    }).length > 0 ? 
                      sprint.tasks.filter(task => {
                        if (!task.dueDate || task.status === "DONE") return false;
                        return new Date(task.dueDate) < new Date();
                      }).map(task => `
                        <div class="task-item">
                          <div class="task-title">${task.title}</div>
                          ${task.assignees.length > 0 ? `<div class="task-assignees">👤 ${task.assignees.map(a => a.user.name).join(', ')}</div>` : ''}
                          <div class="task-due-date">📅 Due: ${new Date(task.dueDate).toLocaleDateString()}</div>
                          ${task.description ? `<div class="task-description">${task.description.replace(/<[^>]*>/g, '').substring(0, 60)}${task.description.length > 60 ? '...' : ''}</div>` : ''}
                        </div>
                      `).join('') 
                      : '<div class="empty-state">✨ No overdue tasks</div>'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-text">
              This report was automatically generated by the SSHE Scrum Management System.
            </div>
            <div class="footer-contact">
              For questions about this sprint, contact ${scrumMaster.name} (${scrumMaster.email})
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using the same method as events
    try {
      const emailText = `Sprint Completion Report

Sprint: ${summary.sprintName}
Project: ${summary.projectName}
Scrum Master: ${scrumMaster.name}
Period: ${new Date(summary.startDate).toLocaleDateString()} - ${new Date(summary.endDate).toLocaleDateString()}

Sprint Summary:
- Total Tasks: ${summary.stats.total}
- Completed: ${summary.stats.completed}
- In Progress: ${summary.stats.inProgress}  
- To Do: ${summary.stats.todo}
- Overdue: ${summary.stats.overdueCount || 0}
- Completion Rate: ${summary.stats.completionRate}%

Task Status Overview:
✅ Completed Tasks (${tasksByStatus.DONE.length})
🔄 In Progress Tasks (${tasksByStatus.IN_PROGRESS.length})
📋 To Do Tasks (${tasksByStatus.TODO.length})
⚠️ Overdue Tasks (${sprint.tasks.filter(task => {
  if (!task.dueDate || task.status === "DONE") return false;
  return new Date(task.dueDate) < new Date();
}).length})

Please check the SSHE Scrum Management app for detailed task information.

This is an automated message, please do not reply.`;

      await sendTaskNotification({
        to: [projectOwner.email],
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send sprint report email:", emailError);
      return NextResponse.json(
        { error: "Failed to send sprint report email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Sprint report sent successfully" 
    });

  } catch (error) {
    console.error("Error sending sprint report:", error);
    return NextResponse.json(
      { error: "Failed to send sprint report" },
      { status: 500 }
    );
  }
}
