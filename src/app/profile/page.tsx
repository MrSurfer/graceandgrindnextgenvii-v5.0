import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User, Mail, Shield, BookOpen } from "lucide-react";
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
      enrollments: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" /> Account Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 font-medium">Name</label>
                <div className="text-gray-300 font-medium text-lg">{user.name || "N/A"}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <div className="text-gray-300 font-medium">{user.email}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Role
                </label>
                <div className="inline-flex mt-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Application Status */}
          <ProfileClient 
            role={user.role} 
            applicationStatus={user.teacherApp?.status} 
          />
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" /> Stats
            </h2>
            <div className="flex flex-col gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-extrabold text-amber-400">{user.enrollments.length}</div>
                <div className="text-sm text-gray-400">Enrolled Courses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
