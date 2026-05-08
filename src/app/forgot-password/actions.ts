"use server";

import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/mail";
import { logInfo } from "../actions/logger";

export async function requestPasswordReset(email: string) {
  if (!email) throw new Error("Email is required.");

  const user = await prisma.user.findUnique({ where: { email } });
  
  // For security, we don't reveal if the user exists or not.
  // We just say "If an account exists, a link has been sent."
  if (!user) {
    return { success: true };
  }

  // Generate a 6-digit OTP
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store token in DB
  await prisma.passwordResetToken.upsert({
    where: { email },
    update: { token, expires },
    create: { email, token, expires },
  });

  // Send actual email
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: "Reset your GraceAndGrind password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #000; color: #fff;">
        <h1 style="color: #f59e0b; text-align: center;">Password Reset Request</h1>
        <p style="font-size: 16px; line-height: 1.5;">You requested a password reset for your GraceAndGrind account. Enter the following 6-digit code on the reset page:</p>
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #f59e0b;">${token}</span>
        </div>
        <p style="font-size: 14px; color: #9ca3af; text-align: center;">This code will expire in 15 minutes.</p>
        <p style="font-size: 14px; color: #9ca3af;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  });

  logInfo(`Password reset link sent to ${email}`);

  return { success: true };
}
