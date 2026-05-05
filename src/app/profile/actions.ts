"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function applyForTeacher() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existingApp = await prisma.teacherApplication.findUnique({
    where: { userId: session.user.id }
  });

  if (existingApp) {
    return { error: "Application already submitted." };
  }

  await prisma.teacherApplication.create({
    data: {
      userId: session.user.id
    }
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function requestAccountDeletion() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // In a real scenario, you'd send an email to admin or queue it for deletion.
  // For now, we will just block the account to simulate a soft delete request.
  // Alternatively, the admin dashboard can see a specific flag. We'll just block them.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { status: "BLOCKED" }
  });

  return { success: true };
}
