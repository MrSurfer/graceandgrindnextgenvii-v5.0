import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherClient from "./TeacherClient";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const permissions = (session.user as any).permissions || [];
  const { hasPermission } = await import("@/lib/permissions");
  
  if (!hasPermission(permissions, "teacher:dashboard")) redirect("/");
  const hasAnalyticsFeature = hasPermission(permissions, "feature:teacher_analytics");

  const [courses, enrollments, requests] = await Promise.all([
    prisma.course.findMany({
      where: { teacherId: session.user.id },
      include: { _count: { select: { lessons: true, enrollments: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: {
        course: { teacherId: session.user.id },
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentRequest.findMany({
      where: { course: { teacherId: session.user.id } },
      include: { 
        course: { select: { title: true } },
        lesson: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
  ]);

  // Extract distinct categories from courses or just use defaults
  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean))).map(c => ({ id: c, name: c }));
  if (categories.length === 0) {
    categories.push({ id: "Parenting", name: "Parenting" }, { id: "Education", name: "Education" });
  }

  // Compute total revenue for this teacher's courses
  const totalRevenue = courses.reduce(
    (sum, c) => sum + c.price * c._count.enrollments,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
      <TeacherClient 
        courses={courses} 
        enrollments={enrollments} 
        totalRevenue={totalRevenue} 
        requests={requests}
        categories={categories}
        canImport={hasPermission(permissions, "content:import")}
        hasAnalyticsFeature={hasAnalyticsFeature}
      />
    </div>
  );
}
