"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, BookOpen, Users, Eye, Calendar, DollarSign, UploadCloud, X, FileJson, Loader2, BarChart2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { toast } from "sonner";
import { importCourseFromJson } from "./actions";
import AnalyticsTab from "./AnalyticsTab";
import { useCurrency } from "@/lib/CurrencyContext";

const PAGE_SIZE = 10;

export default function TeacherClient({
  courses,
  enrollments,
  totalRevenue,
  requests,
  categories,
  canImport,
  hasAnalyticsFeature,
}: {
  courses: any[];
  enrollments: any[];
  totalRevenue: number;
  requests: any[];
  categories: any[];
  canImport: boolean;
  hasAnalyticsFeature?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"courses" | "enrollments" | "requests" | "analytics">("courses");
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || "");
  const { formatPrice } = useCurrency();

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Teacher Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your courses and student progress.</p>
        </div>
        <div className="flex gap-4">
          {canImport && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
            >
              <UploadCloud className="w-5 h-5" /> Import
            </button>
          )}
          <Link
            href="/dashboard/teacher/courses/new"
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg transition-colors"
          >
            <PlusCircle className="w-5 h-5" /> New Course
          </Link>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileJson className="w-5 h-5 text-amber-500" />
                Import JSON Course
              </h2>
              <button onClick={() => setShowImportModal(false)} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-gray-950/50 hover:border-amber-500 transition-colors relative">
                <input 
                  type="file" 
                  accept=".json"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={importing}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    try {
                      setImporting(true);
                      const text = await file.text();
                      const json = JSON.parse(text);
                      
                      const res = await importCourseFromJson(selectedCategory, json);
                      if (res.error) {
                        toast.error(res.error);
                      } else {
                        toast.success(res.message);
                        setShowImportModal(false);
                      }
                    } catch (error) {
                      toast.error("Invalid JSON file format.");
                    } finally {
                      setImporting(false);
                      e.target.value = ""; // reset input
                    }
                  }}
                />
                {importing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-gray-400 font-medium">Importing program...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="w-8 h-8 text-gray-500" />
                    <p className="text-white font-bold">Click or drag JSON file to upload</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                      Must contain title, description, and an array of lessons.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Parenting Programs", value: courses.length, icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Enrolled Parents", value: enrollments.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Published Mastery", value: courses.filter((c) => c.published).length, icon: Eye, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Mission Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10" },
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
          Your Programs
        </button>
        <button
          onClick={() => setActiveTab("enrollments")}
          className={`pb-3 font-medium transition-colors ${activeTab === "enrollments" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          Parental Engagement
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 font-medium transition-colors ${activeTab === "requests" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-500 hover:text-gray-300"}`}
        >
          Approval Tracking
        </button>
        {hasAnalyticsFeature && (
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-3 font-medium transition-colors flex items-center gap-1.5 ${activeTab === "analytics" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {activeTab === "analytics" && hasAnalyticsFeature && (
          <AnalyticsTab enrollments={enrollments} courses={courses} />
        )}
        {activeTab === "courses" && (
          <>
            {courses.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p>No courses yet. Create your first one!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {courses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((course) => (
                  <div key={course.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-gray-500">{course._count.lessons} lessons · {course._count.enrollments} students</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-purple-400">
                        {formatPrice(course.price * course._count.enrollments)}
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
                <Pagination
                  currentPage={currentPage}
                  totalItems={courses.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
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
                        <td className="px-6 py-3 text-gray-400">Raising the Next Generation</td>
                        <td className="px-6 py-3 text-gray-500"><Calendar className="w-3 h-3 inline mr-1" /> Today</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-800/50 text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Parent Name</th>
                        <th className="px-6 py-4">Program</th>
                        <th className="px-6 py-4">Engagement Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {enrollments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((enrollment) => (
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
                <Pagination
                  currentPage={currentPage}
                  totalItems={enrollments.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}
        {activeTab === "requests" && (
          <>
            <div className="overflow-x-auto">
              {requests.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-700 opacity-20" />
                  <p>No active requests found.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-800/50 text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Request Type</th>
                      <th className="px-6 py-4">Program / Session</th>
                      <th className="px-6 py-4">Submitted</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {requests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((request: any) => (
                      <tr key={request.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] uppercase tracking-wider text-gray-500">
                          {request.type.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-200">
                            {request.lesson?.title || request.course?.title}
                          </div>
                          {request.lesson && (
                            <div className="text-[10px] text-gray-500">Part of: {request.course.title}</div>
                          )}
                          {request.adminFeedback && (
                            <div className="mt-2 p-2 rounded bg-red-500/5 border border-red-500/10 text-[10px] text-red-400">
                              <span className="font-bold uppercase mr-1">Feedback:</span>
                              {request.adminFeedback}
                            </div>
                          )}
                          {request.status === "REJECTED" && (
                            (() => {
                              const cooldown = 60 * 60 * 1000;
                              const remaining = cooldown - (Date.now() - new Date(request.updatedAt).getTime());
                              if (remaining > 0) {
                                return (
                                  <div className="mt-1 text-[9px] text-amber-500 font-bold uppercase flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Cooldown: {Math.ceil(remaining / 60000)}m remaining
                                  </div>
                                );
                              }
                              return null;
                            })()
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border ${
                            request.status === "APPROVED" 
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : request.status === "REJECTED"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={requests.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
}
