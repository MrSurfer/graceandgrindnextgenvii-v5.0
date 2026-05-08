import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, Mail, Shield, BookOpen, Award, Zap, Clock, CheckCircle, Heart } from "lucide-react";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherApp: true,
      enrollments: {
        include: {
          course: {
            include: {
              _count: { select: { lessons: true } }
            }
          }
        }
      },
      progress: {
        include: {
          lesson: {
            select: { courseId: true }
          }
        }
      },
      _count: {
        select: {
          coursesCreated: true
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const whitelist = (process.env.SUPER_ADMIN_EMAILS || "").split(",");
  const isHighCouncil = whitelist.includes(user.email);
  const displayRole = isHighCouncil ? "High Council" : user.role;
  const canCreate = user.role === "TEACHER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Details */}
        <div className="md:col-span-2 space-y-6">
          <ProfileClient 
            user={{
              name: user.name || "",
              email: user.email,
              image: (user as any).image || "",
              role: user.role,
              displayRole: displayRole,
              bio: (user as any).bio || "",
              website: (user as any).website || "",
              twitter: (user as any).twitter || "",
              instagram: (user as any).instagram || "",
              linkedin: (user as any).linkedin || "",
            }}
            applicationStatus={user.teacherApp?.status} 
            lastUpdate={user.teacherApp?.updatedAt}
          />
        </div>

        {/* Stats & Mastery */}
        <div className="space-y-6">
          {/* Mastery Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Mastery
            </h2>
            
            <div className="space-y-4">
              {user.enrollments.map((enrollment) => {
                const totalLessons = enrollment.course._count.lessons;
                const completedCount = user.progress.filter(p => p.lesson.courseId === enrollment.courseId).length;
                const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                return (
                  <div key={enrollment.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                      <span className="truncate max-w-[150px]">{enrollment.course.title}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {user.enrollments.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm italic">
                  No active learning journeys yet.
                </div>
              )}
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Achievements
            </h2>
            <div className="flex flex-wrap gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Intentional Parent: Complete your first lesson">
                <Heart className="w-5 h-5 text-amber-500" />
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Mastery Graduate: Finish an entire course">
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Community Pillar: Post 10 discussions">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" /> Core Stats
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {canCreate && (
                <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                  <div className="text-3xl font-extrabold text-amber-400">
                    {user._count.coursesCreated}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                    Published
                  </div>
                </div>
              )}
              <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                <div className="text-3xl font-extrabold text-blue-400">
                  {user.enrollments.length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                  Enrolled
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
