import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const scrumMasterId = searchParams.get("scrumMasterId");
    const includeTasks = searchParams.get("includeTasks") === "true";
    
    let whereClause = {};
    let includeClause = { 
      project: {
        include: {
          owner: true
        }
      }
    };

    // Add tasks to include if requested
    if (includeTasks) {
      includeClause.tasks = {
        include: {
          assignees: {
            include: { user: true }
          }
        }
      };
    }

    // Filter by projectId if provided
    if (projectId) {
      whereClause.projectId = projectId;
    }

    // Filter by scrumMasterId if provided
    if (scrumMasterId) {
      whereClause.project = {
        scrumMasterId: scrumMasterId
      };
    }

    const sprints = await prisma.sprint.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ sprints });
  } catch (error) {
    console.error("Error fetching sprints:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const sprint = await prisma.sprint.create({
      data: {
        name: body.name,
        goal: body.goal,
        startDate: body.startDate,
        endDate: body.endDate,
        projectId: body.projectId,
        isActive: body.isActive ?? false,
        isCompleted: body.isCompleted ?? false,
      },
    });
    return NextResponse.json({ sprint });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
