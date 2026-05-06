"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

export async function applyForTeacher() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // Rate limit: 2 application attempts per 24 hours
    const limit = await checkRateLimit(session.user.id, "teacher-apply", { points: 2, duration: 86400 });
    if (!limit.success) return { error: limit.error };

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
      data: { userId: session.user.id }
    });

    revalidatePath("/profile");
    return { success: true, message: "Teacher application submitted!" };
  } catch (err: any) {
    return { error: err.message || "Failed to submit application" };
  }
}

export async function updateProfile(data: { 
  name?: string; 
  image?: string | null;
  bio?: string | null;
  website?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        image: data.image,
        bio: data.bio,
        website: data.website,
        twitter: data.twitter,
        instagram: data.instagram,
        linkedin: data.linkedin,
      },
    });

    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully" };
  } catch (err: any) {
    return { error: err.message || "Failed to update profile" };
  }
}

export async function requestAccountDeletion() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // In a real scenario, you'd send an email to admin or queue it for deletion.
    // For now, we will just block the account to simulate a soft delete request.
    await prisma.user.update({
      where: { id: session.user.id },
      data: { status: "BLOCKED" }
    });

    return { success: true, message: "Account deletion requested" };
  } catch (err: any) {
    return { error: err.message || "Failed to request deletion" };
  }
}
