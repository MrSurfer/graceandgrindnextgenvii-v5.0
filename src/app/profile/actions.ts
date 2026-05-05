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
    if (existingApp.status === "PENDING") {
      return { error: "Application is currently being reviewed." };
    }
    
    if (existingApp.status === "REJECTED") {
      const lastUpdate = new Date(existingApp.updatedAt);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays < 7) {
        return { error: `Application was rejected. You can re-apply in ${7 - diffDays} days.` };
      }

      // Allow re-application: update status back to PENDING
      await prisma.teacherApplication.update({
        where: { id: existingApp.id },
        data: { status: "PENDING", updatedAt: new Date() }
      });
      
      revalidatePath("/profile");
      return { success: true, message: "Re-application submitted successfully." };
    }
    
    return { error: "Application already processed." };
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
