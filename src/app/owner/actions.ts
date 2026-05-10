"use server";

import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";

async function isOwner() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const whitelist = (process.env.OWNER_EMAILS || "").split(",");
  return whitelist.includes(session.user.email) || (session.user as any).role === "OWNER";
}

export async function getCEOMetrics() {
  if (!(await isOwner())) return { error: "Unauthorized" };

  try {
    const [totalUsers, totalEnrollments, totalRevenueData, monthlySignups, topCourses] = await prisma.$transaction([
      prisma.user.count(),
      prisma.enrollment.count(),
      prisma.enrollment.findMany({
        select: { course: { select: { price: true } } }
      }),
      // Simple growth check (last 30 days)
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.course.findMany({
        take: 5,
        include: { _count: { select: { enrollments: true } } },
        orderBy: { enrollments: { _count: 'desc' } }
      })
    ]);

    const totalRevenue = totalRevenueData.reduce((acc, curr) => acc + (curr.course.price || 0), 0);
    
    // Process growth data for chart
    const growthData = monthlySignups.reduce((acc: Record<string, number>, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0];
      const count = (curr._count as any).id || 0;
      acc[date] = (acc[date] || 0) + count;
      return acc;
    }, {});

    const chartData = Object.entries(growthData).map(([date, count]) => ({ date, count })).sort((a: any, b: any) => a.date.localeCompare(b.date));

    return {
      success: true,
      metrics: {
        totalUsers,
        totalEnrollments,
        totalRevenue,
        userGrowth: chartData,
        topCourses: topCourses.map(c => ({
          id: c.id,
          title: c.title,
          enrollments: c._count.enrollments,
          revenue: c._count.enrollments * c.price
        }))
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}
