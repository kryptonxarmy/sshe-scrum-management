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
