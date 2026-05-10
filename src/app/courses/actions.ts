"use server";

import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";

import { resolvePermissions, hasPermission } from "@/lib/permissions";

export async function markLessonComplete(lessonId: string, courseSlug: string, lessonSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const userId = session.user.id;
    const existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } }
    });

    let courseCompleted = false;
    let certificateId: string | undefined;

    if (!existing) {
      await prisma.lessonProgress.create({
        data: { userId, lessonId }
      });

      // Certificate Generation Logic
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
      if (lesson) {
        const totalLessons = await prisma.lesson.count({ 
          where: { courseId: lesson.courseId, status: "PUBLISHED" } 
        });
        const completedLessons = await prisma.lessonProgress.count({ 
          where: { userId, lesson: { courseId: lesson.courseId } }
        });

        if (totalLessons > 0 && completedLessons >= totalLessons) {
          courseCompleted = true;
          const cert = await prisma.certificate.upsert({
            where: { userId_courseId: { userId, courseId: lesson.courseId } },
            create: { userId, courseId: lesson.courseId },
            update: {}
          });
          certificateId = cert.id;

          await prisma.notification.create({
            data: {
              userId,
              type: "CERTIFICATE_EARNED",
              message: `Congratulations! You have earned a certificate for completing the course.`
            }
          });
        }
      }
    }

    revalidatePath(`/courses`);
    revalidatePath(`/courses/${courseSlug}`);
    revalidatePath(`/courses/${courseSlug}/${lessonSlug}`);
    revalidatePath(`/`);
    
    return { success: true, message: "Lesson marked as complete", courseCompleted, certificateId };
  } catch (err: any) {
    return { error: err.message || "Failed to mark complete" };
  }
}

export async function addComment(lessonId: string, content: string, courseSlug: string, lessonSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // Check lesson:comment permission
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, permissions: true } });
    if (!user) return { error: "User not found" };
    const userPerms = resolvePermissions(user.role, user.permissions);
    if (!hasPermission(userPerms, "lesson:comment")) {
      return { error: "Commenting is disabled for your account." };
    }

    // Verify enrollment (or admin/teacher)
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { courseId: true } });
    if (!lesson) return { error: "Lesson not found" };
    const isAdminOrTeacher = ["ADMIN", "SUPER_ADMIN", "ROOT", "OWNER", "TEACHER"].includes(user.role);
    if (!isAdminOrTeacher) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: lesson.courseId } }
      });
      if (!enrollment) return { error: "You must be enrolled to comment." };
    }

    // Rate limit: 5 comments per minute
    const limit = await checkRateLimit(session.user.id, "add-comment", { points: 5, duration: 60 });
    if (!limit.success) return { error: limit.error };

    await prisma.comment.create({
      data: {
        content,
        lessonId,
        userId: session.user.id
      }
    });

    revalidatePath(`/courses/${courseSlug}/${lessonSlug}`);
    return { success: true, message: "Comment added" };
  } catch (err: any) {
    return { error: err.message || "Failed to add comment" };
  }
}

export async function deleteComment(commentId: string, courseSlug: string, lessonSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    const userRole = (session.user as any).role;
    if (!comment || (comment.userId !== session.user.id && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
      return { error: "Unauthorized" };
    }

    await prisma.comment.delete({ where: { id: commentId } });

    revalidatePath(`/courses/${courseSlug}/${lessonSlug}`);
    return { success: true, message: "Comment deleted" };
  } catch (err: any) {
    return { error: err.message || "Failed to delete comment" };
  }
}

export async function enrollInFreeCourse(courseId: string, courseSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const userId = session.user.id;
    
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { error: "Course not found" };
    if (course.price !== 0) return { error: "This course is not free" };

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    revalidatePath(`/courses`);
    revalidatePath(`/courses/${courseSlug}`);
    revalidatePath(`/profile`);
    revalidatePath(`/`);
    
    return { success: true, message: "Successfully enrolled in course" };
  } catch (err: any) {
    return { error: err.message || "Failed to enroll" };
  }
}
