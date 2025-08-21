import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { action } = await request.json();

    // Validasi action
    if (action !== "release") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update project status to RELEASED
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "PROJECT_UPDATED",
        description: `Project "${updatedProject.name}" has been released`,
        projectId: id,
        userId: updatedProject.ownerId,
      },
    });

    return Response.json({
      message: "Project released successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Release project error:", error);
    return Response.json(
      { error: "Failed to release project" },
      { status: 500 }
    );
  }
}
