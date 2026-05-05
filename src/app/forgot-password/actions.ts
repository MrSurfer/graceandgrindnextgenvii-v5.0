"use server";

import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

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

  // Simulate sending email
  const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  console.log("-----------------------------------------");
  console.log(`PASSWORD RESET REQUEST FOR: ${email}`);
  console.log(`RESET LINK: ${resetLink}`);
  console.log("-----------------------------------------");

  return { success: true };
}
