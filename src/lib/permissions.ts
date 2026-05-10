"use strict";

/**
 * PBAC Permission System
 * 
 * Roles are "convenience labels" — permissions are the true authority.
 * Each role maps to a default set of permission slugs.
 * Users can also have direct (overlay) permissions beyond their role template.
 * 
 * Usage:
 *   import { hasPermission, resolvePermissions, PERMISSIONS } from "@/lib/permissions";
 *   const perms = resolvePermissions(user.role, user.permissions);
 *   if (hasPermission(perms, PERMISSIONS.ADMIN_DASHBOARD)) { ... }
 */

// ─── Permission Slug Constants ───────────────────────────────────────────────
export const PERMISSIONS = {
  // Dashboard access
  ADMIN_DASHBOARD:    "admin:dashboard",
  OWNER_DASHBOARD:    "owner:dashboard",
  TEACHER_DASHBOARD:  "teacher:dashboard",

  // User management
  USER_VIEW:          "user:view",
  USER_EDIT:          "user:edit",
  USER_DELETE:        "user:delete",
  USER_PROMOTE:       "user:promote",
  USER_BLOCK:         "user:block",
  USER_FORGE:         "user:forge",

  // Course management
  COURSE_CREATE:      "course:create",
  COURSE_EDIT_OWN:    "course:edit_own",
  COURSE_EDIT_ALL:    "course:edit_all",
  COURSE_DELETE:      "course:delete",
  COURSE_DELETE_ACTIVE: "course:delete_active",
  COURSE_PUBLISH:     "course:publish",
  COURSE_VIEW_ALL:    "course:view_all",

  // Content moderation
  CONTENT_APPROVE:    "content:approve",
  CONTENT_REJECT:     "content:reject",
  CONTENT_IMPORT:     "content:import",

  // Analytics & HR
  ANALYTICS_VIEW:     "analytics:view",
  HR_METRICS:         "hr:metrics",
  AUDIT_LOG_VIEW:     "audit:view",

  // Engagement
  LESSON_COMMENT:     "lesson:comment",
  SUPPORT_REPLY:      "support:reply",

  // System
  SYSTEM_SETTINGS:    "system:settings",

  // Feature Toggles
  FEATURE_TEACHER_ANALYTICS: "feature:teacher_analytics",
  FEATURE_LOCALIZATION:      "feature:localization",
} as const;

export type PermissionSlug = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ─── Role → Permission Templates ────────────────────────────────────────────
// These define the "standard issue" keys each role receives.
// Direct (overlay) permissions can extend these per-user.

const _CUSTOMER: string[] = [
  PERMISSIONS.LESSON_COMMENT,
];

const _TEACHER: string[] = [
  PERMISSIONS.TEACHER_DASHBOARD,
  PERMISSIONS.COURSE_CREATE,
  PERMISSIONS.COURSE_EDIT_OWN,
  PERMISSIONS.CONTENT_IMPORT,
];

const _ADMIN: string[] = [
  ..._TEACHER,
  PERMISSIONS.ADMIN_DASHBOARD,
  PERMISSIONS.USER_VIEW,
  PERMISSIONS.USER_EDIT,
  PERMISSIONS.USER_BLOCK,
  PERMISSIONS.CONTENT_APPROVE,
  PERMISSIONS.CONTENT_REJECT,
  PERMISSIONS.ANALYTICS_VIEW,
  PERMISSIONS.COURSE_VIEW_ALL,
  PERMISSIONS.COURSE_DELETE,
  PERMISSIONS.CONTENT_IMPORT,
  PERMISSIONS.SUPPORT_REPLY,
];

const _SUPER_ADMIN: string[] = [
  ..._ADMIN,
  PERMISSIONS.USER_DELETE,
  PERMISSIONS.USER_PROMOTE,
  PERMISSIONS.USER_FORGE,
  PERMISSIONS.AUDIT_LOG_VIEW,
];

const _ROOT: string[] = [
  ..._SUPER_ADMIN,
  PERMISSIONS.HR_METRICS,
  PERMISSIONS.SYSTEM_SETTINGS,
  PERMISSIONS.COURSE_DELETE_ACTIVE,
];

const _OWNER: string[] = [
  ..._ROOT,
  PERMISSIONS.OWNER_DASHBOARD,
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  CUSTOMER:    _CUSTOMER,
  TEACHER:     _TEACHER,
  ADMIN:       _ADMIN,
  SUPER_ADMIN: _SUPER_ADMIN,
  ROOT:        _ROOT,
  OWNER:       _OWNER,
};

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Check if a resolved permissions array includes a specific permission.
 */
export function hasPermission(userPermissions: string[], required: PermissionSlug): boolean {
  return userPermissions.includes(required);
}

/**
 * Resolve the full set of permissions for a user.
 * Combines role template permissions with any direct (overlay) permissions.
 */
export function resolvePermissions(role: string, directPermissions: string[] = []): string[] {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  
  // Combine all granted permissions (inherited + explicit overlay)
  const grantedPerms = [...new Set([...rolePerms, ...directPermissions.filter(p => !p.startsWith("-"))])];
  
  // Find all explicitly denied permissions (override inherited)
  const deniedPerms = directPermissions.filter(p => p.startsWith("-")).map(p => p.substring(1));
  
  // Return granted minus denied
  return grantedPerms.filter(p => !deniedPerms.includes(p));
}

/**
 * Get the authority level for a role (used for hierarchy checks).
 * This is the PBAC-compatible version of the old getAuthorityLevel().
 */
export function getAuthorityLevel(role: string, email?: string): number {
  const ownerEmails = (process.env.OWNER_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const normalizedEmail = email?.toLowerCase() || "";

  if (ownerEmails.includes(normalizedEmail) || role === "OWNER") return 5;
  if (role === "ROOT" || superAdminEmails.includes(normalizedEmail)) return 4;
  if (role === "SUPER_ADMIN") return 3;
  if (role === "ADMIN") return 2;
  if (role === "TEACHER") return 1;
  return 0;
}

/**
 * Determine the effective role based on email whitelists.
 * This handles the case where a user registers with an OWNER/ROOT email
 * but the trigger sets them as CUSTOMER.
 */
export function resolveEffectiveRole(dbRole: string, email?: string): string {
  const ownerEmails = (process.env.OWNER_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const normalizedEmail = email?.toLowerCase() || "";

  if (ownerEmails.includes(normalizedEmail)) return "OWNER";
  if (superAdminEmails.includes(normalizedEmail)) return "ROOT";
  return dbRole;
}

// ─── Debug Helper ────────────────────────────────────────────────────────────

/**
 * Debug helper — logs the full permission context for a user.
 * Only logs in development. Call from server actions when debugging access issues.
 * 
 * Usage: debugPermissions("updateUserRole", user);
 */
export function debugPermissions(
  context: string,
  user: { email?: string; role: string; permissions?: string[] }
) {
  if (process.env.NODE_ENV !== "development") return;

  const effectiveRole = resolveEffectiveRole(user.role, user.email);
  const resolved = resolvePermissions(effectiveRole, user.permissions || []);
  const level = getAuthorityLevel(effectiveRole, user.email);

  console.log(`\n🔐 [PBAC DEBUG] ${context}`);
  console.log(`   Email:          ${user.email}`);
  console.log(`   DB Role:        ${user.role}`);
  console.log(`   Effective Role: ${effectiveRole}`);
  console.log(`   Authority Lvl:  ${level}`);
  console.log(`   Permissions:    [${resolved.join(", ")}]`);
  console.log("");
}
