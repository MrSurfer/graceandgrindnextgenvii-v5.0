import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/supabase/server-auth";
import CourseCatalog from "./CourseCatalog";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const session = await auth();

  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let enrolledCourses: any[] = [];
  if (session?.user?.id) {
    enrolledCourses = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            teacher: { select: { name: true } },
            lessons: { 
              include: { 
                progress: { where: { userId: session.user.id } } 
              } 
            },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Extract unique categories for the filter dropdown
  const categories = [...new Set(
    courses
      .map(c => c.category)
      .filter((c): c is string => !!c)
  )].sort();

  return (
    <CourseCatalog
      courses={courses}
      enrolledCourses={enrolledCourses}
      categories={categories}
    />
  );
}
