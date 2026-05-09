"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Shield, Loader2, BarChart3 } from "lucide-react";
import { getHRMetrics } from "./actions";
import { toast } from "sonner";

export default function HRMetricsPanel() {
  const [hrMetrics, setHrMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHRMetrics().then(res => {
      if (res.error) toast.error(res.error);
      else setHrMetrics(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
        <p className="text-gray-400">Loading HR Intelligence...</p>
      </div>
    );
  }

  if (!hrMetrics) {
    return <p className="text-gray-500 text-center py-20">Failed to load HR metrics.</p>;
  }

  return (
    <div className="space-y-10">
      {/* Teacher Performance Leaderboard */}
      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-green-500" />
          Educator Performance Leaderboard
        </h3>
        {hrMetrics.teacherMetrics?.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No educators with courses yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Educator</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Courses</th>
                  <th className="px-6 py-4 text-center">Published</th>
                  <th className="px-6 py-4 text-center">Lessons</th>
                  <th className="px-6 py-4 text-center">Enrollments</th>
                  <th className="px-6 py-4 text-center">Avg/Course</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {hrMetrics.teacherMetrics?.map((t: any, idx: number) => (
                  <tr key={t.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200">{t.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{t.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        t.role === "OWNER" ? "bg-amber-500/20 text-amber-400" :
                        t.role === "SUPER_ADMIN" ? "bg-purple-500/20 text-purple-400" :
                        t.role === "ADMIN" ? "bg-blue-500/20 text-blue-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {t.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-gray-300">{t.totalCourses}</td>
                    <td className="px-6 py-4 text-center font-mono text-green-400">{t.publishedCourses}</td>
                    <td className="px-6 py-4 text-center font-mono text-gray-300">{t.totalLessons}</td>
                    <td className="px-6 py-4 text-center font-mono text-amber-400 font-bold">{t.totalEnrollments}</td>
                    <td className="px-6 py-4 text-center font-mono text-blue-400">{t.avgEnrollmentsPerCourse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Activity Ranking */}
      <div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Administrative Activity Ranking
        </h3>
        {hrMetrics.adminMetrics?.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No admin actions logged yet.</p>
        ) : (
          <div className="space-y-3">
            {hrMetrics.adminMetrics?.map((a: any, idx: number) => {
              const maxActions = hrMetrics.adminMetrics?.[0]?.totalActions || 1;
              const barWidth = `${Math.max((a.totalActions / maxActions) * 100, 3)}%`;
              return (
                <div key={a.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-mono w-6">#{idx + 1}</span>
                      <span className="font-medium text-gray-200 text-sm">{a.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        a.role === "OWNER" ? "bg-amber-500/20 text-amber-400" :
                        a.role === "SUPER_ADMIN" ? "bg-purple-500/20 text-purple-400" :
                        a.role === "ADMIN" ? "bg-blue-500/20 text-blue-400" :
                        "bg-gray-700 text-gray-400"
                      }`}>{a.role}</span>
                    </div>
                    <span className="text-amber-500 font-mono text-sm font-bold">{a.totalActions} actions</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: barWidth }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
