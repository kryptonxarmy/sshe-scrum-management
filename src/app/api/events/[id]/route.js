import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events/[id] - Get event by ID
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
        project: { select: { id: true, name: true } }
      }
    });
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete event by ID
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const event = await prisma.event.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    if (error.code === 'P2025') {
      // Prisma not found error
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
