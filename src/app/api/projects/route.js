import { NextResponse } from "next/server";
import { projectOperations, activityOperations } from "@/lib/prisma";

// GET /api/projects - Get user's projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const department = searchParams.get("department");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const filters = {};
    if (status) filters.status = status.toUpperCase();
    if (department) filters.department = department;

    const projects = await projectOperations.getByUserId(userId, filters);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, department, scrumMasterId, startDate, endDate, ownerId } = body;

    // Validate required fields
    if (!name || !ownerId) {
      return NextResponse.json({ error: "Name and owner ID are required" }, { status: 400 });
    }

    if (!scrumMasterId) {
      return NextResponse.json({ error: "Scrum Master is required" }, { status: 400 });
    }

    const projectData = {
      name,
      description,
      department,
      status: "ACTIVE",
      scrumMasterId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    const project = await projectOperations.create(projectData, ownerId);

    // Automatically add scrum master as project member
    if (scrumMasterId && scrumMasterId !== ownerId) {
      await projectOperations.addMember(project.id, scrumMasterId);
    }

    // Log activity
    await activityOperations.create({
      type: "PROJECT_CREATED",
      description: `Project "${name}" was created`,
      userId: ownerId,
      projectId: project.id,
    });

    return NextResponse.json({
      project,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
