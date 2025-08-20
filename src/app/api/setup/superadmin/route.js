import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-simple';
import bcrypt from 'bcryptjs';

// POST /api/setup/superadmin - Create first superadmin (only if no superadmin exists)
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      department = 'IT' 
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if there are any superadmins in the system
    let existingSuperadmin = null;
    try {
      existingSuperadmin = await prisma.user.findFirst({
        where: {
          role: 'SUPERADMIN'
        }
      });
    } catch (dbError) {
      console.log('Database may not be initialized yet, proceeding with superadmin creation');
      // If database is not initialized, we can proceed
    }

    if (existingSuperadmin) {
      return NextResponse.json(
        { error: 'Superadmin already exists. Use normal admin endpoints.' },
        { status: 409 }
      );
    }

    // Check if email already exists
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      });
    } catch (dbError) {
      console.log('Database may not be initialized, proceeding with user creation');
      // If database is not initialized, we can proceed
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create superadmin
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'SUPERADMIN',
        department,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'Superadmin created successfully'
    });

  } catch (error) {
    console.error('Setup superadmin error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET /api/setup/superadmin - Check if superadmin setup is needed
export async function GET() {
  try {
    let existingSuperadmin = null;
    try {
      existingSuperadmin = await prisma.user.findFirst({
        where: {
          role: 'SUPERADMIN'
        }
      });
    } catch (dbError) {
      console.log('Database may not be initialized yet');
      // If database is not initialized, setup is needed
      return NextResponse.json({
        needsSetup: true,
        message: 'Database not initialized, setup needed'
      });
    }

    return NextResponse.json({
      needsSetup: !existingSuperadmin,
      message: existingSuperadmin 
        ? 'Superadmin already exists' 
        : 'No superadmin found, setup needed'
    });

  } catch (error) {
    console.error('Check superadmin setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
