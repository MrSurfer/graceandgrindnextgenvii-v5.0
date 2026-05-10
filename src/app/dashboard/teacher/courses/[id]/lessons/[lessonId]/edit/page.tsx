import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LessonEditorForm from "./LessonEditorForm";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!lesson || (lesson.course.teacherId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    redirect(`/dashboard/teacher/courses/${id}/edit`);
  }

  return <LessonEditorForm lesson={lesson} />;
}
