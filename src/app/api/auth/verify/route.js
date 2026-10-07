import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-simple";

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

function redirectToLogin(request, status) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(status === "verified" ? "verified" : "verification", status === "verified" ? "1" : status);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) {
      return redirectToLogin(request, "invalid");
    }

    const verificationToken = hashToken(token);
    const user = await prisma.user.findUnique({ where: { verificationToken } });
    if (!user) {
      return redirectToLogin(request, "invalid");
    }

    if (!user.verificationExpires || user.verificationExpires <= new Date()) {
      await prisma.user.updateMany({
        where: { id: user.id, verificationToken },
        data: { verificationToken: null, verificationExpires: null },
      });
      return redirectToLogin(request, "expired");
    }

    const result = await prisma.user.updateMany({
      where: { id: user.id, verificationToken, emailVerified: false },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    if (result.count === 0 && !user.emailVerified) {
      return redirectToLogin(request, "invalid");
    }

    return redirectToLogin(request, "verified");
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Email verification failed. Please try again later." }, { status: 500 });
  }
}
