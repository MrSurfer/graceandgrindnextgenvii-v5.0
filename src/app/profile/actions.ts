"use server";

import { auth } from "@/lib/supabase/server-auth";
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, nameLockedAt: true, nameChangePass: true }
    });

    if (!user) return { error: "User not found" };

    const isChangingName = data.name && data.name.trim() !== (user.name || "").trim();
    let nameLockUpdate: Record<string, any> = {};

    if (isChangingName) {
      if (user.nameLockedAt && !user.nameChangePass) {
        return { error: "Your name is locked. Please open a Support Ticket to request a one-time name change pass." };
      }
      // If they have a pass and are changing name, consume the pass and keep locked
      if (user.nameLockedAt && user.nameChangePass) {
        nameLockUpdate = { nameChangePass: false };
      }
      // First time setting name — lock it
      if (!user.nameLockedAt && data.name?.trim()) {
        nameLockUpdate = { nameLockedAt: new Date() };
      }
    }

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
        ...nameLockUpdate,
      },
    });

    revalidatePath("/profile");
    return { 
      success: true, 
      message: isChangingName && user.nameChangePass 
        ? "Name updated. Your one-time pass has been used and the name is locked again." 
        : "Profile updated successfully" 
    };
  } catch (err: any) {
    return { error: err.message || "Failed to update profile" };
  }
}

export async function requestAccountDeletion() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { status: "BLOCKED" }
    });

    return { success: true, message: "Account deletion requested" };
  } catch (err: any) {
    return { error: err.message || "Failed to request deletion" };
  }
}
