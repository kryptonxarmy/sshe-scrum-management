import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/users/multiple
export async function POST(request) {
  try {
    const body = await request.json();
    const users = Array.isArray(body.users) ? body.users : [];

    if (users.length === 0) {
      return NextResponse.json({ error: "No users provided" }, { status: 400 });
    }

    // Prepare user data for bulk creation with defaults
    const userData = users.map((user) => ({
      email: user.email,
      password: "password123", // Default password
      name: user.name,
      role: "TEAM_MEMBER",
      department: "SSHE",
      isActive: true,
    }));

    // Bulk create users
    const created = await prisma.user.createMany({
      data: userData,
      skipDuplicates: true, // Skip if email already exists
    });

    return NextResponse.json({
      message: "Users created successfully",
      count: created.count,
    });
  } catch (error) {
    console.error("Bulk user creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}