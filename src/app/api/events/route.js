import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events - Get all events for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let whereClause = {
      OR: [{ createdById: userId }, { project: { members: { some: { userId } } } }, { project: { ownerId: userId } }],
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.AND = [
        {
          startDate: {
            gte: new Date(startDate),
          },
        },
        {
          startDate: {
            lte: new Date(endDate),
          },
        },
      ];
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get events error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if (error.stack) console.error("Stack:", error.stack);
    }
    if (error.code) console.error("Prisma error code:", error.code);
    if (error.meta) console.error("Prisma error meta:", error.meta);
    return NextResponse.json({ error: "Internal server error", details: error.message || error }, { status: 500 });
  }
}

// POST /api/events - Create a new event
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, isRecurring, recurringType, recurringDayOfWeek, recurringEndDate, projectId, createdById, selectedUserIds = [] } = body;

    if (!title || !startDate || !createdById) {
      return NextResponse.json({ error: "Title, start date, and creator ID are required" }, { status: 400 });
    }

    // Create the main event
    const event = await prisma.event.create({
      data: {
        title,
        description: description || "",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        isRecurring: isRecurring || false,
        recurringType: recurringType || null,
        recurringDayOfWeek: recurringDayOfWeek || null,
        recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
        projectId: projectId || null,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Fetch emails of selected users
    let assigneeEmails = [];
    if (selectedUserIds && selectedUserIds.length > 0) {
      assigneeEmails = await prisma.user.findMany({
        where: {
          id: { in: selectedUserIds },
          role: { not: "SUPERADMIN" },
        },
        select: { email: true, name: true },
      });
    }

    // Send event notification email to assignees
    if (assigneeEmails.length > 0) {
      try {
        const { sendTaskNotification } = require("@/lib/email");

        const formattedStartDate = new Date(startDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const formattedEndDate = endDate
          ? new Date(endDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Not specified";

        const subject = `[SSHE Scrum] New Event Invitation - ${title} <do_not_reply>`;
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; padding: 12px; margin-bottom: 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Event Invitation</h1>
              <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">SSHE Scrum Management</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Hello! 🎉</p>
                <p style="margin: 0; font-size: 16px; color: #374151;">You're invited to a new event${event.project?.name ? ` in the <strong style="color: #1f2937;">${event.project.name}</strong> project` : ""}.</p>
              </div>

              <!-- Event Details Card -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1f2937; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px;"></span>
                  📅 ${title}
                </h2>
                
                ${
                  description
                    ? `<div style="margin-bottom: 20px;">
                  <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Description</h4>
                  <p style="margin: 0; font-size: 15px; color: #374151; background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #d1fae5;">${description}</p>
                </div>`
                    : ""
                }

                <!-- Event Schedule -->
                <div style="background-color: #ffffff; border: 1px solid #d1fae5; border-radius: 8px; padding: 16px; margin-top: 16px;">
                  <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #065f46; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🕒</span>
                    Schedule Details
                  </h4>
                  
                  <div style="space-y: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #ecfdf5;">
                      <span style="font-weight: 600; color: #065f46; font-size: 14px;">Start Time:</span>
                      <span style="color: #374151; font-size: 14px;">${formattedStartDate}</span>
                    </div>
                    
                    ${
                      endDate
                        ? `<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                      <span style="font-weight: 600; color: #065f46; font-size: 14px;">End Time:</span>
                      <span style="color: #374151; font-size: 14px;">${formattedEndDate}</span>
                    </div>`
                        : ""
                    }
                  </div>
                </div>

                ${
                  event.project?.name
                    ? `<div style="margin-top: 16px; padding: 12px; background-color: #ffffff; border: 1px solid #d1fae5; border-radius: 8px;">
                  <div style="display: flex; align-items: center;">
                    <span style="margin-right: 8px;">📁</span>
                    <span style="font-size: 14px; color: #065f46; font-weight: 600;">Project:</span>
                    <span style="margin-left: 8px; font-size: 14px; color: #374151; font-weight: 500;">${event.project.name}</span>
                  </div>
                </div>`
                    : ""
                }
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${process.env.APP_URL || "https://sshe-scrum-management.vercel.app"}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); transition: all 0.2s;">
                  View in Calendar →
                </a>
              </div>

              <!-- Additional Info -->
              <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="display: inline-block; margin-right: 12px; margin-top: 2px;">⏰</span>
                  <div>
                    <h4 style="margin: 0 0 6px; font-size: 14px; font-weight: 600; color: #92400e;">Don't Forget!</h4>
                    <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">Add this event to your calendar and set a reminder. You can view more details and manage your schedule in the SSHE Scrum Management app.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">Best regards,<br><strong style="color: #374151;">SSHE Scrum Management Team</strong></p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.4;">
                This is an automated notification. Please do not reply to this email.<br>
                If you have any questions about this event, please contact the event organizer or your project manager.
              </p>
            </div>
          </div>
        </body>
        </html>
        `;

        const text = `Event Invitation: ${title}\n\n${description ? `Description: ${description}\n\n` : ""}Start: ${formattedStartDate}\n${endDate ? `End: ${formattedEndDate}\n` : ""}${
          event.project?.name ? `Project: ${event.project.name}\n` : ""
        }\nPlease check the SSHE Scrum Management app for more details.\n\nThis is an automated message, please do not reply.`;

        const to = assigneeEmails.map((u) => u.email);
        await sendTaskNotification({ to, subject, text, html });
      } catch (err) {
        console.error("Gagal mengirim email event ke assignees:", err);
        // Optionally, you can return a warning in the response
      }
    }

    // If recurring, create future instances
    if (isRecurring && recurringType && recurringDayOfWeek !== null) {
      const instances = [];
      let currentDate = new Date(startDate);
      const endRecurringDate = recurringEndDate ? new Date(recurringEndDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from start if no end date

      const weekIncrement = recurringType === "weekly" ? 1 : 2; // 1 week or 2 weeks

      while (currentDate <= endRecurringDate) {
        currentDate.setDate(currentDate.getDate() + 7 * weekIncrement);

        if (currentDate <= endRecurringDate) {
          instances.push({
            title,
            description: description || "",
            startDate: new Date(currentDate),
            endDate: endDate ? new Date(currentDate.getTime() + (new Date(endDate) - new Date(startDate))) : new Date(currentDate),
            isRecurring: false, // Individual instances are not recurring
            parentEventId: event.id,
            projectId: projectId || null,
            createdById,
          });
        }
      }

      // Create all recurring instances in batch
      if (instances.length > 0) {
        await prisma.event.createMany({
          data: instances,
        });
      }
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
