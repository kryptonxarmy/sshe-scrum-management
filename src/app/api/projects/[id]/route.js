import { NextResponse } from 'next/server';
import { projectOperations, activityOperations, prisma } from '@/lib/prisma';

// GET /api/projects/[id] - Get project details
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';

    const project = await projectOperations.findById(id, includeDetails);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, ...updateData } = body;

    // Check if project exists
    const existingProject = await projectOperations.findById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Process date fields
    const processedData = {
      ...updateData,
      // Convert date strings to proper Date objects
      startDate: updateData.startDate ? new Date(updateData.startDate) : null,
      endDate: updateData.endDate ? new Date(updateData.endDate) : null,
      updatedAt: new Date(),
    };

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: processedData,
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
        type: 'PROJECT_UPDATED',
        description: `Project "${updatedProject.name}" was updated`,
        userId,
        projectId: id,
      });
    }

    return NextResponse.json({ 
      project: updatedProject,
      message: 'Project updated successfully' 
    });

  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Soft delete project
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const forceDelete = searchParams.get('force') === 'true';

    // Check if project exists
    const project = await projectOperations.findById(id);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (forceDelete) {
      // Hard delete - permanently remove project
      await prisma.project.delete({
        where: { id },
      });

      // Log activity
      if (userId) {
        await activityOperations.create({
          type: 'PROJECT_DELETED',
          description: `Project "${project.name}" was permanently deleted`,
          userId,
        });
      }

      return NextResponse.json({ 
        message: 'Project permanently deleted successfully' 
      });
    } else {
      // Soft delete - mark as deleted
      const deletedProject = await prisma.project.update({
        where: { id },
        data: {
          deletedAt: new Date(),
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
          type: 'PROJECT_DELETED',
          description: `Project "${project.name}" was moved to trash`,
          userId,
          projectId: id,
        });
      }

      return NextResponse.json({ 
        project: deletedProject,
        message: 'Project moved to trash successfully' 
      });
    }

  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
