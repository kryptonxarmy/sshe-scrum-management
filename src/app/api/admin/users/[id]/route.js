import { NextResponse } from 'next/server';
import { userOperations, prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/admin/users/[id] - Get user by ID (superadmin only)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Current user ID is required' },
        { status: 400 }
      );
    }

    // Check if current user is superadmin
    const currentUser = await userOperations.findById(currentUserId);
    if (!currentUser || (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
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
            assignedTasks: true,
            projectMemberships: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user (superadmin only)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      role, 
      department, 
      isActive,
      currentUserId 
    } = body;

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Current user ID is required' },
        { status: 400 }
      );
    }

    // Check if current user is superadmin
    const currentUser = await userOperations.findById(currentUserId);
    if (!currentUser || (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await userOperations.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      name: name || existingUser.name,
      role: role ? role.toUpperCase() : existingUser.role,
      department: department !== undefined ? department : existingUser.department,
      isActive: isActive !== undefined ? isActive : existingUser.isActive,
      updatedAt: new Date()
    };

    // Update email if provided and different
    if (email && email !== existingUser.email) {
      // Check if new email already exists
      const emailExists = await userOperations.findByEmail(email);
      if (emailExists && emailExists.id !== id) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      updateData.email = email;
    }

    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
            assignedTasks: true,
            projectMemberships: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user (superadmin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Current user ID is required' },
        { status: 400 }
      );
    }

    // Check if current user is superadmin
    const currentUser = await userOperations.findById(currentUserId);
    if (!currentUser || (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Superadmin access required.' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (currentUserId === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await userOperations.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has active projects or tasks
    const userProjects = await prisma.project.count({
      where: { ownerId: id }
    });

    const userTasks = await prisma.task.count({
      where: { 
        OR: [
          { assigneeId: id },
          { createdById: id }
        ]
      }
    });

    if (userProjects > 0 || userTasks > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete user. They have ${userProjects} active projects and ${userTasks} tasks. Please reassign them first.` 
        },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
