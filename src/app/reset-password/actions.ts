"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function resetPassword(token: string, password: string) {
  if (!token || !password) throw new Error("Token and password are required.");

  // Find the token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    throw new Error("Invalid or expired reset token.");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user password
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  });

  // Delete the used token
  await prisma.passwordResetToken.delete({
    where: { token },
  });

  return { success: true };
}
