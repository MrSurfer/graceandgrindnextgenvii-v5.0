import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req.headers);
    const limit = await checkRateLimit(ip, "register", { points: 3, duration: 3600 }); // 3 registrations per hour per IP

    if (!limit.success) {
      return NextResponse.json({ error: limit.error }, { status: 429 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (!existing.password) {
        return NextResponse.json({ 
          error: "This email is already associated with a social account. Please sign in with Google or GitHub." 
        }, { status: 400 });
      }
      return NextResponse.json({ error: "Email already in use." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // Auto-promote if email is in whitelist
    const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    const role = superAdminEmails.includes(email) ? "SUPER_ADMIN" : "CUSTOMER";

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
