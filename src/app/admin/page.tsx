import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const [statsData, users, courses, teacherApplications, contentRequests, paidEnrollments] = await Promise.all([
    prisma.$transaction([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
    ]),
    prisma.user.findMany({
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
    }),
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        teacher: { select: { name: true, email: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
    }),
    prisma.teacherApplication.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentRequest.findMany({
      where: { status: "PENDING" },
      include: { 
        course: { select: { title: true } },
        lesson: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" },
    }),
    // Fetch only paid enrollments for revenue calculation
    prisma.enrollment.findMany({
      where: { stripePaymentId: { not: null } },
      select: { course: { select: { price: true } } }
    })
  ]);

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
      />
    </div>
  );
}
