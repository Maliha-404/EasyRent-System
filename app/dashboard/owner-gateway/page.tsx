"use client";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building2, Home } from "lucide-react";

export default function OwnerGateway() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || normalizeRole(user.role) !== "owner")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="py-24 bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 text-center border-b border-gray-100 bg-blue-600 text-white">
          <h1 className="text-3xl font-extrabold mb-2">Welcome back, {user.fullName}!</h1>
          <p className="text-blue-100 text-lg">What are you managing today?</p>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push("/dashboard/owner?view=land")}
            className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition group"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Land & Buildings</h2>
              <p className="text-sm text-gray-500">Manage your plots, construct new buildings, and view overall land metrics.</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/owner?view=flat")}
            className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Flats & Tenants</h2>
              <p className="text-sm text-gray-500">Manage individual flat listings, tenant bookings, and publish notices.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
