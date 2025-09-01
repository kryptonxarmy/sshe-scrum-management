import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Optionally filter by projectId
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    let sprints;
    if (projectId) {
      sprints = await prisma.sprint.findMany({
        where: { projectId },
        include: { project: true, tasks: true },
        orderBy: { startDate: "asc" },
      });
    } else {
      sprints = await prisma.sprint.findMany({
        include: { project: true, tasks: true },
        orderBy: { startDate: "asc" },
      });
    }
    return NextResponse.json({ sprints });
  } catch (error) {
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
