import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const superAdminWhitelist = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const ownerWhitelist = (process.env.OWNER_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  
  const userEmail = session.user.email?.toLowerCase();
  const isOwnerEmail = userEmail ? ownerWhitelist.includes(userEmail) : false;
  const isSuperAdminEmail = userEmail ? superAdminWhitelist.includes(userEmail) : false;
  
  let userRole = (session.user as any).role;

  // FAILSAFE: If the session role is stale, check the database directly
  if (userRole !== "OWNER" && userRole !== "SUPER_ADMIN" && isOwnerEmail) {
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (dbUser) userRole = dbUser.role;
  }

  const { hasPermission } = await import("@/lib/permissions");
  const permissions = session.user.permissions || [];

  if (!hasPermission(permissions, "admin:dashboard")) {
    console.log(`[AUTH] Access Denied to /admin: User ${session.user.email} lacks admin:dashboard permission.`);
    redirect("/");
  }

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
      permissions: true,
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
      course: { select: { id: true, title: true, slug: true, teacher: { select: { id: true, name: true, email: true } } } },
      lesson: { select: { id: true, title: true, slug: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  const paidEnrollments = await prisma.enrollment.findMany({
    where: { stripePaymentId: { not: null } },
    select: { course: { select: { price: true } } }
  });

  const eventLogs = await prisma.eventLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      actor: { select: { name: true, email: true, role: true } },
    },
  });

  const [userCount, courseCount, enrollmentCount] = statsData;

  // Compute total revenue: only sum prices of courses with valid stripePaymentId
  const totalRevenue = paidEnrollments.reduce((sum, e) => sum + e.course.price, 0);

  const isOwner = userRole === "OWNER" || isOwnerEmail;
  const isSuperAdmin = userRole === "SUPER_ADMIN" || isSuperAdminEmail;

  let currentLevel = 0;
  if (isOwner) currentLevel = 5;
  else if (userRole === "ROOT" || isSuperAdminEmail) currentLevel = 4;
  else if (userRole === "SUPER_ADMIN") currentLevel = 3;
  else if (userRole === "ADMIN") currentLevel = 2;
  else if (userRole === "TEACHER") currentLevel = 1;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <AdminClient
        stats={{ userCount, courseCount, enrollmentCount, totalRevenue }}
        users={users}
        courses={courses}
        applications={teacherApplications}
        contentRequests={contentRequests}
        eventLogs={eventLogs}
        currentUserId={session.user.id}
        isSuperAdmin={isSuperAdmin || isOwner}
        superAdminEmails={superAdminWhitelist}
        ownerEmails={ownerWhitelist}
        currentLevel={currentLevel}
      />
    </div>
  );
}
