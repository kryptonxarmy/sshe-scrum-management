import { NextResponse } from "next/server";
import { projectOperations, activityOperations } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";

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
    const { name, description, department, ownerId, scrumMasterId, memberIds = [], duration } = body;

    if (!name || !ownerId) {
      return NextResponse.json({ error: "Project name and owner ID are required" }, { status: 400 });
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        department: department || "DEFAULT", // Add required department field
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

    // Send email notification to team members
    if (project && project.id) {
      try {
        // Collect all unique email addresses (owner, scrum master, members)
        const emailList = [];
        
        // Add project owner email
        if (project.owner?.email) {
          emailList.push(project.owner.email);
        }
        
        // Add scrum master email (if different from owner)
        if (project.scrumMaster?.email && project.scrumMaster.email !== project.owner?.email) {
          emailList.push(project.scrumMaster.email);
        }
        
        // Add member emails (filter out duplicates)
        project.members.forEach(member => {
          if (member.user?.email && 
              member.user.role !== "SUPERADMIN" && 
              !emailList.includes(member.user.email)) {
            emailList.push(member.user.email);
          }
        });

        if (emailList.length > 0) {
          const memberNames = project.members.map(m => m.user?.name).filter(Boolean).join(", ");
          const subject = `[SSHE Scrum] Anda tergabung pada project baru: ${project.name}`;
          const html = `
            <h2>Selamat, Anda tergabung pada project <strong>${project.name}</strong></h2>
            <p>Scrum Master: <strong>${project.scrumMaster?.name || "-"}</strong></p>
            <p>Project Owner: <strong>${project.owner?.name || "-"}</strong></p>
            <p>Team Member: <strong>${memberNames || "-"}</strong></p>
            <p>Silakan login ke aplikasi SSHE Scrum Management untuk melihat detail project.</p>
          `;
          const text = `Selamat, Anda tergabung pada project ${project.name}\nScrum Master: ${project.scrumMaster?.name || "-"}\nProject Owner: ${project.owner?.name || "-"}\nTeam Member: ${memberNames || "-"}\nSilakan login ke aplikasi SSHE Scrum Management untuk melihat detail project.`;
          
          const { sendTaskNotification } = require("@/lib/email");
          await sendTaskNotification({ to: emailList, subject, text, html });
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue without failing the project creation
      }
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
