import { NextResponse } from "next/server";
import { projectOperations } from "@/lib/prisma";

// GET /api/users/[id]/projects - Get projects accessible to a user
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get projects where user is owner or member
    const projects = await projectOperations.getUserProjects(id);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get user projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
