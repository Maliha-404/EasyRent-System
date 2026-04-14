import { UserRole } from "@/types/auth";

const roleMap: Record<string, UserRole> = {
  user: "tenant",
  tenant: "tenant",
  buyer: "tenant",
  renter: "tenant",
  owner: "flat_owner",
  flat_owner: "flat_owner",
  flatowner: "flat_owner",
  seller: "flat_owner",
  land_owner: "land_owner",
  landowner: "land_owner",
  landlord: "land_owner",
  admin: "admin",
  superadmin: "admin",
};

export function normalizeRole(role: string | undefined | null): UserRole {
  const normalized = String(role || "").trim().toLowerCase();
  return roleMap[normalized] || "tenant";
}

export function getDashboardPath(role: string | undefined | null): string {
  const normalized = normalizeRole(role);
  if (normalized === "land_owner" || normalized === "flat_owner") return "/dashboard/owner";
  if (normalized === "admin") return "/dashboard/admin";
  return "/dashboard/user";
}

export function canAccessDashboard(currentRole: string | undefined | null, requiredRole: UserRole): boolean {
  return normalizeRole(currentRole) === requiredRole;
}

export function toAvatarInitial(fullName: string): string {
  return (fullName || "U").trim().charAt(0).toUpperCase() || "U";
}
