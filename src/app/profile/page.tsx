import { auth } from "@/lib/supabase/server-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, Mail, Shield, BookOpen, Award, Zap, Clock, CheckCircle, Heart, Baby, Flame } from "lucide-react";
import ProfileClient from "./ProfileClient";
import { getUserGamification } from "@/lib/gamification";
import Link from "next/link";

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
      },
      certificates: {
        include: {
          course: { select: { title: true } }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const { resolveEffectiveRole } = await import("@/lib/permissions");
  const effectiveRole = resolveEffectiveRole(user.role, user.email);

  const displayRole = effectiveRole;
  const canCreate = effectiveRole === "TEACHER" || effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN" || effectiveRole === "ROOT" || effectiveRole === "OWNER";

  const gamification = await getUserGamification(session.user.id);

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
              role: effectiveRole,
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

          {/* Certificates Section */}
          {(user as any).certificates && (user as any).certificates.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Certificates
              </h2>
              <div className="space-y-3">
                {(user as any).certificates.map((cert: any) => (
                  <div key={cert.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-200 text-sm">{cert.course.title}</p>
                      <p className="text-xs text-gray-500">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/certificates/${cert.id}`} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                      View Certificate
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievement Badges */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 truncate">
                <Zap className="w-5 h-5 text-amber-500 shrink-0" /> <span className="truncate">Achievements</span>
              </h2>
              <div className="text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-xs whitespace-nowrap shrink-0">
                {gamification.points} Points
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {gamification.badges.length > 0 ? (
                gamification.badges.map(badge => {
                  let Icon = Award;
                  if (badge.icon === 'Baby') Icon = Baby;
                  if (badge.icon === 'BookOpen') Icon = BookOpen;
                  if (badge.icon === 'Flame') Icon = Flame;
                  if (badge.icon === 'Heart') Icon = Heart;

                  return (
                    <div 
                      key={badge.id}
                      className={`w-10 h-10 rounded-full bg-gray-800 border flex items-center justify-center cursor-help transition-all duration-300 hover:scale-110`} 
                      title={`${badge.name}: ${badge.description}`}
                      style={{ borderColor: 'currentColor' }}
                    >
                      <Icon className={`w-5 h-5 ${badge.color}`} />
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 italic">Complete lessons to earn badges.</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" /> Core Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                <div className="text-3xl font-extrabold text-orange-400 flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6" /> {gamification.currentStreak}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                  Day Streak
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                <div className="text-3xl font-extrabold text-blue-400">
                  {user.enrollments.length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                  Enrolled
                </div>
              </div>
              {canCreate && (
                <div className="col-span-2 bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                  <div className="text-3xl font-extrabold text-amber-400">
                    {user._count.coursesCreated}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">
                    Published Programs
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
