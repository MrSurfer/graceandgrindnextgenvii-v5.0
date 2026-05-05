import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const [userCount, courseCount, enrollmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
  ]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      status: true,
      createdAt: true,
      enrollments: {
        include: { course: { select: { title: true, price: true } } }
      }
    },
  });

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      teacher: { select: { name: true, email: true } },
      _count: { select: { enrollments: true, lessons: true } },
    },
  });

  // Compute total revenue: sum of (course.price × enrollment count) per course
  const totalRevenue = courses.reduce(
    (sum, c) => sum + c.price * c._count.enrollments,
    0
  );

  const teacherApplications = await prisma.teacherApplication.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <AdminClient
        stats={{ userCount, courseCount, enrollmentCount, totalRevenue }}
        users={users}
        courses={courses}
        applications={teacherApplications}
        currentUserId={session.user.id}
      />
    </div>
  );
}
