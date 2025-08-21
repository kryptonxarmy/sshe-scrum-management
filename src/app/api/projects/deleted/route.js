import { NextResponse } from 'next/server';
import { projectOperations, prisma } from '@/lib/prisma';

// GET /api/projects/deleted - Get soft deleted projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let whereClause = {
      deletedAt: { not: null }, // Only deleted projects
    };

    // Filter based on user role
    if (user.role === 'SUPERADMIN') {
      // SUPERADMIN can see all deleted projects
    } else if (user.role === 'PROJECT_OWNER') {
      // PROJECT_OWNER can only see their own deleted projects
      whereClause.ownerId = userId;
    } else {
      // Other roles can see deleted projects they were members of
      whereClause.OR = [
        { ownerId: userId },
        { 
          members: {
            some: {
              userId: userId,
              isActive: true,
            }
          }
        },
      ];
    }

    const deletedProjects = await prisma.project.findMany({
      where: whereClause,
      include: {
        owner: true,
        scrumMaster: true,
        members: {
          include: {
            user: true,
          },
          where: {
            isActive: true,
          },
        },
        tasks: true,
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });

    return NextResponse.json({
      projects: deletedProjects,
    });

  } catch (error) {
    console.error('Get deleted projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
