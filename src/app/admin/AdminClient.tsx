"use client";

import { useState, useEffect, memo } from "react";
import { Users, BookOpen, GraduationCap, Shield, ShieldCheck, Trash2, Loader2, AlertTriangle, DollarSign, TrendingUp, Link as LinkIcon, UserCog, Ban, CheckCircle, X, AlertCircle } from "lucide-react";
import { updateUserRole, updateUserStatus, deleteUser, deleteCourse, reviewTeacherApplication, reviewContentRequest, manualAssignCourse } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TABS = [
  { key: "users", label: "Manage Users" },
  { key: "courses", label: "Manage Courses" },
  { key: "applications", label: "Applications" },
  { key: "content", label: "Content Approvals" },
  { key: "revenue", label: "Revenue & ROI" },
  { key: "customers", label: "Customer Management" },
] as const;

export default function AdminClient({
  stats,
  users,
  courses,
  applications,
  contentRequests,
  currentUserId,
}: {
  stats: { userCount: number; courseCount: number; enrollmentCount: number; totalRevenue: number };
  users: any[];
  courses: any[];
  applications: any[];
  contentRequests: any[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "revenue" | "customers" | "applications" | "content">("users");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<any | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      router.refresh();
      setLastUpdated(new Date());
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [router]);

  // ... (previous functions)
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

  async function handleReviewContent(requestId: string, status: "APPROVED" | "REJECTED") {
    setLoadingId(requestId);
    try {
      const { reviewContentRequest } = await import("./actions");
      await reviewContentRequest(requestId, status);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to review content request");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAssign() {
    if (!selectedUserForAssign || !selectedCourseId) return;
    setAssignLoading(true);
    setStatusMessage(null);
    try {
      await manualAssignCourse(selectedUserForAssign.id, selectedCourseId);
      setSelectedUserForAssign(null);
      setSelectedCourseId("");
      router.refresh();
      setStatusMessage({ type: "warning", text: "Course assigned successfully!" });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error: any) {
      const msg = error.message || "Failed to assign course";
      setStatusMessage({ 
        type: "warning", 
        text: msg.includes("already enrolled") ? "User is already enrolled in this course." : msg 
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setAssignLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-10">
        <Shield className="w-8 h-8 text-amber-500" />
        <div className="flex-grow">
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            Full platform overview and management.
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full ml-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold ml-1">
              Synced: {isMounted ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
            </span>
          </p>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[200] backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{statusMessage.text}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20">
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
      <div className="flex gap-8 border-b border-gray-800 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide px-2">
        {TABS.map((tab) => {
          const badgeCount = tab.key === "applications" ? applications.length : tab.key === "content" ? contentRequests.length : 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab.key ? "text-amber-500" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {badgeCount > 0 && (
                  <span className="bg-amber-500 text-gray-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                    {badgeCount}
                  </span>
                )}
              </span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">

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

        {/* CONTENT APPROVALS TAB */}
        {activeTab === "content" && (
          <div className="overflow-x-auto">
            {contentRequests.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-700 opacity-20" />
                <p>No pending content requests.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Course / Lesson</th>
                    <th className="px-6 py-4">Request Type</th>
                    <th className="px-6 py-4">Reason / Notes</th>
                    <th className="px-6 py-4">Requested</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {contentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-200">{req.course.title}</div>
                        <div className="text-xs text-amber-500 font-bold mt-0.5">{req.lesson?.title || "Entire Course"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          req.type === "DELETE" ? "bg-red-500/20 text-red-400" :
                          req.type === "EDIT" ? "bg-blue-500/20 text-blue-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="text-amber-500 hover:text-amber-400 text-xs font-bold underline decoration-amber-500/30 underline-offset-4"
                        >
                          View Reason & Data
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleReviewContent(req.id, "APPROVED")}
                            disabled={loadingId === req.id}
                            className="bg-green-500 hover:bg-green-600 text-gray-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {loadingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewContent(req.id, "REJECTED")}
                            disabled={loadingId === req.id}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {loadingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
                  <th className="px-6 py-4 text-right">Actions</th>
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
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedUserForAssign(user); setSelectedCourseId(""); }}
                          className="text-amber-500 hover:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Assign Course
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-gray-950/40">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Request Details</h2>
                  <p className="text-gray-400 text-sm">Review the proposed changes for <span className="text-amber-500 font-bold">{selectedRequest.lesson?.title || selectedRequest.course.title}</span></p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-white p-2 rounded-xl bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Teacher's Reason</h3>
                  <p className="text-gray-200 leading-relaxed italic">"{selectedRequest.reason || "No reason provided."}"</p>
                </div>

                {selectedRequest.proposedData && (
                  <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Proposed Data (Preview)</h3>
                    <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      <pre className="text-[10px] font-mono text-amber-500/80 bg-black/30 p-4 rounded-xl whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(selectedRequest.proposedData), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => { handleReviewContent(selectedRequest.id, "APPROVED"); setSelectedRequest(null); }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-gray-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20"
                >
                  Approve & Apply
                </button>
                <button
                  onClick={() => { handleReviewContent(selectedRequest.id, "REJECTED"); setSelectedRequest(null); }}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-4 rounded-2xl transition-all"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Assign Course Modal */}
      {selectedUserForAssign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-gray-950/40">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-amber-500" />
                    Assign Course
                  </h2>
                  <p className="text-gray-400 text-sm">Granting access to <span className="text-amber-500 font-bold">{selectedUserForAssign.name || selectedUserForAssign.email}</span></p>
                </div>
                <button onClick={() => setSelectedUserForAssign(null)} className="text-gray-500 hover:text-white p-2 rounded-xl bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-500/70 leading-relaxed">
                    This will manually enroll the user in the selected course. This action is typically used for compensation or special access.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Select Course</label>
                  <select 
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.price === 0 ? "Free" : `$${course.price}`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleAssign}
                  disabled={assignLoading || !selectedCourseId}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {assignLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  Confirm Assignment
                </button>
                <button
                  onClick={() => setSelectedUserForAssign(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-4 rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
