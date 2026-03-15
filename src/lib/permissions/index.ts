import type { UserRole } from "@/types";

export const PERMISSIONS = {
  admin: {
    canManageCourses: true,
    canManageUsers: true,
    canManagePlans: true,
    canManageForum: true,
    canViewReports: true,
    canAccessAdmin: true,
  },
  member: {
    canManageCourses: false,
    canManageUsers: false,
    canManagePlans: false,
    canManageForum: false,
    canViewReports: false,
    canAccessAdmin: false,
  },
} as const;

export function hasPermission(
  role: UserRole,
  permission: keyof (typeof PERMISSIONS)["admin"]
): boolean {
  return PERMISSIONS[role]?.[permission] ?? false;
}
