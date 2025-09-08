import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/[id] - Get event by ID
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/events/[id] - Update event by ID
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isRecurring: body.isRecurring,
        recurringType: body.recurringType,
        recurringDayOfWeek: body.recurringDayOfWeek,
        recurringEndDate: body.recurringEndDate ? new Date(body.recurringEndDate) : null,
        projectId: body.projectId || null,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        project: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    // Send email to selected users (from form) or fallback to project members
    try {
      const { sendTaskNotification } = require("@/lib/email");
      let to = [];
      if (body.selectedUserIds && Array.isArray(body.selectedUserIds) && body.selectedUserIds.length > 0) {
        // Ambil email dari user yang dipilih
        const selectedUsers = await prisma.user.findMany({
          where: { id: { in: body.selectedUserIds }, role: { not: "SUPERADMIN" } },
          select: { email: true, name: true },
        });
        to = selectedUsers.map((u) => u.email).filter(Boolean);
      } else {
        // Fallback ke project members
        to = event.project?.members?.map((m) => m.user.email).filter(Boolean) || [];
      }
      if (to.length > 0) {
        const subject = `[SSHE Scrum] Event Updated - ${event.title}`;
        const formattedStartDate = new Date(event.startDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const formattedEndDate = event.endDate
          ? new Date(event.endDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Not specified";
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Updated</title>
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
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Event Updated</h1>
              <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">SSHE Scrum Management</p>
            </div>
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Hello! 📝</p>
                <p style="margin: 0; font-size: 16px; color: #374151;">An event has been updated${event.project?.name ? ` in the <strong style=\"color: #1f2937;\">${event.project.name}</strong> project` : ""}.</p>
              </div>
              <!-- Event Details Card -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1f2937; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-right: 12px;"></span>
                  📅 ${event.title}
                </h2>
                ${
                  event.description
                    ? `<div style=\"margin-bottom: 20px;\">
                  <h4 style=\"margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;\">Description</h4>
                  <p style=\"margin: 0; font-size: 15px; color: #374151; background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #d1fae5; white-space: pre-line;\">${event.description}</p>
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
                      event.endDate
                        ? `<div style=\"display: flex; justify-content: space-between; align-items: center; padding: 8px 0;\">
                      <span style=\"font-weight: 600; color: #065f46; font-size: 14px;\">End Time:</span>
                      <span style=\"color: #374151; font-size: 14px;\">${formattedEndDate}</span>
                    </div>`
                        : ""
                    }
                  </div>
                </div>
                ${
                  event.project?.name
                    ? `<div style=\"margin-top: 16px; padding: 12px; background-color: #ffffff; border: 1px solid #d1fae5; border-radius: 8px;\">
                  <div style=\"display: flex; align-items: center;\">
                    <span style=\"margin-right: 8px;\">📁</span>
                    <span style=\"font-size: 14px; color: #065f46; font-weight: 600;\">Project:</span>
                    <span style=\"margin-left: 8px; font-size: 14px; color: #374151; font-weight: 500;\">${event.project.name}</span>
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
        const text = `Event Updated: ${event.title}\n\n${event.description ? `Description: ${event.description}\n\n` : ""}Start: ${formattedStartDate}\n${event.endDate ? `End: ${formattedEndDate}\n` : ""}${
          event.project?.name ? `Project: ${event.project.name}\n` : ""
        }\nPlease check the SSHE Scrum Management app for more details.\n\nThis is an automated message, please do not reply.`;
        await sendTaskNotification({ to, subject, text, html });
      }
    } catch (err) {
      console.error("Gagal mengirim email update event:", err);
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete event by ID
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const event = await prisma.event.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete event error:", error);
    if (error.code === "P2025") {
      // Prisma not found error
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
