"use client";
import { bookings, payments, flats } from "@/data/mockData";
import { Calendar, CheckCircle, Clock, XCircle, CreditCard, Receipt } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessDashboard } from "@/lib/auth";

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !canAccessDashboard(user.role, "user"))) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const userBookings = bookings.filter(b => b.userId === user.id);
  const userPayments = payments.filter(p => p.userId === user.id && p.purpose === "Rent");

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
                    const flat = flats.find(f => f.id === booking.flatId);
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold">Flat {flat?.flat_number}</td>
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
      </div>
    </div>
  );
}
