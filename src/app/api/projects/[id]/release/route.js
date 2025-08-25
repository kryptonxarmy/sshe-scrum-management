import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { action } = await request.json();

    // Validasi action
    if (action !== "release" && action !== "active") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get current status
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    let updatedProject;
    if (action === "release") {
      updatedProject = await prisma.project.update({
        where: { id },
        data: {
          previousStatus: project.status,
          status: "RELEASED",
          updatedAt: new Date(),
        },
        include: {
          owner: true,
          scrumMaster: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });
    } else if (action === "active") {
      updatedProject = await prisma.project.update({
        where: { id },
        data: {
          previousStatus: project.status,
          status: "ACTIVE",
          updatedAt: new Date(),
        },
        include: {
          owner: true,
          scrumMaster: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "PROJECT_UPDATED",
        description: `Project "${updatedProject.name}" status changed to ${updatedProject.status}`,
        projectId: id,
        userId: updatedProject.ownerId,
      },
    });

    return Response.json({
      message: `Project status changed to ${updatedProject.status}`,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Release project error:", error);
    return Response.json({ error: "Failed to release project" }, { status: 500 });
  }
}
