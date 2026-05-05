"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, Shield, Trash2, Loader2, AlertTriangle, DollarSign, TrendingUp, Link as LinkIcon, UserCog, Ban, CheckCircle } from "lucide-react";
import { updateUserRole, updateUserStatus, deleteUser, deleteCourse, reviewTeacherApplication } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminClient({
  stats,
  users,
  courses,
  applications,
  currentUserId,
}: {
  stats: { userCount: number; courseCount: number; enrollmentCount: number; totalRevenue: number };
  users: any[];
  courses: any[];
  applications: any[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "revenue" | "customers" | "applications">("users");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  async function handleRoleChange(userId: string, newRole: string) {
    setLoadingId(userId);
    try {
      await updateUserRole(userId, newRole);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to update role");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReviewApplication(appId: string, status: "APPROVED" | "REJECTED") {
    setLoadingId(appId);
    try {
      await reviewTeacherApplication(appId, status);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to review application");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setLoadingId(userId);
    try {
      await deleteUser(userId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete user");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDeleteCourse(courseId: string, courseTitle: string) {
    if (!confirm(`Delete "${courseTitle}"? This will also delete all lessons and enrollments.`)) return;
    setLoadingId(courseId);
    try {
      await deleteCourse(courseId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete course");
    } finally {
      setLoadingId(null);
    }
  }

  const tabs = [
    { key: "users", label: "Manage Users" },
    { key: "courses", label: "Manage Courses" },
    { key: "applications", label: `Applications ${applications.length > 0 ? `(${applications.length})` : ""}` },
    { key: "revenue", label: "Revenue & ROI" },
    { key: "customers", label: "Customer Management" },
  ] as const;

  return (
    <>
      <div className="flex items-center gap-3 mb-10">
        <Shield className="w-8 h-8 text-amber-500" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Full platform overview and management.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Users", value: stats.userCount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Courses", value: stats.courseCount, icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Total Enrollments", value: stats.enrollmentCount, icon: GraduationCap, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10" },
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
      <div className="flex gap-4 border-b border-gray-800 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 font-medium transition-colors relative ${activeTab === tab.key ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            {tab.label}
            {tab.key === "applications" && applications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.name || "—"}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={loadingId === user.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gray-800 border-none outline-none cursor-pointer ${
                          user.role === "ADMIN" ? "text-red-400" :
                          user.role === "TEACHER" ? "text-blue-400" : "text-gray-400"
                        }`}
                      >
                        <option value="CUSTOMER" className="text-gray-400">CUSTOMER</option>
                        <option value="TEACHER" className="text-blue-400">TEACHER</option>
                        <option value="ADMIN" className="text-red-400">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.id === currentUserId ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-medium px-2 py-1 bg-amber-500/10 rounded-lg">
                          <AlertTriangle className="w-3 h-3" /> Current User
                        </span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={async () => {
                              setLoadingId(`status-${user.id}`);
                              try {
                                await updateUserStatus(user.id, user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE");
                                router.refresh();
                              } catch (e: any) {
                                alert(e.message || "Failed to update status");
                              } finally {
                                setLoadingId(null);
                              }
                            }}
                            disabled={loadingId === `status-${user.id}`}
                            className={`p-2 rounded-lg transition-colors ${
                              user.status === "BLOCKED" 
                                ? "text-green-500 hover:bg-green-500/10" 
                                : "text-orange-500 hover:bg-orange-500/10"
                            }`}
                            title={user.status === "BLOCKED" ? "Unblock User" : "Block User"}
                          >
                            {loadingId === `status-${user.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.status === "BLOCKED" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loadingId === user.id}
                            className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
                            title="Delete User"
                          >
                            {loadingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <div className="overflow-x-auto">
            {applications.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-700 opacity-20" />
                <p>No pending teacher applications.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Applied At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-200">{app.user.name || "—"}</div>
                        <div className="text-xs text-gray-500 font-mono">{app.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleReviewApplication(app.id, "APPROVED")}
                            disabled={loadingId === app.id}
                            className="bg-green-500 hover:bg-green-600 text-gray-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {loadingId === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewApplication(app.id, "REJECTED")}
                            disabled={loadingId === app.id}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {loadingId === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          <div className="overflow-x-auto">
            {courses.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                <p>No courses on the platform yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Course Title</th>
                    <th className="px-6 py-4">Teacher</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Enrollments</th>
                    <th className="px-6 py-4">Revenue</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium max-w-xs">
                        <Link href={`/courses/${course.slug}`} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          {course.title}
                          <LinkIcon className="w-3 h-3 opacity-50" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{course.teacher.name || course.teacher.email}</td>
                      <td className="px-6 py-4 font-mono text-amber-400">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{course._count.enrollments}</td>
                      <td className="px-6 py-4 font-mono text-green-400">
                        ${(course.price * course._count.enrollments).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.published ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-500"}`}>
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          disabled={loadingId === course.id}
                          className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
                          title="Delete Course"
                        >
                          {loadingId === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === "revenue" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border-b border-gray-800">
              <div className="bg-gray-800/50 rounded-xl p-5">
                <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">Total Revenue</p>
                <p className="text-3xl font-extrabold text-green-400">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-5">
                <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">Paid Enrollments</p>
                <p className="text-3xl font-extrabold text-purple-400">
                  {courses.filter(c => c.price > 0).reduce((s, c) => s + c._count.enrollments, 0)}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-5">
                <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">Avg. Revenue / Course</p>
                <p className="text-3xl font-extrabold text-blue-400">
                  ${courses.length > 0 ? (stats.totalRevenue / courses.filter(c => c.price > 0).length || 0).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Teacher</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Enrollments</th>
                    <th className="px-6 py-4">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[...courses]
                    .sort((a, b) => (b.price * b._count.enrollments) - (a.price * a._count.enrollments))
                    .map((course) => {
                      const revenue = course.price * course._count.enrollments;
                      const share = stats.totalRevenue > 0 ? (revenue / stats.totalRevenue) * 100 : 0;
                      return (
                        <tr key={course.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="px-6 py-4 font-medium">{course.title}</td>
                          <td className="px-6 py-4 text-gray-400">{course.teacher.name || course.teacher.email}</td>
                          <td className="px-6 py-4 font-mono text-amber-400">{course.price === 0 ? "Free" : `$${course.price}`}</td>
                          <td className="px-6 py-4">{course._count.enrollments}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-green-400">${revenue.toFixed(2)}</span>
                              <div className="flex-1 h-1.5 bg-gray-800 rounded-full min-w-[60px]">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${share}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{share.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Enrolled Courses</th>
                  <th className="px-6 py-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => {
                  const totalSpent = user.enrollments?.reduce((sum: number, e: any) => sum + (e.course?.price || 0), 0) || 0;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-200">{user.name || "—"}</div>
                        <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-green-400">
                        ${totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {user.enrollments?.length === 0 ? (
                            <span className="text-gray-500 text-xs">No courses</span>
                          ) : (
                            user.enrollments?.map((e: any) => (
                              <div key={e.id} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded inline-flex items-center gap-2 max-w-fit">
                                <BookOpen className="w-3 h-3 text-amber-500" />
                                {e.course?.title}
                                <span className="text-gray-500">
                                  (${e.course?.price})
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
