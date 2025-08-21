import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    let whereClause = {
      status: "RELEASED",
    };

    // Filter based on user role - hanya PROJECT_OWNER yang bisa akses
    if (user.role !== "SUPERADMIN") {
      if (user.role !== "PROJECT_OWNER") {
        return Response.json({ error: "Unauthorized access" }, { status: 403 });
      }
      // PROJECT_OWNER hanya bisa lihat proyek yang mereka miliki
      whereClause.ownerId = userId;
    }

    const releasedProjects = await prisma.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        scrumMaster: {
          select: {
            id: true,
            name: true,
            email: true,
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
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return Response.json({
      projects: releasedProjects,
      count: releasedProjects.length,
    });
  } catch (error) {
    console.error("Get released projects error:", error);
    return Response.json(
      { error: "Failed to fetch released projects" },
      { status: 500 }
    );
  }
}
