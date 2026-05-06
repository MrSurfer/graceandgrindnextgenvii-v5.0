import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PlayCircle, Clock, BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          All Programs
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Equipping the next generation of parents with practical, grace-filled wisdom and skills.
        </p>
      </div>

      {/* My Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" /> My Growth Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(({ course }) => {
              const totalLessons = course.lessons.length;
              const completedLessons = course.lessons.filter((l: any) => l.progress && l.progress.length > 0).length;
              const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              
              return (
                <Link href={`/courses/${course.slug}`} key={course.id} className="block group bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-amber-500/50 transition-colors relative overflow-hidden">
                  <div className="flex gap-4 items-center">
                    {course.imageUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-800">
                        <img src={course.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors truncate">{course.title}</h3>
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{progressPercentage}% Complete</span>
                        <span>{completedLessons} / {totalLessons}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div className="bg-amber-500 h-1 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                  {progressPercentage === 100 && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Course Catalog Grid */}
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-gray-300">Mastery Catalog</h2>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
          <BookOpen className="w-16 h-16 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-500">No courses yet.</h2>
          <p className="text-gray-600">Check back soon — we're creating content for you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-amber-500/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-950 relative flex items-center justify-center overflow-hidden">
                {course.imageUrl ? (
                  <img src={course.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                ) : (
                  <PlayCircle className="w-14 h-14 text-amber-500/60 group-hover:text-amber-500 transition-colors" />
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h2 className="font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors line-clamp-2">
                  {course.title}
                </h2>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course._count.lessons} lessons
                  </span>
                  <span className="font-mono text-amber-500">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
