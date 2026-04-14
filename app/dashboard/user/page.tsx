"use client";
import { Calendar, CheckCircle, Clock, XCircle, CreditCard, Receipt } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { canAccessDashboard } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type TenantBooking = {
  id: string;
  unitId: string;
  unitNumber: string;
  date: string;
  status: string;
  advanceAmount: number;
};

type TenantPayment = {
  id: string;
  bookingId: string;
  date: string;
  amount: number;
  purpose: string;
  status: string;
};

export default function UserDashboard() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<TenantBooking[]>([]);
  const [payments, setPayments] = useState<TenantPayment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !canAccessDashboard(user.role, "tenant"))) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isLoading || !token || !user || !canAccessDashboard(user.role, "tenant")) return;

    const load = async () => {
      setLoadingData(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/tenant`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to load tenant dashboard data");

        const data = await response.json();
        setBookings(data.bookings || []);
        setPayments(data.payments || []);
      } catch {
        setBookings([]);
        setPayments([]);
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [isLoading, token, user]);

  if (isLoading || !user) return null;

  const userBookings = bookings;
  const userPayments = useMemo(() => payments.filter((payment) => payment.purpose === "Rent"), [payments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Pending": return <Clock className="w-5 h-5 text-amber-500" />;
      case "Cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-50 text-green-700 border-green-200";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tenant Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage your property bookings and track rent payments</p>
        </div>

        <div className="space-y-8">
          {/* Bookings Section */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white text-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">My Bookings</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-sm text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Property Appt.</th>
                    <th className="px-6 py-4">Booking Date</th>
                    <th className="px-6 py-4">Advance Paid</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {userBookings.map((booking) => {
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold">Flat {booking.unitNumber}</td>
                        <td className="px-6 py-4 text-gray-500">{booking.date}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">৳{booking.advanceAmount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {booking.status === "Pending" ? (
                            <button className="text-red-500 font-medium hover:text-red-700 transition">Cancel</button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!loadingData && userBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No bookings found yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Rent Payment History Section */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Receipt className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Rent Payment History</h2>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2 shadow-sm">
                <CreditCard className="w-4 h-4" /> Pay Rent
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left bg-white text-gray-900">
                <thead className="bg-gray-50/50 text-sm text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-900">
                  {userPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors text-gray-900">
                      <td className="px-6 py-4 text-gray-500 font-mono text-sm">{payment.id.toUpperCase()}</td>
                      <td className="px-6 py-4 text-gray-600">{payment.date}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">৳{payment.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {userPayments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No rent payments recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {loadingData && (
          <p className="text-center text-sm text-gray-500 mt-6">Loading tenant dashboard data...</p>
        )}
      </div>
    </div>
  );
}
