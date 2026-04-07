import { UserRole } from "@/types/auth";

const roleMap: Record<string, UserRole> = {
  user: "user",
  tenant: "user",
  buyer: "user",
  owner: "owner",
  landlord: "owner",
  seller: "owner",
  admin: "admin",
  superadmin: "admin",
};

export function normalizeRole(role: string | undefined | null): UserRole {
  const normalized = String(role || "").trim().toLowerCase();
  return roleMap[normalized] || "user";
}

export function getDashboardPath(role: string | undefined | null): string {
  const normalized = normalizeRole(role);
  if (normalized === "owner") return "/dashboard/owner";
  if (normalized === "admin") return "/dashboard/admin";
  return "/dashboard/user";
}

export function canAccessDashboard(currentRole: string | undefined | null, requiredRole: UserRole): boolean {
  return normalizeRole(currentRole) === requiredRole;
}

export function toAvatarInitial(fullName: string): string {
  return (fullName || "U").trim().charAt(0).toUpperCase() || "U";
}
