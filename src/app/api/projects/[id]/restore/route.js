import { NextResponse } from 'next/server';
import { projectOperations, activityOperations, prisma } from '@/lib/prisma';

// POST /api/projects/[id]/restore - Restore soft deleted project
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId } = body;

    // Check if project exists and is soft deleted
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.deletedAt) {
      return NextResponse.json(
        { error: 'Project is not deleted' },
        { status: 400 }
      );
    }

    // Restore project by removing deletedAt
    const restoredProject = await prisma.project.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    // Log activity
    if (userId) {
      await activityOperations.create({
        type: 'PROJECT_RESTORED',
        description: `Project "${project.name}" was restored from trash`,
        userId,
        projectId: id,
      });
    }

    return NextResponse.json({ 
      project: restoredProject,
      message: 'Project restored successfully' 
    });

  } catch (error) {
    console.error('Restore project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
