import { NextResponse } from "next/server";
import { userOperations } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/profile - Get current user profile
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await userOperations.findById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Remove sensitive info
  const { password, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}

// PUT /api/profile - Update profile user sendiri
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, email, oldPassword, newPassword } = body;
    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await userOperations.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Validasi password lama untuk semua perubahan
    if (oldPassword) {
      const match = await bcrypt.compare(oldPassword, user.password || "");
      if (!match) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
      }
    }
    
    // Jika ada perubahan name atau password, current password wajib
    const isNameChanged = name !== user.name;
    const isPasswordChanged = newPassword;
    
    if ((isNameChanged || isPasswordChanged) && !oldPassword) {
      return NextResponse.json({ error: "Current password is required for profile changes" }, { status: 400 });
    }
    // Update profile
    const updatedUser = await userOperations.updateProfile({
      id,
      name,
      email,
      newPassword: newPassword ? newPassword : undefined,
    });
    const { password: _, ...safeUser } = updatedUser;
    return NextResponse.json({ user: safeUser, success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
