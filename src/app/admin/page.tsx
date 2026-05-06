import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const whitelist = (process.env.SUPER_ADMIN_EMAILS || "").split(",");
  const isSuperAdmin = session.user.email ? whitelist.includes(session.user.email) : false;
  const isAdmin = (session.user as any).role === "ADMIN";

  if (!isAdmin && !isSuperAdmin) redirect("/");

  const statsData = await prisma.$transaction([
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

  const teacherApplications = await prisma.teacherApplication.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const contentRequests = await prisma.contentRequest.findMany({
    where: { status: "PENDING" },
    include: { 
      course: { select: { title: true } },
      lesson: { select: { title: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  const paidEnrollments = await prisma.enrollment.findMany({
    where: { stripePaymentId: { not: null } },
    select: { course: { select: { price: true } } }
  });

  const [userCount, courseCount, enrollmentCount] = statsData;

  // Compute total revenue: only sum prices of courses with valid stripePaymentId
  const totalRevenue = paidEnrollments.reduce((sum, e) => sum + e.course.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <AdminClient
        stats={{ userCount, courseCount, enrollmentCount, totalRevenue }}
        users={users}
        courses={courses}
        applications={teacherApplications}
        contentRequests={contentRequests}
        currentUserId={session.user.id}
        isSuperAdmin={isSuperAdmin}
        superAdminEmails={whitelist}
      />
    </div>
  );
}
