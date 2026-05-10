import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseSidebar from "./CourseSidebar";

export default async function CourseWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  const userRole = (session.user as any).role;
  if (!course || (course.teacherId !== session.user.id && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
    redirect("/dashboard/teacher");
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <CourseSidebar courseId={course.id} lessons={course.lessons} />
      <div className="flex-1 bg-gray-950 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
