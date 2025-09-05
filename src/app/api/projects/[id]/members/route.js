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
    let membership;
    try {
      membership = await projectOperations.addMember(projectId, userId);
    } catch (err) {
      if (err.code === 'P2002') {
        return NextResponse.json(
          { error: 'User is already a member of this project' },
          { status: 409 }
        );
      }
      console.error('Add member DB error:', err);
      return NextResponse.json(
        { error: 'Database error', details: err.message || err },
        { status: 500 }
      );
    }

    // Kirim email ke member yang baru ditambahkan
    try {
      const member = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      const projectInfo = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true, scrumMasterId: true, ownerId: true } });
      const scrumMaster = projectInfo.scrumMasterId ? await prisma.user.findUnique({ where: { id: projectInfo.scrumMasterId }, select: { name: true } }) : null;
      const owner = projectInfo.ownerId ? await prisma.user.findUnique({ where: { id: projectInfo.ownerId }, select: { name: true } }) : null;
      const subject = `[SSHE Scrum] Anda telah ditambahkan ke project: ${projectInfo.name}`;
      const html = `<h2>Anda telah ditambahkan ke project <strong>${projectInfo.name}</strong></h2><p>Scrum Master: <strong>${scrumMaster ? scrumMaster.name : "-"}</strong></p><p>Project Owner: <strong>${owner ? owner.name : "-"}</strong></p><p>Silakan login ke aplikasi SSHE Scrum Management untuk melihat detail project.</p>`;
      const text = `Anda telah ditambahkan ke project ${projectInfo.name}\nScrum Master: ${scrumMaster ? scrumMaster.name : "-"}\nProject Owner: ${owner ? owner.name : "-"}\nSilakan login ke aplikasi SSHE Scrum Management untuk melihat detail project.`;
      if (member && member.email) {
        const { sendTaskNotification } = require("@/lib/email");
        await sendTaskNotification({ to: [member.email], subject, text, html });
      }
    } catch (err) {
      console.error('Email error:', err);
      // Do not fail the API if email fails
    }

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
