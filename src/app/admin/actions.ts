"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

/**
 * HIERARCHY SOURCE OF TRUTH
 * The whitelist is the ultimate authority.
 */
async function isSuperUser(session: any) {
  if (!session?.user?.email) return false;
  const whitelist = (process.env.SUPER_ADMIN_EMAILS || "").split(",");
  return whitelist.includes(session.user.email);
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const session = await auth();
    const isSuper = await isSuperUser(session);
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    if (!session?.user?.id || (!isAdmin && !isSuper)) {
      return { error: "Unauthorized" };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return { error: "User not found" };

    // 🛡️ HIERARCHY LOCKS
    
    // 1. Super Admin is untouchable by anyone else
    if (targetUser.role === "SUPER_ADMIN" && !isSuper) {
      return { error: "Access Denied: You cannot modify a High Council member." };
    }

    // 2. Peer-to-Peer & Vertical Lock for standard Admins
    if (!isSuper) {
      // Admins cannot modify other Admins
      if (targetUser.role === "ADMIN" && userId !== session.user.id) {
        return { error: "Access Denied: You cannot modify another Admin account." };
      }
      // Admins cannot promote anyone to ADMIN or SUPER_ADMIN
      if (newRole === "ADMIN" || newRole === "SUPER_ADMIN") {
        return { error: "Access Denied: Only the High Council can appoint new leadership roles." };
      }
    }

    // Protection for last remaining admin
    if (newRole !== "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (targetUser.role === "ADMIN" && adminCount <= 1) {
        return { error: "Cannot demote the last remaining admin." };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin");
    return { success: true, message: `User role updated to ${newRole}` };
  } catch (err: any) {
    return { error: err.message || "Failed to update role" };
  }
}

export async function deleteUser(userId: string, adminPassword?: string) {
  try {
    const session = await auth();
    const isSuper = await isSuperUser(session);
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    if (!session?.user?.id || (!isAdmin && !isSuper)) {
      return { error: "Unauthorized" };
    }

    if (!adminPassword) return { error: "Administrator password is required for purge operations." };

    const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!admin || !admin.password) return { error: "Admin authentication failure." };

    const isValid = await bcrypt.compare(adminPassword, admin.password);
    if (!isValid) return { error: "Incorrect administrator password. Deletion aborted." };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found" };

    // 🛡️ HIERARCHY LOCKS
    if (user.role === "SUPER_ADMIN" && !isSuper) {
      return { error: "Access Denied: High Council members cannot be purged." };
    }

    if (!isSuper && user.role === "ADMIN" && userId !== session.user.id) {
      return { error: "Access Denied: You cannot delete another Admin account." };
    }

    if (userId === session.user.id) {
      return { error: "You cannot delete your own account." };
    }

    if (user?.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return { error: "Cannot delete the last remaining admin." };
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin");
    return { success: true, message: "User deleted successfully" };
  } catch (err: any) {
    return { error: err.message || "Failed to delete user" };
  }
}

export async function updateUserStatus(userId: string, newStatus: string) {
  try {
    const session = await auth();
    const isSuper = await isSuperUser(session);
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    if (!session?.user?.id || (!isAdmin && !isSuper)) {
      return { error: "Unauthorized" };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return { error: "User not found" };

    // 🛡️ HIERARCHY LOCKS
    if (targetUser.role === "SUPER_ADMIN" && !isSuper) {
      return { error: "Access Denied: High Council members cannot be blocked." };
    }

    if (!isSuper && targetUser.role === "ADMIN" && userId !== session.user.id) {
      return { error: "Access Denied: You cannot block another Admin account." };
    }

    if (userId === session.user.id && newStatus === "BLOCKED") {
      return { error: "You cannot block your own account." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    revalidatePath("/admin");
    return { success: true, message: `User status updated to ${newStatus}` };
  } catch (err: any) {
    return { error: err.message || "Failed to update user status" };
  }
}

// ... (rest of the file remains unchanged and hierarchical)
export async function deleteCourse(courseId: string, force: boolean = false, adminPassword?: string) {
  try {
    const session = await auth();
    const isSuper = await isSuperUser(session);
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    if (!session?.user?.id || (!isAdmin && !isSuper)) return { error: "Unauthorized" };

    if (!adminPassword) return { error: "Administrator password is required for destructive operations." };

    const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!admin || !admin.password) return { error: "Admin authentication failure." };

    const isValid = await bcrypt.compare(adminPassword, admin.password);
    if (!isValid) return { error: "Incorrect administrator password. Deletion aborted." };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } }
    });
    if (!course) return { error: "Course not found" };
    if (course._count.enrollments > 0 && !force) {
      return { error: "Cannot delete course with active enrollments. Use Super Admin override." };
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
    const isSuper = await isSuperUser(session);
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    if (!session?.user?.id || (!isAdmin && !isSuper)) return { error: "Unauthorized" };
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
    const isSuper = await isSuperUser(session);
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    if (!session?.user?.id || (!isAdmin && !isSuper)) return { error: "Unauthorized" };

    const request = await prisma.contentRequest.findUnique({
      where: { id: requestId },
      include: { lesson: true, course: true }
    });
    if (!request) return { error: "Request not found." };

    if (status === "APPROVED") {
      // Custom Grace period only for explicit EDIT requests. 
      // PUBLISH/NEW_LESSON results in an immediate LOCK.
      const gracePeriod = request.type === "EDIT" 
        ? new Date(Date.now() + customGracePeriodMinutes * 60 * 1000) 
        : null;

      if (request.lessonId) {
        // Lesson-level request
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
        // Course-level request
        if (request.type === "PUBLISH" || request.type === "EDIT") {
          const updateData: any = {
            status: "PUBLISHED",
            published: true, // Legacy compatibility
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
      // Revert status to REJECTED so teacher can fix and re-apply
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
    const isSuper = await isSuperUser(session);
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    if (!session?.user?.id || (!isAdmin && !isSuper)) return { error: "Unauthorized" };
    await prisma.enrollment.create({ data: { userId, courseId } });
    revalidatePath("/admin");
    return { success: true, message: "Course assigned successfully" };
  } catch (err: any) { return { error: err.message }; }
}

export async function forgeAccount(data: { email: string; name: string; role: string; password?: string }) {
  try {
    const session = await auth();
    if (!await isSuperUser(session)) return { error: "Access Denied: Super Admin Double-Lock required." };
    
    const actualPassword = data.password || Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(actualPassword, 10);
    
    await prisma.user.create({
      data: { 
        email: data.email, 
        name: data.name, 
        role: data.role, 
        password: hashedPassword, 
        status: "ACTIVE" 
      }
    });
    
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
