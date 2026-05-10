"use client";

import React, { useState, useEffect, memo } from "react";
import { Users, BookOpen, GraduationCap, Shield, ShieldCheck, Trash2, Loader2, AlertTriangle, DollarSign, TrendingUp, Link as LinkIcon, UserCog, Ban, CheckCircle, X, AlertCircle, Lock, Zap, ExternalLink, Settings, Search, BarChart3, Key, Save, ChevronDown, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { updateUserRole, updateUserStatus, deleteUser, deleteCourse, reviewTeacherApplication, reviewContentRequest, manualAssignCourse, forgeAccount, updateUserPermissions } from "./actions";
import { PERMISSIONS, ROLE_PERMISSIONS, hasPermission } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useSession } from "@/components/providers/SupabaseProvider";
import Pagination from "@/components/ui/Pagination";
import HRMetricsPanel from "./HRMetricsPanel";
import { useCurrency } from "@/lib/CurrencyContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";



export default function AdminClient({
  stats,
  users,
  courses,
  applications,
  contentRequests,
  eventLogs,
  currentUserId,
  superAdminEmails,
  ownerEmails,
  isSuperAdmin,
  currentLevel,
}: {
  stats: { userCount: number; courseCount: number; enrollmentCount: number; totalRevenue: number };
  users: any[];
  courses: any[];
  applications: any[];
  contentRequests: any[];
  eventLogs: any[];
  currentUserId: string;
  superAdminEmails: string[];
  ownerEmails: string[];
  isSuperAdmin: boolean;
  currentLevel: number;
}) {
  const { data: session } = useSession();
  const permissions = (session?.user as any)?.permissions || [];
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "revenue" | "customers" | "applications" | "content" | "forge" | "hr" | "audit">("users");
  const [auditLogSearch, setAuditLogSearch] = useState("");
  const [auditViewMode, setAuditViewMode] = useState<"timeline" | "grouped">("timeline");
  const [expandedAuditUser, setExpandedAuditUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const PAGE_SIZE = 10;
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: "USER" | "PROGRAM"; item: any } | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isSuperAdminOverride, setIsSuperAdminOverride] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [forgeData, setForgeData] = useState({ email: "", name: "", role: "USER", password: "" });
  const [forgeLoading, setForgeLoading] = useState(false);

  // PBAC Modal State
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<any | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  // Password Confirmation Modal State
  const [passwordConfirmConfig, setPasswordConfirmConfig] = useState<{
    isOpen: boolean;
    actionType: "ROLE_CHANGE" | "PERMISSIONS_CHANGE" | "DELETE_USER" | "FORGE_ACCOUNT" | null;
    actionData: any;
  }>({ isOpen: false, actionType: null, actionData: null });
  const [adminPassword, setAdminPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [modalCapsLock, setModalCapsLock] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing Admin Action...");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(60);

  const [localUsers, setLocalUsers] = useState(users);
  const [localContentRequests, setLocalContentRequests] = useState(contentRequests);

  useEffect(() => {
    setIsMounted(true);
    // Removed the disruptive 1-minute full page refresh interval.
    // Actions now handle targeted revalidation.
  }, []);

  // Update local users when prop changes
  useEffect(() => {
    setLocalUsers(users);
    setLocalContentRequests(contentRequests);
  }, [users, contentRequests]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
  }, [activeTab]);

  function handleRoleChange(userId: string, newRole: string) {
    setPasswordConfirmConfig({
      isOpen: true,
      actionType: "ROLE_CHANGE",
      actionData: { userId, newRole }
    });
  }

  async function executeRoleChange() {
    const { userId, newRole } = passwordConfirmConfig.actionData;
    const previousUsers = [...localUsers];
    setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    setActionLoading(true);
    setLoadingMessage("Updating User Role...");
    try {
      const res = await updateUserRole(userId, newRole, adminPassword);
      if (res.error) {
        toast.error(res.error);
        setLocalUsers(previousUsers); // Rollback
      } else {
        toast.success(res.message);
        setPasswordConfirmConfig({ isOpen: false, actionType: null, actionData: null });
        setAdminPassword("");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
      setLocalUsers(previousUsers); // Rollback
    } finally {
      setActionLoading(false);
    }
  }

  function handleUpdatePermissions() {
    if (!selectedUserForPerms) return;
    setPasswordConfirmConfig({
      isOpen: true,
      actionType: "PERMISSIONS_CHANGE",
      actionData: null
    });
  }

  async function executeUpdatePermissions() {
    if (!selectedUserForPerms) return;
    setActionLoading(true);
    setLoadingMessage(`Syncing Keycard for ${selectedUserForPerms.email}...`);
    try {
      const res = await updateUserPermissions(selectedUserForPerms.id, tempPermissions, adminPassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setLocalUsers(prev => prev.map(u => u.id === selectedUserForPerms.id ? { ...u, permissions: tempPermissions } : u));
        setSelectedUserForPerms(null);
        setPasswordConfirmConfig({ isOpen: false, actionType: null, actionData: null });
        setAdminPassword("");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sync permissions");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(userId: string, newStatus: string) {
    // OPTIMISTIC UPDATE
    const previousUsers = [...localUsers];
    setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    
    try {
      const res = await updateUserStatus(userId, newStatus);
      if (res.error) {
        toast.error(res.error);
        setLocalUsers(previousUsers); // Rollback
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
      setLocalUsers(previousUsers); // Rollback
    }
  }

  async function handleReviewApplication(appId: string, status: "APPROVED" | "REJECTED") {
    setActionLoading(true);
    setLoadingMessage(status === "APPROVED" ? "Onboarding Educator..." : "Rejecting Application...");
    try {
      const res = await reviewTeacherApplication(appId, status);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to review application");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!itemToDelete || itemToDelete.type !== "USER") return;
    const user = itemToDelete.item;
    
    setActionLoading(true);
    setLoadingMessage(`Purging Account: ${user.email}...`);
    try {
      const res = await deleteUser(user.id, deletePassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setItemToDelete(null);
        setDeletePassword("");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteCourse() {
    if (!itemToDelete || itemToDelete.type !== "PROGRAM") return;
    const course = itemToDelete.item;
    
    // Safety check for programs with enrollments
    if (course._count.enrollments > 0) {
      if (deleteConfirmationText !== course.title) {
        toast.error("Confirmation text does not match program title.");
        return;
      }
    }

    setActionLoading(true);
    setLoadingMessage(`Purging "${course.title}"...`);
    try {
      const res = await deleteCourse(course.id, isSuperAdminOverride, deletePassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || "Program purged successfully");
        setItemToDelete(null);
        setDeleteConfirmationText("");
        setDeletePassword("");
        setIsSuperAdminOverride(false);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete program");
    } finally {
      setActionLoading(false);
    }
  }

  const performDelete = () => {
    if (itemToDelete?.type === "USER") handleDeleteUser();
    if (itemToDelete?.type === "PROGRAM") handleDeleteCourse();
  };

  async function handleReviewContent(requestId: string, status: "APPROVED" | "REJECTED", feedback?: string, duration: number = 60) {
    setActionLoading(true);
    setLoadingMessage(status === "APPROVED" ? "Syncing Content Mastery..." : "Dismissing Change Request...");
    try {
      // Optimistic UI update
      setLocalContentRequests(prev => prev.filter(req => req.id !== requestId));
      
      const res = await reviewContentRequest(requestId, status, feedback, duration);
      if (res.error) {
        toast.error(res.error);
        setLocalContentRequests(contentRequests); // Revert on error
      } else {
        toast.success(res.message);
        setAdminFeedback("");
        setGracePeriodMinutes(60);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to review content request");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedUserForAssign || !selectedCourseId) return;
    setAssignLoading(true);
    try {
      const res = await manualAssignCourse(selectedUserForAssign.id, selectedCourseId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setSelectedUserForAssign(null);
        setSelectedCourseId("");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to assign course");
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleForge() {
    if (!forgeData.email || !forgeData.name) return;
    setForgeLoading(true);
    setActionLoading(true);
    setLoadingMessage(`Forging Account for ${forgeData.email}...`);
    try {
      const res = await forgeAccount(forgeData, adminPassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setForgeData({ email: "", name: "", role: "USER", password: "" });
        setPasswordConfirmConfig({ isOpen: false, actionType: null, actionData: null });
        setAdminPassword("");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to forge account");
    } finally {
      setForgeLoading(false);
      setActionLoading(false);
    }
  }

  const filteredUsers = localUsers.filter(u => 
    (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.teacher.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = localUsers.filter(u => 
    (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContentRequests = localContentRequests.filter(req => 
    req.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.lesson?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.course.teacher?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group content requests by Teacher
  const groupedContentRequests = filteredContentRequests.reduce((groups: Record<string, any[]>, req) => {
    const teacherName = req.course.teacher?.name || req.course.teacher?.email || "Unknown Teacher";
    if (!groups[teacherName]) {
      groups[teacherName] = [];
    }
    groups[teacherName].push(req);
    return groups;
  }, {});

  return (
    <>
      <LoadingOverlay isVisible={actionLoading} message={loadingMessage} theme="blue" />
      
      {/* Password Confirmation Modal for High-Risk Actions */}
      {passwordConfirmConfig.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-red-500/10">
            <div className="p-6 border-b border-gray-800 bg-red-500/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Lock className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Security Check</h3>
                <p className="text-xs text-red-400">High-risk action detected.</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-800/50 rounded-2xl p-4 text-sm text-gray-300">
                {passwordConfirmConfig.actionType === "ROLE_CHANGE" && "You are about to change a user's Base Role. This will grant or revoke entire sets of privileges."}
                {passwordConfirmConfig.actionType === "PERMISSIONS_CHANGE" && "You are about to modify a user's explicit PBAC Keycard overlays. This bypasses their standard role limits."}
                {passwordConfirmConfig.actionType === "FORGE_ACCOUNT" && "You are about to forge an account directly. This bypasses the normal registration flow."}
                <br /><br />
                Please enter your administrator password to confirm.
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Administrator Password</label>
                <div className="relative">
                  <input
                    type={showModalPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => setModalCapsLock(e.getModifierState("CapsLock"))}
                    onKeyUp={(e) => setModalCapsLock(e.getModifierState("CapsLock"))}
                    placeholder="Verify your identity..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {modalCapsLock && (
                  <p className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> CAPS LOCK IS ON
                  </p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 bg-gray-800/30 flex gap-3">
              <button
                onClick={() => { setPasswordConfirmConfig({ isOpen: false, actionType: null, actionData: null }); setAdminPassword(""); }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (passwordConfirmConfig.actionType === "ROLE_CHANGE") executeRoleChange();
                  if (passwordConfirmConfig.actionType === "PERMISSIONS_CHANGE") executeUpdatePermissions();
                  if (passwordConfirmConfig.actionType === "FORGE_ACCOUNT") handleForge();
                }}
                disabled={!adminPassword || actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-30 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
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
        {hasPermission(permissions, "audit:view") && (
          <Link 
            href="/owner/logs" 
            className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-4 py-2 rounded-xl transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">Event Logs</span>
          </Link>
        )}
      </div>


      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20">
        {[
          { label: "Total Users", value: stats.userCount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Courses", value: stats.courseCount, icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Total Enrollments", value: stats.enrollmentCount, icon: GraduationCap, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10" },
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

      {/* Tabs - Categorized Dropdown */}
      <div className="mb-10 relative max-w-xs">
        {(applications.length > 0 || contentRequests.length > 0) && (
          <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20 border border-gray-900">
            {applications.length + contentRequests.length}
          </div>
        )}
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as any)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-4 pr-10 py-3 text-white font-bold text-sm focus:ring-amber-500 focus:border-amber-500 appearance-none cursor-pointer"
        >
          <optgroup label="User Management">
            <option value="users">Manage Users</option>
            <option value="customers">Customer Management</option>
            {hasPermission(permissions, "user:forge") && <option value="forge">Forge Account</option>}
            {hasPermission(permissions, "hr:metrics") && <option value="hr">HR Metrics</option>}
          </optgroup>
          <optgroup label="Course & Content">
            <option value="courses">Manage Courses</option>
            <option value="applications">Applications ({applications.length})</option>
            <option value="content">Content Approvals ({contentRequests.length})</option>
          </optgroup>
          <optgroup label="System & Analytics">
            <option value="revenue">Revenue & ROI</option>
            {hasPermission(permissions, "audit:view") && <option value="audit">Audit Logs</option>}
          </optgroup>
        </select>
        <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gray-500 flex items-center justify-center">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Search Bar */}
      {["users", "courses", "customers", "content"].includes(activeTab) && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">

        {/* USERS TAB */}
        {activeTab === "users" && (
          <>
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
                  {filteredUsers
                    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                    .map((user) => {
                    const targetLevel = (ownerEmails.includes(user.email) || user.role === "OWNER") ? 5 :
                                        (user.role === "ROOT" || superAdminEmails.includes(user.email)) ? 4 :
                                        (user.role === "SUPER_ADMIN") ? 3 :
                                        (user.role === "ADMIN") ? 2 :
                                        (user.role === "TEACHER") ? 1 : 0;
                    const canEdit = currentLevel > targetLevel;
                    const isHighLevel = targetLevel >= 3;

                    return (
                    <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium">{user.name || "—"}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">{user.email}</td>
                      <td className="px-6 py-4">
                        {(!canEdit || !hasPermission(permissions, "user:promote")) ? (
                          <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                            targetLevel === 5 ? "text-black bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                            : targetLevel === 4 ? "text-purple-400 bg-purple-500/10 border-purple-500/10" 
                            : targetLevel === 3 ? "text-amber-400 bg-amber-500/10 border-amber-500/10"
                            : targetLevel === 2 ? "text-red-400 bg-red-500/10 border-red-500/10"
                            : targetLevel === 1 ? "text-blue-400 bg-blue-500/10 border-blue-500/10"
                            : "text-gray-400 bg-gray-800 border-gray-700"
                          }`}>
                            {targetLevel >= 3 && <ShieldCheck className="w-3 h-3" />}
                            {targetLevel === 5 ? "OWNER" : targetLevel === 4 ? "ROOT" : user.role}
                          </div>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={loadingId === user.id}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gray-800 border-none outline-none cursor-pointer ${
                              user.role === "ADMIN" ? "text-red-400" :
                              user.role === "TEACHER" ? "text-blue-400" :
                              user.role === "SUPER_ADMIN" ? "text-purple-400" :
                              user.role === "ROOT" ? "text-purple-500" : "text-gray-400"
                            }`}
                          >
                            <option value="CUSTOMER" className="text-gray-400">CUSTOMER</option>
                            <option value="TEACHER" className="text-blue-400">TEACHER</option>
                            <option value="ADMIN" className="text-red-400">ADMIN</option>
                            {currentLevel >= 4 && <option value="SUPER_ADMIN" className="text-purple-400">SUPER ADMIN</option>}
                            {currentLevel >= 5 && <option value="ROOT" className="text-purple-500 font-bold">ROOT</option>}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.id === (session?.user as any)?.id ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-500 font-bold px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" /> Current User
                          </span>
                        ) : (!canEdit && isHighLevel) ? (
                          <div className="flex items-center justify-end gap-2 pr-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-full ${
                              targetLevel === 5
                                ? "bg-white text-black border-white"
                                : targetLevel === 4
                                ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              <ShieldCheck className="w-3 h-3" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {targetLevel === 5 ? "OWNER" : targetLevel === 4 ? "ROOT" : "Super Admin"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {hasPermission(permissions, "user:block") && (
                              <button
                                onClick={() => handleStatusChange(user.id, user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE")}
                                className={`p-2 rounded-lg transition-colors ${
                                  user.status === "BLOCKED" 
                                    ? "text-green-500 hover:bg-green-500/10" 
                                    : "text-orange-500 hover:bg-orange-500/10"
                                }`}
                                title={user.status === "BLOCKED" ? "Unblock User" : "Block User"}
                              >
                                {user.status === "BLOCKED" ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {hasPermission(permissions, "user:edit") && (
                              <button
                                onClick={() => {
                                  setSelectedUserForPerms(user);
                                  setTempPermissions(user.permissions || []);
                                }}
                                disabled={loadingId === user.id}
                                className="text-gray-500 hover:text-amber-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
                                title="Manage Permissions (PBAC)"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                            )}
                            {hasPermission(permissions, "user:delete") && (
                              <button
                                onClick={() => setItemToDelete({ type: "USER", item: user })}
                                disabled={loadingId === user.id}
                                className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* HR METRICS TAB */}
        {activeTab === "hr" && <HRMetricsPanel />}

        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <>
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
                    {applications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((app) => (
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
            <Pagination
              currentPage={currentPage}
              totalItems={applications.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* CONTENT APPROVALS TAB */}
        {activeTab === "content" && (
          <>
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
                    {Object.entries(groupedContentRequests)
                      .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                      .map(([teacherName, requests]) => (
                      <React.Fragment key={teacherName}>
                        <tr className="bg-gray-800/30">
                          <td colSpan={5} className="px-6 py-3 font-bold text-gray-300 border-l-4 border-amber-500">
                            Educator: {teacherName}
                          </td>
                        </tr>
                        {requests.map((req) => (
                          <tr key={req.id} className="hover:bg-gray-800/40 transition-colors">
                            <td className="px-6 py-4 pl-10">
                              <div className="font-medium text-gray-200">{req.course.title}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="text-xs text-amber-500 font-bold">{req.lesson?.title || "Entire Course"}</div>
                                <Link 
                                  href={req.lessonId && req.lesson?.slug
                                    ? `/courses/${req.course.slug}/${req.lesson.slug}` 
                                    : `/courses/${req.course.slug}`
                                  }
                                  target="_blank"
                                  className="text-[10px] text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  View Work
                                </Link>
                              </div>
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
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={Object.keys(groupedContentRequests).length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          <>
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
                    {filteredCourses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((course) => (
                      <tr key={course.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium max-w-xs">
                          <Link href={`/courses/${course.slug}`} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                            {course.title}
                            {course._count.enrollments > 0 && (
                              <Lock className="w-3 h-3 text-red-500" />
                            )}
                            <LinkIcon className="w-3 h-3 opacity-50" />
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{course.teacher.name || course.teacher.email}</td>
                        <td className="px-6 py-4 font-mono text-amber-400">
                          {formatPrice(course.price)}
                        </td>
                        <td className="px-6 py-4 text-gray-300">{course._count.enrollments}</td>
                        <td className="px-6 py-4 font-mono text-green-400">
                          {formatPrice(course.price * course._count.enrollments)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.published ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-500"}`}>
                            {course.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link 
                              href={`/dashboard/teacher/courses/${course.id}/edit`}
                              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-700 flex items-center gap-2"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              Manage
                            </Link>
                            <button
                              onClick={() => setItemToDelete({ type: "PROGRAM", item: course })}
                              disabled={loadingId === course.id}
                              className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
                              title="Delete Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredCourses.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* REVENUE TAB */}
        {activeTab === "revenue" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border-b border-gray-800">
              <div className="bg-gray-800/50 rounded-xl p-5">
                <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">Total Revenue</p>
                <p className="text-3xl font-extrabold text-green-400">{formatPrice(stats.totalRevenue)}</p>
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
                  {courses.length > 0 ? formatPrice(stats.totalRevenue / courses.filter(c => c.price > 0).length) : formatPrice(0)}
                </p>
              </div>
            </div>

            {/* Revenue Charts */}
            {courses.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6">
                {/* Revenue by Course - Bar Chart */}
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold mb-6 text-gray-200">Top Courses by Revenue</h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[...courses]
                          .map(c => ({ name: c.title.length > 18 ? c.title.substring(0, 18) + "..." : c.title, revenue: c.price * c._count.enrollments }))
                          .sort((a, b) => b.revenue - a.revenue)
                          .slice(0, 5)
                        } 
                        layout="vertical" 
                        margin={{ left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(val) => formatPrice(val)} />
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} width={130} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#F3F4F6", borderRadius: "8px" }}
                          formatter={(value: any) => [formatPrice(Number(value)), "Revenue"]}
                          cursor={{ fill: "#1F2937" }}
                        />
                        <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Enrollments by Course - Bar Chart */}
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold mb-6 text-gray-200">Enrollment Distribution</h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...courses]
                          .map(c => ({ name: c.title.length > 18 ? c.title.substring(0, 18) + "..." : c.title, enrollments: c._count.enrollments }))
                          .sort((a, b) => b.enrollments - a.enrollments)
                          .slice(0, 5)
                        }
                        layout="vertical"
                        margin={{ left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} width={130} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#F3F4F6", borderRadius: "8px" }}
                          cursor={{ fill: "#1F2937" }}
                        />
                        <Bar dataKey="enrollments" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

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
                          <td className="px-6 py-4 font-mono text-amber-400">{formatPrice(course.price)}</td>
                          <td className="px-6 py-4">{course._count.enrollments}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-green-400">{formatPrice(revenue)}</span>
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
          <>
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
                  {filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((user) => {
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
            <Pagination
              currentPage={currentPage}
              totalItems={filteredCustomers.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-gray-950/40">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Request Details</h2>
                      <p className="text-gray-400 text-sm">Review the proposed changes for <span className="text-amber-500 font-bold">{selectedRequest.lesson?.title || selectedRequest.course.title}</span></p>
                    </div>
                    <Link 
                      href={selectedRequest.lessonId 
                        ? `/dashboard/teacher/courses/${selectedRequest.courseId}/lessons/${selectedRequest.lessonId}/edit` 
                        : `/dashboard/teacher/courses/${selectedRequest.courseId}/edit`
                      }
                      target="_blank"
                      className="mr-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold border border-blue-500/20 flex items-center gap-2 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Workspace
                    </Link>
                  </div>
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

                {selectedRequest.proposedData && (() => {
                  const data = JSON.parse(selectedRequest.proposedData);
                  return (
                    <div className="space-y-6">
                      {data.title && (
                        <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-5">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Proposed Title</h3>
                          <p className="text-xl font-bold text-white">{data.title}</p>
                        </div>
                      )}
                      
                      {data.videoUrl && (
                        <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-5">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Proposed Video</h3>
                          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-gray-800">
                             <p className="text-[10px] text-gray-500 p-2 font-mono truncate">{data.videoUrl}</p>
                             {/* Preview would go here if we had an embed helper */}
                          </div>
                        </div>
                      )}

                      {data.content && (
                        <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-5">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Proposed Content</h3>
                          <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar prose prose-invert prose-sm max-w-none prose-amber" dangerouslySetInnerHTML={{ __html: data.content }} />
                        </div>
                      )}

                      <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Raw JSON Data</h3>
                        <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          <pre className="text-[10px] font-mono text-gray-600 bg-black/10 p-4 rounded-xl whitespace-pre-wrap">
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

                      <div className="mt-8 space-y-4">
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Admin Feedback (Required for Rejection)</label>
                          <textarea
                            value={adminFeedback}
                            onChange={(e) => setAdminFeedback(e.target.value)}
                            placeholder="Provide a reason for rejection or notes for approval..."
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors min-h-[100px] resize-none"
                          />
                        </div>

                        {selectedRequest.type === "EDIT" && (
                          <div className="space-y-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                            <label className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                              <Zap className="w-3 h-3" /> Grace Period Duration
                            </label>
                            <select
                              value={gracePeriodMinutes}
                              onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                            >
                              <option value={15}>15 Minutes (Quick Fix)</option>
                              <option value={30}>30 Minutes</option>
                              <option value={60}>1 Hour (Standard)</option>
                              <option value={120}>2 Hours</option>
                              <option value={240}>4 Hours</option>
                              <option value={1440}>24 Hours (Full Day)</option>
                            </select>
                            <p className="text-[10px] text-amber-500/50 italic">Determines how long the teacher can edit without further approval.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 mt-8">
                        <button
                          onClick={() => { handleReviewContent(selectedRequest.id, "APPROVED", adminFeedback, gracePeriodMinutes); setSelectedRequest(null); }}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-gray-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20"
                        >
                          Approve & Apply
                        </button>
                        <button
                          onClick={() => { handleReviewContent(selectedRequest.id, "REJECTED", adminFeedback); setSelectedRequest(null); }}
                          disabled={!adminFeedback.trim()}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-4 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                        {course.title} ({formatPrice(course.price)})
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

      {/* Deletion Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-gray-950/60">
          <div className="bg-gray-900 border border-red-500/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <button onClick={() => { setItemToDelete(null); setDeleteConfirmationText(""); setDeletePassword(""); }} className="text-gray-500 hover:text-white p-2 rounded-xl bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-2">
                Confirm {itemToDelete.type === "USER" ? "User Purge" : "Program Deletion"}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                You are about to permanently delete <span className="text-red-400 font-bold">
                  {itemToDelete.type === "USER" ? itemToDelete.item.email : `"${itemToDelete.item.title}"`}
                </span>. 
                {itemToDelete.type === "PROGRAM" 
                  ? " This action will purge all sessions, enrollments, and progress data."
                  : " This user's entire profile and platform history will be erased."}
              </p>

              {itemToDelete.type === "PROGRAM" && itemToDelete.item._count.enrollments > 0 ? (
                <div className="space-y-4">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                      <Lock className="w-3 h-3 inline mr-1" />
                      THIS PROGRAM HAS ACTIVE ENROLLMENTS ({itemToDelete.item._count.enrollments}). 
                      To proceed, please type the program title exactly:
                    </p>
                    <p className="mt-2 text-sm font-mono text-white bg-black/40 p-3 rounded-lg select-all text-center">
                      {itemToDelete.item.title}
                    </p>
                  </div>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="Type program title to confirm..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />

                  {isSuperAdmin && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                      <input
                        type="checkbox"
                        id="super-admin-override"
                        checked={isSuperAdminOverride}
                        onChange={(e) => setIsSuperAdminOverride(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-800 bg-gray-950 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="super-admin-override" className="text-xs text-red-400 font-medium cursor-pointer">
                        Super Admin Override (Bypass Enrollment Lock)
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-2xl p-4 text-center mb-4">
                  <p className="text-sm text-gray-300 italic">This action cannot be undone. Proceed with caution.</p>
                </div>
              )}

              <div className="space-y-2 mt-4">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Administrator Password Required</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password to authorize purge..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={performDelete}
                  disabled={(itemToDelete.type === "PROGRAM" && itemToDelete.item._count.enrollments > 0 && deleteConfirmationText !== itemToDelete.item.title) || !deletePassword || actionLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-30 text-gray-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20"
                >
                  Confirm Purge
                </button>
                <button
                  onClick={() => { setItemToDelete(null); setDeleteConfirmationText(""); setDeletePassword(""); }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-4 rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forge Account Tab Content */}
      {activeTab === "forge" && isSuperAdmin && (
        <div className="max-w-xl mx-auto py-12">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Forge Account</h2>
                <p className="text-xs text-gray-500">Super Admin Double-Lock Active</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={forgeData.name}
                  onChange={(e) => setForgeData({ ...forgeData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  value={forgeData.email}
                  onChange={(e) => setForgeData({ ...forgeData, email: e.target.value })}
                  placeholder="e.g. user@example.com"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Initial Role</label>
                <select
                  value={forgeData.role}
                  onChange={(e) => setForgeData({ ...forgeData, role: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none transition-colors appearance-none"
                >
                  <option value="USER">Customer</option>
                  <option value="TEACHER">Educator (Teacher)</option>
                  <option value="ADMIN">Administrator</option>
                  {currentLevel >= 4 && <option value="SUPER_ADMIN">Super Admin</option>}
                  {currentLevel >= 5 && <option value="ROOT">Root</option>}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Initial Password (Optional)</label>
                <input
                  type="password"
                  value={forgeData.password}
                  onChange={(e) => setForgeData({ ...forgeData, password: e.target.value })}
                  placeholder="Leave blank for random temp password..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setPasswordConfirmConfig({ isOpen: true, actionType: "FORGE_ACCOUNT", actionData: null })}
                  disabled={!forgeData.email || !forgeData.name}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-gray-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {forgeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  Forge Account Now
                </button>
                <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-tighter">
                  Caution: This bypasses normal registration and generates a temporary password.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HR METRICS TAB */}
      {activeTab === "hr" && <HRMetricsPanel />}

      {/* AUDIT LOGS TAB */}
      {activeTab === "audit" && (() => {
        const q = auditLogSearch.toLowerCase();
        const filteredLogs = eventLogs.filter((log: any) =>
          !q || log.action.toLowerCase().includes(q) || log.actor?.email?.toLowerCase().includes(q) || log.targetId?.includes(q) || log.details?.toLowerCase().includes(q)
        );

        const groupedByActor = filteredLogs.reduce((groups: Record<string, { actor: any; logs: any[] }>, log: any) => {
          const key = log.actor?.email || "system";
          if (!groups[key]) {
            groups[key] = { actor: log.actor || { name: "System", email: "system", role: "SYSTEM" }, logs: [] };
          }
          groups[key].logs.push(log);
          return groups;
        }, {});

        const getActionColor = (action: string) =>
          action.includes("DELETE") ? "text-red-400 bg-red-500/10 border-red-500/20" :
          action.includes("ROLE") ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
          action.includes("PERM") ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
          action.includes("FORGE") ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
          "text-gray-400 bg-gray-800/50 border-gray-700";

        const getRoleBadge = (role: string) => {
          const map: Record<string, string> = {
            OWNER: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            ROOT: "bg-red-500/20 text-red-400 border-red-500/30",
            SUPER_ADMIN: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            ADMIN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            TEACHER: "bg-green-500/20 text-green-400 border-green-500/30",
          };
          return map[role] || "bg-gray-800/50 text-gray-400 border-gray-700";
        };

        return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold">Audit Logs</h2>
              <p className="text-sm text-gray-500 mt-1">Immutable record of all high-risk administrative actions.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setAuditViewMode("timeline")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${auditViewMode === "timeline" ? "bg-gray-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setAuditViewMode("grouped")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${auditViewMode === "grouped" ? "bg-gray-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
                >
                  By User
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={auditLogSearch}
                  onChange={(e) => setAuditLogSearch(e.target.value)}
                  className="w-full sm:w-72 bg-gray-900/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {eventLogs.length === 0 ? (
            <div className="py-24 text-center text-gray-600">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">No audit events recorded yet.</p>
              <p className="text-sm mt-1">Actions like role changes, deletions, and permission modifications will appear here.</p>
            </div>
          ) : auditViewMode === "timeline" ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/60 text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Actor</th>
                    <th className="px-6 py-4">Target ID</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredLogs.slice(0, 100).map((log: any) => {
                    let parsedDetails: Record<string, any> | null = null;
                    try { parsedDetails = JSON.parse(log.details || ""); } catch {}
                    return (
                      <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-200 font-medium">{log.actor?.name || "System"}</div>
                          <div className="text-gray-500 text-xs">{log.actor?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs text-gray-400 font-mono bg-gray-950 px-2 py-1 rounded">{log.targetId?.slice(0, 12) || "—"}...</code>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          {parsedDetails ? (
                            <div className="space-y-1">
                              {Object.entries(parsedDetails).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wider w-20 shrink-0">{k}</span>
                                  <span className="text-xs text-gray-300 truncate max-w-[160px]">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">{log.details || "—"}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString([], { 
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByActor)
                .sort((a, b) => b[1].logs.length - a[1].logs.length)
                .map(([actorEmail, { actor, logs: actorLogs }]) => (
                <div key={actorEmail} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedAuditUser(expandedAuditUser === actorEmail ? null : actorEmail)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                        {actor.name?.charAt(0).toUpperCase() || actor.email?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-200">{actor.name || "System"}</div>
                        <div className="text-xs text-gray-500">{actor.email}</div>
                      </div>
                      {actor.role && (
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getRoleBadge(actor.role)}`}>
                          {actor.role.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-mono">{actorLogs.length} action{actorLogs.length !== 1 ? "s" : ""}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedAuditUser === actorEmail ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {expandedAuditUser === actorEmail && (
                    <div className="border-t border-gray-800">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-800/40 text-gray-500">
                          <tr>
                            <th className="px-6 py-3 text-xs">Action</th>
                            <th className="px-6 py-3 text-xs">Target ID</th>
                            <th className="px-6 py-3 text-xs">Details</th>
                            <th className="px-6 py-3 text-xs">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {actorLogs.map((log: any) => {
                            let parsedDetails: Record<string, any> | null = null;
                            try { parsedDetails = JSON.parse(log.details || ""); } catch {}
                            return (
                              <tr key={log.id} className="hover:bg-gray-800/20 transition-colors">
                                <td className="px-6 py-3">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getActionColor(log.action)}`}>
                                    {log.action.replace(/_/g, " ")}
                                  </span>
                                </td>
                                <td className="px-6 py-3">
                                  <code className="text-xs text-gray-400 font-mono bg-gray-950 px-2 py-1 rounded">{log.targetId?.slice(0, 12) || "—"}...</code>
                                </td>
                                <td className="px-6 py-3 max-w-xs">
                                  {parsedDetails ? (
                                    <div className="space-y-0.5">
                                      {Object.entries(parsedDetails).map(([k, v]) => (
                                        <div key={k} className="flex items-center gap-2">
                                          <span className="text-[10px] text-gray-500 uppercase tracking-wider w-16 shrink-0">{k}</span>
                                          <span className="text-xs text-gray-300 truncate max-w-[140px]">{String(v)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-500">{log.details || "—"}</span>
                                  )}
                                </td>
                                <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                                  {new Date(log.createdAt).toLocaleString([], { 
                                    year: "numeric", month: "short", day: "numeric",
                                    hour: "2-digit", minute: "2-digit"
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })()}

      {/* PBAC Permission Studio Modal */}
      {selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-amber-500/10">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-800/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Key className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold">Permission Studio</h3>
                  <p className="text-sm text-gray-400">
                    Modifying Keycard for <span className="font-mono text-gray-200">{selectedUserForPerms.email}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForPerms(null)}
                className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="text-sm text-blue-200/80">
                  <span className="font-bold text-blue-300">Base Role: {selectedUserForPerms.role}</span>
                  <p className="mt-1">
                    Toggle permissions to fine-tune access. <strong className="text-white">Inherit</strong> follows the base role defaults. <strong className="text-amber-400">Allow</strong> grants explicit access. <strong className="text-red-400">Deny</strong> revokes access entirely, overriding the base role.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(
                  Object.entries(PERMISSIONS).reduce((acc, [key, value]) => {
                    const category = value.split(":")[0];
                    if (!acc[category]) acc[category] = [];
                    acc[category].push({ key, value });
                    return acc;
                  }, {} as Record<string, { key: string; value: string }[]>)
                ).map(([category, perms]) => (
                  <div key={category} className="bg-gray-800/30 border border-gray-800/50 rounded-2xl p-5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 pb-2 border-b border-gray-800/50">
                      {category}
                    </h4>
                    <div className="space-y-4">
                      {perms.map(({ key, value }) => {
                        const basePerms = ROLE_PERMISSIONS[selectedUserForPerms.role] || [];
                        const isInheritedAllowed = basePerms.includes(value);
                        
                        const isExplicitAllow = tempPermissions.includes(value);
                        const isExplicitDeny = tempPermissions.includes(`-${value}`);
                        
                        const currentState = isExplicitAllow ? "ALLOW" : isExplicitDeny ? "DENY" : "INHERIT";
                        
                        const handleStateChange = (newState: "INHERIT" | "ALLOW" | "DENY") => {
                          let nextPerms = tempPermissions.filter(p => p !== value && p !== `-${value}`);
                          if (newState === "ALLOW") nextPerms.push(value);
                          if (newState === "DENY") nextPerms.push(`-${value}`);
                          setTempPermissions(nextPerms);
                        };
                        
                        return (
                          <div key={value} className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-200 flex items-center flex-wrap gap-2">
                                <span className="truncate">{value}</span>
                                {currentState === "INHERIT" && isInheritedAllowed && (
                                  <span className="text-[9px] uppercase tracking-wider font-bold bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded shrink-0">
                                    Base: Yes
                                  </span>
                                )}
                                {currentState === "INHERIT" && !isInheritedAllowed && (
                                  <span className="text-[9px] uppercase tracking-wider font-bold bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded shrink-0">
                                    Base: No
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap bg-gray-950 rounded-lg p-1 border border-gray-800/80 shrink-0 gap-1">
                              <button
                                onClick={() => handleStateChange("INHERIT")}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex-1 text-center ${
                                  currentState === "INHERIT" 
                                    ? "bg-gray-800 text-white shadow-sm" 
                                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                                }`}
                              >
                                INHERIT
                              </button>
                              <button
                                onClick={() => handleStateChange("ALLOW")}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex-1 text-center ${
                                  currentState === "ALLOW" 
                                    ? "bg-amber-500/20 text-amber-500 shadow-sm border border-amber-500/30" 
                                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                                }`}
                              >
                                ALLOW
                              </button>
                              <button
                                onClick={() => handleStateChange("DENY")}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex-1 text-center ${
                                  currentState === "DENY" 
                                    ? "bg-red-500/20 text-red-400 shadow-sm border border-red-500/30" 
                                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                                }`}
                              >
                                DENY
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800 bg-gray-800/30 flex justify-end gap-3">
              <button
                onClick={() => setSelectedUserForPerms(null)}
                className="px-6 py-3 font-bold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePermissions}
                disabled={actionLoading}
                className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Keycard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
