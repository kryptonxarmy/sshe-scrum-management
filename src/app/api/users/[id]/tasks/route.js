import { NextResponse } from 'next/server';
import { taskOperations } from '@/lib/prisma';

// GET /api/users/[id]/tasks - Get tasks accessible to a user based on project membership
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const functionId = searchParams.get('functionId');
    const status = searchParams.get('status');
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const filters = {};
    if (status) filters.status = status.toUpperCase();
    if (functionId) filters.functionId = functionId;

    // Get tasks from projects where user is owner or member
    const tasks = await taskOperations.getUserAccessibleTasks(id, filters);

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error('Get user tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
