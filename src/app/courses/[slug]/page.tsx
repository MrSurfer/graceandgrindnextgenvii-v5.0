import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PlayCircle, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import EnrollButton from "@/components/EnrollButton";

import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true, description: true, imageUrl: true },
  });

  if (!course) {
    return { title: "Program Not Found" };
  }

  return {
    title: `${course.title} | Grace & Grind`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: course.imageUrl ? [course.imageUrl] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.description,
      images: course.imageUrl ? [course.imageUrl] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      teacher: { select: { id: true, name: true } },
    },
  });

  if (!course) return notFound();

  const userRole = (session?.user as any)?.role;
  const isTeacherOrAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || course.teacherId === session?.user?.id;

  const lessons = await prisma.lesson.findMany({
    where: {
      courseId: course.id,
      ...(isTeacherOrAdmin ? {} : { status: "PUBLISHED" }),
    },
    orderBy: { order: "asc" },
    include: {
      progress: session?.user?.id ? { where: { userId: session.user.id } } : false,
    },
  });

  // Attach lessons to course object for compatibility with existing UI
  (course as any).lessons = lessons;

  const isEnrolled = session?.user?.id
    ? !!(await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      }))
    : false;

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => (l as any).progress?.length > 0).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16">
      {/* Hero */}
      <div className="mb-10">
        {course.imageUrl && (
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden border border-gray-800 mb-8 shadow-2xl">
            <img src={course.imageUrl} className="w-full h-full object-cover" alt={course.title} />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{course.title}</h1>
        <p className="text-gray-400 text-lg mb-6 max-w-3xl">{course.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>By <span className="text-gray-300 font-medium">{course.teacher.name}</span></span>
          <span>·</span>
          <span>{lessons.length} sessions</span>
          <span>·</span>
          <span className="text-amber-500 font-bold font-mono">{course.price === 0 ? "Free" : `$${course.price}`}</span>
        </div>
      </div>

      {/* Progress Bar (if enrolled) */}
      {isEnrolled && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> Your Growth Progress
            </h2>
            <span className="text-amber-400 font-mono font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {completedLessons} of {totalLessons} sessions completed
          </p>
        </div>
      )}

      {/* CTA */}
      {!isEnrolled && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-xl mb-1">Enroll to unlock all sessions</h2>
            <p className="text-gray-400 text-sm">Get full access to all {lessons.length} sessions.</p>
          </div>
          <EnrollButton
            courseId={course.id}
            courseSlug={course.slug}
            price={course.price}
            isLoggedIn={!!session}
          />
        </div>
      )}

      {/* Lessons List */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold mb-4">Program Curriculum</h2>
        {lessons.map((lesson, i) => {
          const accessible = isEnrolled || lesson.isFreePreview;
          const lessonCompleted = (lesson as any).progress?.length > 0;
          
          const content = (
            <>
              <span className="text-gray-600 font-mono text-sm w-6 text-center">{i + 1}</span>
              {accessible ? (
                <PlayCircle className="w-5 h-5 text-amber-500 shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-gray-600 shrink-0" />
              )}
              <div className="flex-grow">
                <span className={`font-medium ${accessible ? "text-white" : "text-gray-500"}`}>
                  {lesson.title}
                </span>
              </div>
              {lesson.isFreePreview && !isEnrolled && (
                <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full font-bold uppercase tracking-wider">Free Preview</span>
              )}
              {lessonCompleted && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-[10px] font-bold uppercase tracking-tight border border-green-500/20">
                  <CheckCircle className="w-3 h-3" /> Done
                </div>
              )}
            </>
          );

          return accessible ? (
            <Link
              key={lesson.id}
              href={`/courses/${course.slug}/${lesson.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-700 bg-gray-900 hover:border-amber-500/50 hover:bg-gray-800/50 transition-all cursor-pointer group"
            >
              {content}
            </Link>
          ) : (
            <div
              key={lesson.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 bg-gray-900/50 opacity-60 cursor-not-allowed"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
