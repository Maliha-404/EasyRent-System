import { UserRole } from "../types/auth";

export const roleMap: Record<string, UserRole> = {
  user: "tenant",
  tenant: "tenant",
  owner: "owner",
  flat_owner: "owner",
  flatowner: "owner",
  seller: "owner",
  land_owner: "owner",
  landowner: "owner",
  landlord: "owner",
  admin: "admin",
  superadmin: "admin",
  sub_admin: "sub_admin",
  subadmin: "sub_admin",
};

export function normalizeRole(role: string | undefined | null): UserRole {
  const normalized = String(role || "").trim().toLowerCase();
  return roleMap[normalized] || "tenant";
}

export function getDashboardPath(role: string | undefined | null): string {
  const normalized = normalizeRole(role);
  if (normalized === "owner") return "/dashboard/owner-gateway";
  if (normalized === "admin" || normalized === "sub_admin") return "/dashboard/admin";
  return "/dashboard/user";
}

export function canAccessDashboard(userRole: string | undefined | null, requiredType: "admin" | "owner" | "tenant"): boolean {
  if (!userRole) return false;
  const role = normalizeRole(userRole);
  
  if (role === "admin") return true; // central admin can access everything
  
  if (requiredType === "admin") return role === "admin" || role === "sub_admin";
  return role === requiredType;
}

export function toAvatarInitial(fullName: string): string {
  if (!fullName) return "U";
  return fullName.charAt(0).toUpperCase();
}
