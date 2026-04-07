"use client";
import { Users, LayoutDashboard, Map, Castle, Home as HomeIcon, LineChart, BadgeCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { canAccessDashboard } from "@/lib/auth";

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "owner" | "user";
  persona: string;
  status: "Active" | "Pending" | "Blocked" | "Suspended";
};

type AdminOverview = {
  totals: {
    totalUsers: number;
    totalOwners: number;
    pendingOwners: number;
    blockedUsers: number;
    totalAreas: number;
    totalBuildings: number;
    totalFlats: number;
    totalBookings: number;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "user" | "admin">("all");
  const [loadingData, setLoadingData] = useState(true);

  const fetchAdminData = useCallback(async () => {
    if (!token) return;

    setLoadingData(true);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!overviewRes.ok || !usersRes.ok) {
        throw new Error("Failed to load admin data");
      }

      const overviewData = await overviewRes.json();
      const usersData = await usersRes.json();
      setOverview(overviewData);
      setUsers(usersData.users || []);
    } catch {
      setOverview(null);
      setUsers([]);
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && (!user || !canAccessDashboard(user.role, "admin"))) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && canAccessDashboard(user.role, "admin") && token) {
      fetchAdminData();
    }
  }, [user, isLoading, token, fetchAdminData]);

  const totals = overview?.totals || {
    totalUsers: 0,
    totalOwners: 0,
    pendingOwners: 0,
    blockedUsers: 0,
    totalAreas: 0,
    totalBuildings: 0,
    totalFlats: 0,
    totalBookings: 0,
  };

  const filteredUsers = roleFilter === "all" ? users : users.filter((row) => row.role === roleFilter);

  if (isLoading || !user) return null;

  const updateUserStatus = async (userId: string, nextStatus: "Active" | "Suspended") => {
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (response.ok) {
      fetchAdminData();
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'owner': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Super Admin Hub</h1>
          <p className="text-gray-500 mt-2 text-lg">System metrics, global permissions, and operational oversight</p>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <Map className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-gray-500 font-semibold text-sm mb-1">Total Areas</h3>
            <span className="text-3xl font-bold text-gray-900">{totals.totalAreas}</span>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <Castle className="w-8 h-8 text-indigo-500 mb-4" />
            <h3 className="text-gray-500 font-semibold text-sm mb-1">Buildings</h3>
            <span className="text-3xl font-bold text-gray-900">{totals.totalBuildings}</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <HomeIcon className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-gray-500 font-semibold text-sm mb-1">Listed Flats</h3>
            <span className="text-3xl font-bold text-gray-900">{totals.totalFlats}</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <LayoutDashboard className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-gray-500 font-semibold text-sm mb-1">Active Bookings</h3>
            <span className="text-3xl font-bold text-gray-900">{totals.totalBookings}</span>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl shadow-md text-white">
            <LineChart className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-gray-400 font-semibold text-sm mb-1">Pending Owner Verifications</h3>
            <span className="text-3xl font-bold">{totals.pendingOwners}</span>
          </div>
        </div>

        {/* User Management Section */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">User Access Management</h2>
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white">
              <thead className="bg-gray-50/50 text-sm text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Persona</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingData && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">Loading users...</td>
                  </tr>
                )}
                {!loadingData && filteredUsers.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {row.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{row.fullName}</div>
                          <div className="text-sm text-gray-500">{row.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${getRoleBadgeClass(row.role)}`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700 capitalize">{row.persona.replace("_", " ")}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${getStatusBadgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-sm">
                      {row.status === 'Pending' && row.role === 'owner' && (
                        <button
                          onClick={() => updateUserStatus(row.id, "Active")}
                          className="text-emerald-600 hover:text-emerald-700 mx-2 flex items-center justify-end gap-1 w-full"
                        >
                          <BadgeCheck className="w-4 h-4" /> Verify
                        </button>
                      )}
                      {row.status === 'Active' && row.role !== 'admin' && (
                        <button
                          onClick={() => updateUserStatus(row.id, "Suspended")}
                          className="text-red-600 hover:text-red-700 mx-2 flex items-center justify-end gap-1 w-full"
                        >
                          <ShieldAlert className="w-4 h-4" /> Suspend
                        </button>
                      )}
                      {row.role === 'admin' && (
                        <span className="text-gray-400 mx-2">Restricted</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!loadingData && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">No users found for this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
