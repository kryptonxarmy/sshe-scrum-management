import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events - Get all events for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let whereClause = {
      OR: [
        { createdById: userId },
        { project: { members: { some: { userId } } } },
        { project: { ownerId: userId } }
      ]
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.AND = [
        {
          startDate: {
            gte: new Date(startDate)
          }
        },
        {
          startDate: {
            lte: new Date(endDate)
          }
        }
      ];
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      events 
    });
  } catch (error) {
    console.error('Get events error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      if (error.stack) console.error('Stack:', error.stack);
    }
    if (error.code) console.error('Prisma error code:', error.code);
    if (error.meta) console.error('Prisma error meta:', error.meta);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message || error },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      startDate, 
      endDate,
      isRecurring, 
      recurringType, 
      recurringDayOfWeek,
      recurringEndDate,
      projectId, 
      createdById,
      selectedUserIds = []
    } = body;

    if (!title || !startDate || !createdById) {
      return NextResponse.json(
        { error: 'Title, start date, and creator ID are required' },
        { status: 400 }
      );
    }

    // Create the main event
    const event = await prisma.event.create({
      data: {
        title,
        description: description || '',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        isRecurring: isRecurring || false,
        recurringType: recurringType || null,
        recurringDayOfWeek: recurringDayOfWeek || null,
        recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
        projectId: projectId || null,
        createdById
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
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
        const subject = `[SSHE Scrum] Event Baru: ${title}`;
        const html = `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #4B2995;">Undangan Event Baru</h2>
            <p>Anda diundang untuk event berikut:</p>
            <table style="border-collapse: collapse; margin-top: 10px;">
              <tr><td><strong>Judul Event:</strong></td><td>${title}</td></tr>
              <tr><td><strong>Deskripsi:</strong></td><td>${description || "-"}</td></tr>
              <tr><td><strong>Waktu Mulai:</strong></td><td>${new Date(startDate).toLocaleString()}</td></tr>
              <tr><td><strong>Waktu Selesai:</strong></td><td>${endDate ? new Date(endDate).toLocaleString() : "-"}</td></tr>
              <tr><td><strong>Project:</strong></td><td>${event.project?.name || "-"}</td></tr>
            </table>
            <p style="margin-top: 16px;">Silakan cek aplikasi SSHE Scrum Management untuk detail lebih lanjut.</p>
          </div>
        `;
        const to = assigneeEmails.map(u => u.email);
        await sendTaskNotification({ to, subject, text: `${title}\n${description || ""}`, html });
      } catch (err) {
        console.error("Gagal mengirim email event ke assignees:", err);
        // Optionally, you can return a warning in the response
      }
    }

    // If recurring, create future instances
    if (isRecurring && recurringType && recurringDayOfWeek !== null) {
      const instances = [];
      let currentDate = new Date(startDate);
      const endRecurringDate = recurringEndDate ? new Date(recurringEndDate) : new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from start if no end date
      
      const weekIncrement = recurringType === 'weekly' ? 1 : 2; // 1 week or 2 weeks
      
      while (currentDate <= endRecurringDate) {
        currentDate.setDate(currentDate.getDate() + (7 * weekIncrement));
        
        if (currentDate <= endRecurringDate) {
          instances.push({
            title,
            description: description || '',
            startDate: new Date(currentDate),
            endDate: endDate ? new Date(currentDate.getTime() + (new Date(endDate) - new Date(startDate))) : new Date(currentDate),
            isRecurring: false, // Individual instances are not recurring
            parentEventId: event.id,
            projectId: projectId || null,
            createdById
          });
        }
      }

      // Create all recurring instances in batch
      if (instances.length > 0) {
        await prisma.event.createMany({
          data: instances
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      event 
    });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
