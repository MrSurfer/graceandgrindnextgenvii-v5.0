"use server";

import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import { logAdminEvent } from "@/lib/audit";
import { getAuthorityLevel as getPBACAuthorityLevel } from "@/lib/permissions";
import { createClient } from "@supabase/supabase-js";

/**
 * Verify admin password by re-authenticating with Supabase Auth.
 * Supabase Auth is the source of truth — passwords are NOT in the Prisma DB.
 */
async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  } catch {
    return false;
  }
}

/**
 * HIERARCHY SOURCE OF TRUTH
 */
async function getAuthorityLevel(user: { email: string; role: string }) {
  return getPBACAuthorityLevel(user.role, user.email);
}

export async function updateUserPermissions(userId: string, newPermissions: string[], adminPassword?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser || !targetUser) return { error: "User not found" };

    if (!adminPassword) return { error: "Administrator password is required to modify Keycards." };
    const isValid = await verifyAdminPassword(currentUser.email, adminPassword);
    if (!isValid) return { error: "Incorrect administrator password. Action aborted." };

    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    const targetLevel = await getAuthorityLevel({ email: targetUser.email, role: targetUser.role });
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "user:edit")) return { error: "Access Denied: Missing user:edit permission." };

    // 🛡️ HIERARCHY LOCKS
    if (currentLevel <= targetLevel && currentUser.id !== userId) {
      return { error: "Access Denied: You cannot modify permissions of someone at your level or higher." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { permissions: newPermissions },
    });

    await logAdminEvent(currentUser.id, "PERMISSION_CHANGE", userId, { oldPermissions: targetUser.permissions, newPermissions });

    revalidatePath("/admin");
    return { success: true, message: `Permissions updated successfully.` };
  } catch (err: any) {
    return { error: err.message || "Failed to update permissions" };
  }
}


export async function updateUserRole(userId: string, newRole: string, adminPassword?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser || !targetUser) return { error: "User not found" };

    if (!adminPassword) return { error: "Administrator password is required to modify Roles." };
    const isValid = await verifyAdminPassword(currentUser.email, adminPassword);
    if (!isValid) return { error: "Incorrect administrator password. Action aborted." };

    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    const targetLevel = await getAuthorityLevel({ email: targetUser.email, role: targetUser.role });
    const newRoleLevel = await getAuthorityLevel({ email: "", role: newRole });
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "user:promote")) return { error: "Access Denied: Missing user:promote permission." };

    // 🛡️ HIERARCHY LOCKS
    
    // 1. Peer-to-Peer & Vertical Block: You cannot modify someone at your level or higher
    if (currentLevel <= targetLevel && currentUser.id !== userId) {
      return { error: `Access Denied: You do not have authority over this ${targetUser.role} account.` };
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

    await prisma.notification.create({
      data: {
        userId: userId,
        type: "ROLE_CHANGE",
        message: `Your account role has been updated from ${targetUser.role} to ${newRole}.`
      }
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
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser || !targetUser) return { error: "User not found" };

    if (!adminPassword) return { error: "Administrator password is required for purge operations." };

    const isValid = await verifyAdminPassword(currentUser.email, adminPassword);
    if (!isValid) return { error: "Incorrect administrator password. Deletion aborted." };

    const currentLevel = await getAuthorityLevel({ email: currentUser.email, role: currentUser.role });
    const targetLevel = await getAuthorityLevel({ email: targetUser.email, role: targetUser.role });
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "user:delete")) return { error: "Access Denied: Missing user:delete permission." };

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
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "user:block")) return { error: "Access Denied: Missing user:block permission." };

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

    const isValid = await verifyAdminPassword(currentUser.email, adminPassword);
    if (!isValid) return { error: "Incorrect administrator password. Deletion aborted." };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } }
    });
    if (!course) return { error: "Course not found" };

    const permissions = (session.user as any).permissions || [];
    const { hasPermission } = await import("@/lib/permissions");
    if (!hasPermission(permissions, "course:delete")) return { error: "Access Denied: Missing course:delete permission." };

    // Only High Council (Level 4) can force delete with enrollments
    if (course._count.enrollments > 0 && !hasPermission(permissions, "course:delete_active")) {
      return { error: "Cannot delete course with active enrollments. 'course:delete_active' permission required." };
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
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "user:promote")) return { error: "Access Denied: Missing user:promote permission." };

    const application = await prisma.teacherApplication.findUnique({
      where: { id: applicationId },
      include: { user: { select: { email: true, name: true } } }
    });
    if (!application) return { error: "Application not found." };
    await prisma.teacherApplication.update({ where: { id: applicationId }, data: { status } });
    if (status === "APPROVED") {
      await prisma.user.update({ where: { id: application.userId }, data: { role: "TEACHER" } });
    }

    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: "APPLICATION_REVIEW",
        message: `Your teacher application has been ${status.toLowerCase()}.`
      }
    });

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
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "content:approve")) return { error: "Access Denied: Missing content:approve permission." };

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

    // Notify the teacher
    const targetUserId = request.course?.teacherId;
    if (targetUserId) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "CONTENT_REVIEW",
          message: `Your content request for ${request.lessonId ? 'lesson' : 'course'} has been ${status.toLowerCase()}.${adminFeedback ? ' See feedback for details.' : ''}`
        }
      });
    }

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
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "user:edit")) return { error: "Access Denied: Missing user:edit permission." };

    await prisma.enrollment.create({ data: { userId, courseId } });
    revalidatePath("/admin");
    return { success: true, message: "Course assigned successfully" };
  } catch (err: any) { return { error: err.message }; }
}

