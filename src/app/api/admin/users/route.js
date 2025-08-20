import { NextResponse } from "next/server";
import { userOperations, prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/admin/users - Get all users (superadmin only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("currentUserId");

    // Check if current user is superadmin
    const currentUser = await userOperations.findById(currentUserId);
    if (!currentUser || (currentUser.role !== "SUPERADMIN" && currentUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized. Superadmin access required." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedProjects: true,
            taskAssignees: true,
            projectMemberships: true,
            createdTasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user (superadmin only)
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, role, department, currentUserId } = body;

    // Check if current user is superadmin
    // const currentUser = await userOperations.findById(currentUserId);
    // if (!currentUser || (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'superadmin')) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized. Superadmin access required.' },
    //     { status: 403 }
    //   );
    // }

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Email, password, name, and role are required" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await userOperations.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase(),
        department: department || null,
        isActive: true,
        userSettings: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
