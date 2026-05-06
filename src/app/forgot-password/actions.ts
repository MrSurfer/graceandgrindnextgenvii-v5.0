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

  // Generate a token
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

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
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
        <h1 style="color: #f59e0b;">Password Reset Request</h1>
        <p>Hi,</p>
        <p>You requested a password reset for your GraceAndGrind account. Click the button below to set a new password. This link will expire in 1 hour.</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #f59e0b; color: #000; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">Reset Password</a>
        <p style="margin-top: 30px; color: #6b7280; font-size: 0.875rem;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  });

  logInfo(`Password reset link sent to ${email}`);

  return { success: true };
}