export async function forgeAccount(data: { email: string; name: string; role: string; password?: string }, adminPassword?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { error: "Admin not found." };
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    
    if (!hasPermission(permissions, "user:forge")) return { error: "Access Denied: Missing user:forge permission." };

    if (!adminPassword) return { error: "Administrator password is required to forge an account." };
    const isValid = await verifyAdminPassword(currentUser.email, adminPassword);
    if (!isValid) return { error: "Incorrect administrator password. Action aborted." };
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: "Supabase Service Role Key is required in .env. Please add SUPABASE_SERVICE_ROLE_KEY." };
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const actualPassword = data.password || Math.random().toString(36).slice(-10);
    
    // Create user in Supabase Auth. The DB trigger automatically creates the Prisma row!
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: actualPassword,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        role: data.role, // Trigger will map this to Prisma role!
      }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { error: "User with this email already exists." };
      }
      return { error: authError.message };
    }

    // Wait 1 second for the trigger to insert into Prisma
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (newUser) {
      await logAdminEvent(currentUser.id, "FORGE_ACCOUNT", newUser.id, { email: data.email, role: data.role });
    }
    
    revalidatePath("/admin");
    return { 
      success: true, 
      message: data.password 
        ? `Account forged successfully for ${data.email}.` 
        : `Account forged. Temp pass: ${actualPassword}` 
    };
  } catch (err: any) { 
    return { error: err.message }; 
  }
}

export async function getCourseAnalytics(courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { error: "Admin not found." };
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "analytics:view")) return { error: "Access Denied: Missing analytics:view permission." };

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: { id: true, title: true }
    });

    if (lessons.length === 0) return { data: [] };

    const progressData = await prisma.lessonProgress.findMany({
      where: { lesson: { courseId } },
      select: { lessonId: true, userId: true }
    });

    const completionCounts: Record<string, number> = {};
    lessons.forEach(l => completionCounts[l.id] = 0);
    
    progressData.forEach(p => {
      if (completionCounts[p.lessonId] !== undefined) {
        completionCounts[p.lessonId]++;
      }
    });

    const analyticsData = lessons.map((lesson, index) => {
      const completions = completionCounts[lesson.id];
      const previousCompletions = index === 0 ? completions : completionCounts[lessons[index - 1].id];
      // Drop-off is the number of people who completed the previous lesson but NOT this one
      const dropOff = index === 0 ? 0 : Math.max(0, previousCompletions - completions);
      
      return {
        lessonId: lesson.id,
        title: lesson.title,
        completions,
        dropOff
      };
    });

    return { data: analyticsData };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getHRMetrics() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!currentUser) return { error: "User not found." };
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "hr:metrics")) return { error: "Access Denied: Missing hr:metrics permission." };

    // Teacher Metrics
    const teachers = await prisma.user.findMany({
      where: { role: { in: ["TEACHER", "ADMIN", "SUPER_ADMIN", "OWNER"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        coursesCreated: {
          select: {
            id: true,
            title: true,
            published: true,
            _count: { select: { enrollments: true, lessons: true } }
          }
        }
      }
    });

    const teacherMetrics = teachers
      .filter(t => t.coursesCreated.length > 0)
      .map(t => {
        const totalCourses = t.coursesCreated.length;
        const publishedCourses = t.coursesCreated.filter(c => c.published).length;
        const totalEnrollments = t.coursesCreated.reduce((sum, c) => sum + c._count.enrollments, 0);
        const totalLessons = t.coursesCreated.reduce((sum, c) => sum + c._count.lessons, 0);

        return {
          id: t.id,
          name: t.name || t.email,
          email: t.email,
          role: t.role,
          joinedAt: t.createdAt,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          totalLessons,
          avgEnrollmentsPerCourse: totalCourses > 0 ? +(totalEnrollments / totalCourses).toFixed(1) : 0,
        };
      })
      .sort((a, b) => b.totalEnrollments - a.totalEnrollments);

    // Admin Metrics (actions taken)
    const adminActions = await prisma.eventLog.groupBy({
      by: ['actorId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    const adminIds = adminActions.map(a => a.actorId);
    const adminUsers = await prisma.user.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    const adminMetrics = adminActions.map(action => {
      const user = adminUsers.find(u => u.id === action.actorId);
      return {
        id: action.actorId,
        name: user?.name || user?.email || "Unknown",
        email: user?.email || "",
        role: user?.role || "UNKNOWN",
        totalActions: action._count.id,
      };
    });

    return { teacherMetrics, adminMetrics };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function replyToSupportTicket(ticketId: string, message: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    
    const { hasPermission } = await import("@/lib/permissions");
    const permissions = (session.user as any).permissions || [];
    if (!hasPermission(permissions, "support:reply")) return { error: "Access Denied: Missing support:reply permission." };

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: "IN_PROGRESS",
        replies: {
          create: {
            message,
            senderId: session.user.id
          }
        }
      }
    });

    // Also send an email notification here if desired
    
    revalidatePath("/admin");
    return { success: true, message: "Reply sent successfully." };
  } catch (err: any) {
    return { error: err.message || "Failed to send reply." };
  }
}
