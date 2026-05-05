"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonId: string, courseSlug: string, lessonSlug: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

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
  
  return { success: true };
}

export async function addComment(lessonId: string, content: string, courseSlug: string, lessonSlug: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.comment.create({
    data: {
      content,
      lessonId,
      userId: session.user.id
    }
  });

  revalidatePath(`/courses/${courseSlug}/${lessonSlug}`);
  return { success: true };
}

export async function deleteComment(commentId: string, courseSlug: string, lessonSlug: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || (comment.userId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath(`/courses/${courseSlug}/${lessonSlug}`);
  return { success: true };
}
