"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { logAdminEvent } from "@/lib/audit";

/**
 * HIERARCHY SOURCE OF TRUTH
 */
async function getAuthorityLevel(user: { email: string; role: string }) {
  const ownerEmails = (process.env.OWNER_EMAILS || "").split(",");
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "").split(",");
  
  if (!user) return 0;
  if (ownerEmails.includes(user.email) || user.role === "OWNER") return 5;
  if (user.role === "ROOT" || superAdminEmails.includes(user.email)) return 4;
  if (user.role === "SUPER_ADMIN") return 3;
  if (user.role === "ADMIN") return 2;
  if (user.role === "TEACHER") return 1;
  return 0;
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser || !targetUser) return { error: "User not found" };

    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    const targetLevel = await getAuthorityLevel({ email: targetUser.email, role: targetUser.role });
    const newRoleLevel = await getAuthorityLevel({ email: "", role: newRole });

    // 🛡️ HIERARCHY LOCKS
    
    // 1. Peer-to-Peer & Vertical Block: You cannot modify someone at your level or higher
    if (currentLevel <= targetLevel && currentUser.id !== userId) {
      return { error: `Access Denied: You do not have authority over this ${targetUser.role} account.` };
    }

    // 2. Promotion Lock: Only ROOT (Level 4) or Owner (Level 5) can appoint ADMINs or above
    if (newRoleLevel >= 2 && currentLevel < 4) {
      return { error: "Access Denied: Only ROOT or OWNER can appoint leadership roles." };
    }

    if (newRoleLevel >= currentLevel && currentUser.role !== "OWNER" && !process.env.OWNER_EMAILS?.includes(currentUser.email)) {
      return { error: `Access Denied: You cannot assign a role equal to or higher than your own.` };
    }

    // 3. Self-Demotion Lock: Cannot demote the last remaining admin
    if (targetUser.role === "ADMIN" && newRole !== "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return { error: "Cannot demote the last remaining admin." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await logAdminEvent(currentUser.id, "ROLE_CHANGE", userId, { oldRole: targetUser.role, newRole });

    revalidatePath("/admin");
    return { success: true, message: `User role updated to ${newRole}` };
  } catch (err: any) {
    return { error: err.message || "Failed to update role" };
  }
}

export async function deleteUser(userId: string, adminPassword?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser || !targetUser) return { error: "User not found" };

    if (!adminPassword) return { error: "Administrator password is required for purge operations." };

    const isValid = await bcrypt.compare(adminPassword, currentUser.password || "");
    if (!isValid) return { error: "Incorrect administrator password. Deletion aborted." };

    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    const targetLevel = await getAuthorityLevel({ email: targetUser.email, role: targetUser.role });

    // 🛡️ HIERARCHY LOCKS
    if (currentLevel <= targetLevel && currentUser.id !== userId) {
      return { error: "Access Denied: You cannot purge an account at your level or higher." };
    }

    if (userId === currentUser.id) return { error: "You cannot delete your own account." };

    if (targetUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return { error: "Cannot delete the last remaining admin." };
    }

    await prisma.user.delete({ where: { id: userId } });

    await logAdminEvent(currentUser.id, "USER_DELETE", userId, { email: targetUser.email, role: targetUser.role });

    revalidatePath("/admin");
    return { success: true, message: "User deleted successfully" };
  } catch (err: any) {
    return { error: err.message || "Failed to delete user" };
  }
}

export async function updateUserStatus(userId: string, newStatus: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser || !targetUser) return { error: "User not found" };

    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    const targetLevel = await getAuthorityLevel({ email: targetUser.email, role: targetUser.role });

    // 🛡️ HIERARCHY LOCKS
    if (currentLevel <= targetLevel && currentUser.id !== userId) {
      return { error: "Access Denied: High Council members and Peers cannot be blocked." };
    }

    if (userId === currentUser.id && newStatus === "BLOCKED") {
      return { error: "You cannot block your own account." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    await logAdminEvent(currentUser.id, "STATUS_CHANGE", userId, { oldStatus: targetUser.status, newStatus });

    revalidatePath("/admin");
    return { success: true, message: `User status updated to ${newStatus}` };
  } catch (err: any) {
    return { error: err.message || "Failed to update user status" };
  }
}

export async function deleteCourse(courseId: string, force: boolean = false, adminPassword?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { error: "Admin not found." };

    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    if (currentLevel < 2) return { error: "Unauthorized" };

    if (!adminPassword) return { error: "Administrator password is required for destructive operations." };

    const isValid = await bcrypt.compare(adminPassword, currentUser.password || "");
    if (!isValid) return { error: "Incorrect administrator password. Deletion aborted." };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } }
    });
    if (!course) return { error: "Course not found" };

    // Only High Council (Level 4) can force delete with enrollments
    if (course._count.enrollments > 0 && currentLevel < 4) {
      return { error: "Cannot delete course with active enrollments. High Council override required." };
    }

    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath("/admin");
    revalidatePath("/courses");
    return { success: true, message: "Course deleted successfully" };
  } catch (err: any) { return { error: err.message }; }
}

