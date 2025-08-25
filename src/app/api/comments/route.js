import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ambil komentar project/task
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  let where = {};
  if (projectId) where.projectId = projectId;
  if (taskId) where.taskId = taskId;

  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatar: true, role: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

// Buat komentar baru
export async function POST(req) {
  const body = await req.json();
  const { content, userId, role, projectId, taskId, parentId } = body;

  if (!content || !userId || !role || (!projectId && !taskId)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId,
      role,
      projectId,
      taskId,
      parentId,
    },
  });

  return NextResponse.json({ comment });
}
