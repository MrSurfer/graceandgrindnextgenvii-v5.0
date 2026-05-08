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
    const ownerEmails = process.env.OWNER_EMAILS?.split(",").map(e => e.trim()) || [];
    
    let role = "CUSTOMER";
    if (ownerEmails.includes(email)) role = "OWNER";
    else if (superAdminEmails.includes(email)) role = "SUPER_ADMIN";

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    // --- EMAIL VERIFICATION LOGIC ---
    // Generate 6-digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationCode.upsert({
      where: { email },
      update: { code: otpCode, expires },
      create: { email, code: otpCode, expires },
    });

    // Import sendEmail from lib/mail
    const { sendEmail } = require("@/lib/mail");
    await sendEmail({
      to: email,
      subject: "Verify your Grace & Grind Account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #000; color: #fff;">
          <h1 style="color: #f59e0b; text-align: center;">Welcome to the Mastery!</h1>
          <p style="font-size: 16px; line-height: 1.5;">Hi ${name},</p>
          <p style="font-size: 16px; line-height: 1.5;">Thank you for joining Grace & Grind. To finalize your account, please enter the following 6-digit verification code:</p>
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #f59e0b;">${otpCode}</span>
          </div>
          <p style="font-size: 14px; color: #9ca3af; text-align: center;">This code will expire in 15 minutes.</p>
          <p style="font-size: 14px; color: #9ca3af;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
