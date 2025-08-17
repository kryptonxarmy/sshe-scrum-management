import { NextResponse } from 'next/server';
import { taskOperations } from '@/lib/prisma';

// GET /api/tasks/all - Get all tasks without filters
export async function GET() {
  try {
    const tasks = await taskOperations.getAll();
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get all tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
