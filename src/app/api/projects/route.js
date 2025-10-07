import { NextResponse } from "next/server";
import { projectOperations, activityOperations } from "@/lib/prisma";

// GET /api/projects - Get user's projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const scrumMasterId = searchParams.get("scrumMasterId");
    const includeMemberProjects = searchParams.get("includeMemberProjects") === "true";
    const status = searchParams.get("status");
    const department = searchParams.get("department");

    if (!userId && !scrumMasterId) {
      return NextResponse.json({ error: "User ID or Scrum Master ID is required" }, { status: 400 });
    }

    const filters = {};
    if (status) filters.status = status.toUpperCase();
    if (department) filters.department = department;

    let projects;

    if (scrumMasterId) {
      // Get projects where user is scrum master
      projects = await projectOperations.getByScrumMasterId(scrumMasterId, filters, includeMemberProjects);
    } else {
      // Get projects by owner
      projects = await projectOperations.getByUserId(userId, filters);
    }

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
  const { name, description, ownerId, scrumMasterId, memberIds = [], duration } = body;

    if (!name || !ownerId) {
      return NextResponse.json({ error: "Project name and owner ID are required" }, { status: 400 });
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        ownerId,
        scrumMasterId: scrumMasterId || null,
        duration: duration || undefined, // Accept duration from user input, fallback to model default
        members: {
          create: memberIds.map((userId) => ({
            userId,
            role: "MEMBER",
          })),
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        scrumMaster: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      },
    });

    // Notify all team members (excluding SUPERADMIN)
    if (project && project.id && project.ownerId) {
      const teamMembers = await prisma.projectMember.findMany({
        where: { projectId: project.id },
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      });
      const members = teamMembers.map((pm) => pm.user).filter((u) => u && u.role !== "SUPERADMIN");
      const scrumMaster = members.find((u) => u.id === project.scrumMasterId);
      const owner = members.find((u) => u.id === project.ownerId);
      const memberNames = members.map((u) => u.name).join(", ");
      const to = members.map((u) => u.email);
      const subject = `[SSHE Scrum] Anda tergabung pada project baru: ${project.name}`;
      const html = `
        <h2>Selamat, Anda tergabung pada project <strong>${project.name}</strong></h2>
        <p>Scrum Master: <strong>${scrumMaster ? scrumMaster.name : "-"}</strong></p>
        <p>Project Owner: <strong>${owner ? owner.name : "-"}</strong></p>
        <p>Team Member: <strong>${memberNames}</strong></p>
        <p>Silakan login ke aplikasi SSHE Scrum Management untuk melihat detail project.</p>
      `;
      const text = `Selamat, Anda tergabung pada project ${project.name}\nScrum Master: ${scrumMaster ? scrumMaster.name : "-"}\nProject Owner: ${owner ? owner.name : "-"}\nTeam Member: ${memberNames}\nSilakan login ke aplikasi SSHE Scrum Management untuk melihat detail project.`;
      const { sendTaskNotification } = require("@/lib/email");
      await sendTaskNotification({ to, subject, text, html });
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
