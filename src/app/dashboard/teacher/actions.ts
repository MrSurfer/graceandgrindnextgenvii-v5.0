"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCourse(courseId: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({ 
    where: { id: courseId },
    include: { _count: { select: { enrollments: true } } }
  });
  if (!course || (course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    throw new Error("Unauthorized to edit this course");
  }

  // Prevent unpublishing if students are enrolled
  if (course.published && data.published === false && course._count.enrollments > 0 && (session.user as any).role !== "ADMIN") {
    throw new Error("Cannot unpublish a course that has active students. Please contact support if you need to retire this course.");
  }

  // Prevent price changes for published courses unless admin
  if (course.published && data.price !== undefined && data.price !== course.price && (session.user as any).role !== "ADMIN") {
    throw new Error("Price cannot be changed once the course is published. Please contact support.");
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
  return { success: true };
}

export async function createLesson(courseId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || (course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  const lessonCount = await prisma.lesson.count({ where: { courseId } });

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

  const lesson = await prisma.lesson.create({
    data: {
      title,
      slug,
      courseId,
      order: lessonCount,
      status: "DRAFT", // New lessons always start as drafts
    },
  });

  revalidatePath(`/dashboard/teacher/courses/${courseId}`);
  return { success: true, lessonId: lesson.id };
}

export async function updateLesson(lessonId: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
  if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    throw new Error("Unauthorized");
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
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
  if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  await prisma.lesson.delete({ where: { id: lessonId } });

  revalidatePath(`/dashboard/teacher/courses/${lesson.courseId}`);
  return { success: true };
}
export async function requestLessonPublication(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
  if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { status: "PENDING" }
  });

  // Create a content request for the admin to see
  await prisma.contentRequest.create({
    data: {
      type: "NEW_LESSON",
      courseId: lesson.courseId,
      lessonId: lesson.id,
      proposedData: JSON.stringify({ title: lesson.title }),
    }
  });

  revalidatePath(`/dashboard/teacher/courses/${lesson.courseId}`);
  return { success: true };
}

export async function submitContentRequest(lessonId: string, type: "EDIT" | "DELETE", proposedData?: any, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
  if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  const existingRequest = await prisma.contentRequest.findFirst({
    where: {
      lessonId: lesson.id,
      status: "PENDING",
    }
  });

  if (existingRequest) {
    throw new Error("You already have a pending request for this lesson. Please wait for admin approval.");
  }

  await prisma.contentRequest.create({
    data: {
      type,
      courseId: lesson.courseId,
      lessonId: lesson.id,
      proposedData: proposedData ? JSON.stringify(proposedData) : null,
      reason,
    }
  });

  revalidatePath(`/dashboard/teacher/courses/${lesson.courseId}`);
  return { success: true };
}
