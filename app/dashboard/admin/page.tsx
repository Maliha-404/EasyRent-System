"use client";
import { users, bookings, payments, areas, buildings, flats } from "@/data/mockData";
import { Users, LayoutDashboard, Map, Castle, Home as HomeIcon, LineChart, BadgeCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  // Global Stats calculation
  const totalAreas = areas.length;
  const totalBuildings = buildings.length;
  const totalFlats = flats.length;
  const activeBookings = bookings.filter(b => b.status === "Confirmed").length;
  const totalCommission = payments.filter(p => p.purpose === "Commission").reduce((acc, p) => acc + p.amount, 0);

  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Owner': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Blocked': return 'bg-red-100 text-red-800 border-red-200';
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
            <span className="text-3xl font-bold text-gray-900">{totalAreas}</span>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <Castle className="w-8 h-8 text-indigo-500 mb-4" />
            <h3 className="text-gray-500 font-semibold text-sm mb-1">Buildings</h3>
            <span className="text-3xl font-bold text-gray-900">{totalBuildings}</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <HomeIcon className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-gray-500 font-semibold text-sm mb-1">Listed Flats</h3>
            <span className="text-3xl font-bold text-gray-900">{totalFlats}</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <LayoutDashboard className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-gray-500 font-semibold text-sm mb-1">Active Bookings</h3>
            <span className="text-3xl font-bold text-gray-900">{activeBookings}</span>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl shadow-md text-white">
            <LineChart className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-gray-400 font-semibold text-sm mb-1">Total Commission</h3>
            <span className="text-3xl font-bold">৳{totalCommission.toLocaleString()}</span>
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
              <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium">
                <option>All Roles</option>
                <option>Owner</option>
                <option>User</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white">
              <thead className="bg-gray-50/50 text-sm text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${getStatusBadgeClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-sm">
                      {user.status === 'Pending' && user.role === 'Owner' && (
                        <button className="text-emerald-600 hover:text-emerald-700 mx-2 flex items-center justify-end gap-1 w-full">
                          <BadgeCheck className="w-4 h-4" /> Verify
                        </button>
                      )}
                      {user.status === 'Active' && user.role !== 'Admin' && (
                        <button className="text-red-600 hover:text-red-700 mx-2 flex items-center justify-end gap-1 w-full">
                          <ShieldAlert className="w-4 h-4" /> Suspend
                        </button>
                      )}
                      {user.role === 'Admin' && (
                        <span className="text-gray-400 mx-2">Restricted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
