"use server";

import { prisma } from "@/lib/prisma";

export async function verifyOTP(email: string, code: string) {
  if (!email || !code) return { error: "Email and code are required." };

  try {
    const record = await prisma.verificationCode.findUnique({
      where: { email }
    });

    if (!record) return { error: "No verification code found for this email." };

    if (record.code !== code) return { error: "Invalid verification code." };

    if (new Date() > record.expires) return { error: "Verification code has expired." };

    // Update user
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    // Delete code
    await prisma.verificationCode.delete({
      where: { email }
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function resendOTP(email: string) {
  if (!email) return { error: "Email is required." };

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationCode.upsert({
      where: { email },
      update: { code: otpCode, expires },
      create: { email, code: otpCode, expires },
    });

    // Send email
    const { sendEmail } = require("@/lib/mail");
    await sendEmail({
      to: email,
      subject: "Your New Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #000; color: #fff;">
          <h1 style="color: #f59e0b; text-align: center;">New Verification Code</h1>
          <p style="font-size: 16px; line-height: 1.5;">Your new 6-digit verification code is:</p>
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #f59e0b;">${otpCode}</span>
          </div>
          <p style="font-size: 14px; color: #9ca3af; text-align: center;">This code will expire in 15 minutes.</p>
        </div>
      `
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
