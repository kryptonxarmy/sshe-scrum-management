// POST /api/users - Create a new user
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, department } = body;
    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    // You may want to hash the password here before saving
    const newUser = await userOperations.create({
      name,
      email,
      password, // Replace with hashed password in production
      role: role.toUpperCase(),
      department: department || null,
      isActive: true,
    });
    // Remove password from response
    const { password: pw, ...safeUser } = newUser;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { userOperations } from '@/lib/prisma';

// GET /api/users - Get all users (filtered by role if needed)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const isActive = searchParams.get('isActive');

    const filters = {};
    
    if (role) {
      filters.role = role.toUpperCase();
    }
    
    if (department) {
      filters.department = department;
    }
    
    if (isActive !== null && isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const users = await userOperations.getAll(filters);

    // Remove sensitive information
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json({ users: safeUsers });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
