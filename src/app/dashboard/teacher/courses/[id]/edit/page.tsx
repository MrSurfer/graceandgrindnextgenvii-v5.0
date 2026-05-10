import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseSettingsForm from "./CourseSettingsForm";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true } } }
  });

  if (!course) redirect("/dashboard/teacher");

  return <CourseSettingsForm course={course} />;
}
