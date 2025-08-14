import { NextResponse } from 'next/server';
import { projectOperations, activityOperations, notificationOperations, prisma } from '@/lib/prisma';

// GET /api/projects/[id]/members - Get project members
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      owner: project.owner,
      members: project.members.map(member => ({
        ...member.user,
        joinedAt: member.joinedAt,
        isActive: member.isActive,
      }))
    });

  } catch (error) {
    console.error('Get project members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/members - Add member to project
export async function POST(request, { params }) {
  try {
    const { id: projectId } = params;
    const { userId, addedBy } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await projectOperations.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Add member
    const membership = await projectOperations.addMember(projectId, userId);

    // Log activity
    if (addedBy) {
      await activityOperations.create({
        type: 'MEMBER_ADDED',
        description: `${membership.user.name} was added to project "${project.name}"`,
        userId: addedBy,
        projectId,
      });
    }

    return NextResponse.json({ 
      membership,
      message: 'Member added successfully' 
    });

  } catch (error) {
    console.error('Add member error:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/members?userId=xxx - Remove member from project
export async function DELETE(request, { params }) {
  try {
    const { id: projectId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const removedBy = searchParams.get('removedBy');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await projectOperations.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get user info before removing
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Remove member
    await projectOperations.removeMember(projectId, userId);

    // Log activity
    if (removedBy && user) {
      await activityOperations.create({
        type: 'MEMBER_REMOVED',
        description: `${user.name} was removed from project "${project.name}"`,
        userId: removedBy,
        projectId,
      });
    }

    return NextResponse.json({ 
      message: 'Member removed successfully' 
    });

  } catch (error) {
    console.error('Remove member error:', error);
    
    // Handle record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User is not a member of this project' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
