"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, BookOpen, Users, Eye, Calendar, DollarSign } from "lucide-react";

export default function TeacherClient({
  courses,
  enrollments,
  totalRevenue,
}: {
  courses: any[];
  enrollments: any[];
  totalRevenue: number;
}) {
  const [activeTab, setActiveTab] = useState<"courses" | "enrollments">("courses");

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Teacher Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your courses and student progress.</p>
        </div>
        <Link
          href="/dashboard/teacher/courses/new"
          className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Total Students", value: enrollments.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Published", value: courses.filter((c) => c.published).length, icon: Eye, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab("courses")}
          className={`pb-3 font-medium transition-colors ${activeTab === "courses" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          Your Courses
        </button>
        <button
          onClick={() => setActiveTab("enrollments")}
          className={`pb-3 font-medium transition-colors ${activeTab === "enrollments" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          Student Enrollments
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {activeTab === "courses" && (
          <>
            {courses.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p>No courses yet. Create your first one!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-gray-500">{course._count.lessons} lessons · {course._count.enrollments} students</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-purple-400">
                        ${(course.price * course._count.enrollments).toFixed(2)}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${course.published ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                        {course.published ? "Published" : "Draft"}
                      </span>
                      <Link
                        href={`/dashboard/teacher/courses/${course.id}/edit`}
                        className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Edit Course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "enrollments" && (
          <>
            {enrollments.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <h3 className="font-bold text-gray-300 text-lg mb-1">No students yet!</h3>
                <p>Once you publish a course and students enroll, they will appear here.</p>
                
                {/* Dummy State Display */}
                <div className="mt-8 pt-8 border-t border-gray-800/50 opacity-40 select-none">
                  <p className="text-xs tracking-widest uppercase mb-4">Example Preview</p>
                  <table className="w-full text-sm text-left opacity-60">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3">Student Name</th>
                        <th className="px-6 py-3">Course</th>
                        <th className="px-6 py-3">Enrolled On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      <tr>
                        <td className="px-6 py-3 font-medium">Jane Doe</td>
                        <td className="px-6 py-3 text-gray-400">Mastering React 19</td>
                        <td className="px-6 py-3 text-gray-500"><Calendar className="w-3 h-3 inline mr-1" /> Today</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-800/50 text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium">{enrollment.user.name || enrollment.user.email}</td>
                        <td className="px-6 py-4 text-gray-400">{enrollment.course.title}</td>
                        <td className="px-6 py-4 text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
