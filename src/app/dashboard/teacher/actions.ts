"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCourse(courseId: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const course = await prisma.course.findUnique({ 
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } }
    });
    
    if (!course || (course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return { error: "Unauthorized to edit this course" };
    }

    if (course.published && data.published === false && course._count.enrollments > 0 && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN") {
      return { error: "Cannot unpublish a course with active students." };
    }

    if (course.published && data.price !== undefined && data.price !== course.price && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN") {
      return { error: "Price cannot be changed once the course is published." };
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        ...data,
        isPriceLocked: course.published ? true : course.isPriceLocked,
      },
    });

    revalidatePath(`/dashboard/teacher/courses/${courseId}`);
    revalidatePath(`/courses`);
    return { success: true, message: "Course updated successfully" };
  } catch (err: any) {
    return { error: err.message || "Failed to update course" };
  }
}

export async function createLesson(courseId: string, title: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || (course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return { error: "Unauthorized" };
    }

    const lessonCount = await prisma.lesson.count({ where: { courseId } });
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        courseId,
        order: lessonCount,
        status: "DRAFT",
      },
    });

    revalidatePath(`/dashboard/teacher/courses/${courseId}`);
    return { success: true, lessonId: lesson.id, message: "Lesson created" };
  } catch (err: any) {
    return { error: err.message || "Failed to create lesson" };
  }
}

export async function updateLesson(lessonId: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
    if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return { error: "Unauthorized" };
    }

    if (data.videoUrl) {
      if (data.videoUrl.includes('youtube.com/watch?v=') || data.videoUrl.includes('youtu.be/')) {
        try {
          const videoId = data.videoUrl.includes('youtu.be/') 
            ? data.videoUrl.split('youtu.be/')[1].split('?')[0] 
            : new URL(data.videoUrl).searchParams.get('v');
          if (videoId) data.videoUrl = `https://www.youtube.com/embed/${videoId}`;
        } catch (e) {
          // ignore malformed URLs
        }
      }
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    revalidatePath(`/dashboard/teacher/courses/${lesson.courseId}`);
    revalidatePath(`/courses/${lesson.course.slug}/${lesson.slug}`);
    return { success: true, message: "Lesson updated" };
  } catch (err: any) {
    return { error: err.message || "Failed to update lesson" };
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
    if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return { error: "Unauthorized" };
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    revalidatePath(`/dashboard/teacher/courses/${lesson.courseId}`);
    return { success: true, message: "Lesson deleted" };
  } catch (err: any) {
    return { error: err.message || "Failed to delete lesson" };
  }
}
export async function requestLessonPublication(lessonId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
    if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
      return { error: "Unauthorized" };
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { status: "PENDING" }
    });

    await prisma.contentRequest.create({
      data: {
        type: "NEW_LESSON",
        courseId: lesson.courseId,
        lessonId: lesson.id,
        proposedData: JSON.stringify({ title: lesson.title }),
      }
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN", "ROOT", "OWNER"] } }
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: "NEW_CONTENT_REQUEST",
          message: `New publication request for lesson "${lesson.title}".`
        }))
      });
    }

    revalidatePath(`/dashboard/teacher/courses/${lesson.courseId}`);
    return { success: true, message: "Publication request sent" };
  } catch (err: any) {
    return { error: err.message || "Failed to request publication" };
  }
}

export async function submitContentRequest(targetId: string, type: "EDIT" | "DELETE" | "PUBLISH", proposedData?: any, reason?: string, isCourse: boolean = false) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    let courseId = "";
    let lessonId: string | null = null;

    if (isCourse) {
      const course = await prisma.course.findUnique({ where: { id: targetId } });
      if (!course || (course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
        return { error: "Unauthorized" };
      }
      courseId = course.id;
    } else {
      const lesson = await prisma.lesson.findUnique({ where: { id: targetId }, include: { course: true } });
      if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
        return { error: "Unauthorized" };
      }
      courseId = lesson.courseId;
      lessonId = lesson.id;
    }

    const latestRequest = await prisma.contentRequest.findFirst({
      where: {
        lessonId,
        courseId: isCourse ? courseId : undefined,
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (latestRequest?.status === "PENDING") {
      return { error: `Verification Locked: You already have a pending ${latestRequest.type} request. Please wait for an Admin review.` };
    }

    if (latestRequest?.status === "REJECTED") {
      const cooldownPeriod = 10 * 60 * 1000; // 10 minutes (Thesis Correction loop)
      const timeSinceRejection = Date.now() - new Date(latestRequest.updatedAt).getTime();
      
      if (timeSinceRejection < cooldownPeriod) {
        const minutesRemaining = Math.ceil((cooldownPeriod - timeSinceRejection) / 60000);
        return { 
          error: `Cooldown Active: This request was recently rejected. You can re-apply in ${minutesRemaining} minutes once you have addressed the feedback.` 
        };
      }
    }

    await prisma.contentRequest.create({
      data: {
        type,
        courseId,
        lessonId,
        proposedData: proposedData ? JSON.stringify(proposedData) : null,
        reason,
      }
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN", "ROOT", "OWNER"] } }
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: "NEW_CONTENT_REQUEST",
          message: `New ${type} request submitted for ${isCourse ? 'course' : 'lesson'}.`
        }))
      });
    }

    if (isCourse) {
      await prisma.course.update({ where: { id: courseId }, data: { status: "PENDING" } });
    } else if (lessonId) {
      await prisma.lesson.update({ where: { id: lessonId }, data: { status: "PENDING" } });
    }

    revalidatePath(`/dashboard/teacher/courses/${courseId}`);
    return { success: true, message: "Change request submitted for review" };
  } catch (err: any) {
    return { error: err.message || "Failed to submit request" };
  }
}

export async function requestCoursePublication(courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { lessons: { where: { status: "PUBLISHED" } } }
        }
      }
    });

    if (!course) return { error: "Program not found" };

    if (course._count.lessons === 0) {
      return { error: "At least one session must be approved and published before requesting program publication." };
    }

    // Standardize to use ContentRequest infrastructure
    return await submitContentRequest(courseId, "PUBLISH", null, "Initial publication request.", true);
  } catch (err: any) {
    return { error: err.message || "Failed to request publication" };
  }
}
