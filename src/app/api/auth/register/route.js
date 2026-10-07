import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma-simple";
import { sendVerificationEmail } from "@/lib/email";

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser?.emailVerified) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const token = randomBytes(32).toString("hex");
    const verificationToken = hashToken(token);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { verificationToken, verificationExpires },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: await bcrypt.hash(password, 12),
          role: "TEAM_MEMBER",
          isActive: true,
          emailVerified: false,
          verificationToken,
          verificationExpires,
          userSettings: { create: {} },
        },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.url;
    const verificationUrl = new URL("/api/auth/verify", appUrl);
    verificationUrl.searchParams.set("token", token);

    try {
      await sendVerificationEmail({ to: email, verificationUrl: verificationUrl.toString() });
    } catch (error) {
      console.error("Send verification email error:", error);
      return NextResponse.json(
        { error: "Your account is registered, but we could not send the verification email. Please try registering again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: existingUser
          ? "A new verification email was sent. Use your original password after verifying."
          : "Registration successful. Check your email for the verification link.",
      },
      { status: existingUser ? 200 : 201 }
    );
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
