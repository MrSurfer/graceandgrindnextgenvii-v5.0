"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";

export async function markLessonComplete(lessonId: string, courseSlug: string, lessonSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const userId = session.user.id;
    const existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } }
    });

    if (!existing) {
      await prisma.lessonProgress.create({
        data: { userId, lessonId }
      });
    }

    revalidatePath(`/courses`);
    revalidatePath(`/courses/${courseSlug}`);
    revalidatePath(`/courses/${courseSlug}/${lessonSlug}`);
    revalidatePath(`/`);
    
    return { success: true, message: "Lesson marked as complete" };
  } catch (err: any) {
    return { error: err.message || "Failed to mark complete" };
  }
}

export async function addComment(lessonId: string, content: string, courseSlug: string, lessonSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

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
