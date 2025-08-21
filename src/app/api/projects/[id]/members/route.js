import { NextResponse } from 'next/server';
import { projectOperations, activityOperations, notificationOperations, prisma } from '@/lib/prisma';

// GET /api/projects/[id]/members - Get project members
export async function GET(request, { params }) {
  try {
    const { id } = await params;

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
        scrumMaster: {
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

    // Create team members list with proper roles
    const teamMembers = [];
    
    // Add owner with PROJECT_OWNER role for this project
    if (project.owner) {
      teamMembers.push({
        ...project.owner,
        projectRole: 'PROJECT_OWNER',
        isOwner: true,
        userId: project.owner.id,
        joinedAt: project.createdAt
      });
    }
    
    // Add scrum master with SCRUM_MASTER role for this project
    if (project.scrumMaster && project.scrumMaster.id !== project.owner?.id) {
      teamMembers.push({
        ...project.scrumMaster,
        projectRole: 'SCRUM_MASTER',
        isScrumMaster: true,
        userId: project.scrumMaster.id,
        joinedAt: project.createdAt
      });
    }
    
    // Add regular members
    project.members.forEach(member => {
      // Skip if this user is already added as owner or scrum master
      if (member.user.id !== project.owner?.id && member.user.id !== project.scrumMaster?.id) {
        teamMembers.push({
          ...member.user,
          projectRole: 'TEAM_MEMBER',
          userId: member.user.id,
          joinedAt: member.joinedAt,
          isActive: member.isActive
        });
      }
    });

    return NextResponse.json({ 
      owner: project.owner,
      scrumMaster: project.scrumMaster,
      members: project.members.map(member => ({
        ...member.user,
        joinedAt: member.joinedAt,
        isActive: member.isActive,
        userId: member.user.id
      })),
      teamMembers: teamMembers,
      totalMembers: teamMembers.length
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