export async function reviewTeacherApplication(applicationId: string, status: "APPROVED" | "REJECTED") {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { error: "Admin not found." };
    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    if (currentLevel < 2) return { error: "Unauthorized" };

    const application = await prisma.teacherApplication.findUnique({
      where: { id: applicationId },
      include: { user: { select: { email: true, name: true } } }
    });
    if (!application) return { error: "Application not found." };
    await prisma.teacherApplication.update({ where: { id: applicationId }, data: { status } });
    if (status === "APPROVED") {
      await prisma.user.update({ where: { id: application.userId }, data: { role: "TEACHER" } });
    }
    revalidatePath("/admin");
    return { success: true, message: `Application ${status.toLowerCase()} successfully.` };
  } catch (err: any) { return { error: err.message }; }
}

export async function reviewContentRequest(
  requestId: string, 
  status: "APPROVED" | "REJECTED", 
  adminFeedback?: string,
  customGracePeriodMinutes: number = 60
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { error: "Admin not found." };
    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    if (currentLevel < 2) return { error: "Unauthorized" };

    const request = await prisma.contentRequest.findUnique({
      where: { id: requestId },
      include: { lesson: true, course: true }
    });
    if (!request) return { error: "Request not found." };

    if (status === "APPROVED") {
      const gracePeriod = request.type === "EDIT" 
        ? new Date(Date.now() + customGracePeriodMinutes * 60 * 1000) 
        : null;

      if (request.lessonId) {
        if (request.type === "PUBLISH" || request.type === "EDIT" || request.type === "NEW_LESSON") {
          const updateData: any = {
            status: "PUBLISHED",
            approvedUntil: gracePeriod,
          };
          
          if (request.proposedData) {
            const data = JSON.parse(request.proposedData);
            if (data.title) updateData.title = data.title;
            if (data.content) updateData.content = data.content;
            if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
            if (data.isFreePreview !== undefined) updateData.isFreePreview = data.isFreePreview;
          }

          await prisma.lesson.update({
            where: { id: request.lessonId },
            data: updateData
          });
        } else if (request.type === "DELETE") {
          await prisma.lesson.delete({
            where: { id: request.lessonId }
          });
        }
      } else if (request.courseId) {
        if (request.type === "PUBLISH" || request.type === "EDIT") {
          const updateData: any = {
            status: "PUBLISHED",
            published: true, 
            approvedUntil: gracePeriod,
          };

          if (request.proposedData) {
            const data = JSON.parse(request.proposedData);
            if (data.title) updateData.title = data.title;
            if (data.description) updateData.description = data.description;
            if (data.price !== undefined) updateData.price = data.price;
          }

          await prisma.course.update({
            where: { id: request.courseId },
            data: updateData
          });
        } else if (request.type === "DELETE") {
          await prisma.course.delete({
            where: { id: request.courseId }
          });
        }
      }
    } else if (status === "REJECTED") {
      if (request.lessonId) {
        await prisma.lesson.update({
          where: { id: request.lessonId },
          data: { status: "REJECTED" }
        });
      } else if (request.courseId) {
        await prisma.course.update({
          where: { id: request.courseId },
          data: { status: "REJECTED" }
        });
      }
    }

    await prisma.contentRequest.update({
      where: { id: requestId },
      data: { 
        status,
        adminFeedback: adminFeedback || null 
      }
    });

    revalidatePath("/admin");
    revalidatePath("/courses");
    revalidatePath("/dashboard/teacher");
    revalidatePath(`/dashboard/teacher/courses/${request.courseId}`);
    revalidatePath(`/dashboard/teacher/courses/${request.courseId}/edit`);
    if (request.lessonId) {
      revalidatePath(`/dashboard/teacher/courses/${request.courseId}/lessons/${request.lessonId}/edit`);
    }

    return { success: true, message: `Content ${status.toLowerCase()} and changes applied.` };
  } catch (err: any) {
    console.error("Content Review Error:", err);
    return { error: err.message || "Failed to review content request." };
  }
}

export async function manualAssignCourse(userId: string, courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { error: "Admin not found." };
    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    if (currentLevel < 2) return { error: "Unauthorized" };

    await prisma.enrollment.create({ data: { userId, courseId } });
    revalidatePath("/admin");
    return { success: true, message: "Course assigned successfully" };
  } catch (err: any) { return { error: err.message }; }
}

export async function forgeAccount(data: { email: string; name: string; role: string; password?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { error: "Admin not found." };
    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });

    // Double-Lock: Forge requires Whitelist (Level 4)
    if (currentLevel < 4) return { error: "Access Denied: Super Admin Double-Lock required for Forge." };
    
    const actualPassword = data.password || Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(actualPassword, 10);
    
    const newUser = await prisma.user.create({
      data: { 
        email: data.email, 
        name: data.name, 
        role: data.role, 
        password: hashedPassword, 
        status: "ACTIVE",
        emailVerified: new Date()
      }
    });

    await logAdminEvent(currentUser.id, "FORGE_ACCOUNT", newUser.id, { email: data.email, role: data.role });
    
    revalidatePath("/admin");
    return { 
      success: true, 
      message: data.password 
        ? `Account forged successfully for ${data.email}.` 
        : `Account forged. Temp pass: ${actualPassword}` 
    };
  } catch (err: any) { 
    if (err.code === "P2002") return { error: "User with this email already exists." };
    return { error: err.message }; 
  }
}
