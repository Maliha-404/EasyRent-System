"use client";
import { Building2, Home, Receipt, Megaphone, Plus, PlusCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { normalizeRole } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type OwnerBuilding = {
  id: string;
  name: string;
  address: string;
  units: Array<{
    id: string;
    unitNumber: string;
    type: string;
    status: string;
    price: number;
    floor: number;
  }>;
};

type OwnerBooking = {
  id: string;
  unitId: string;
  date: string;
  status: string;
  advanceAmount: number;
};

type OwnerPayment = {
  id: string;
  bookingId: string;
  amount: number;
  purpose: string;
  status: string;
  date: string;
};

type OwnerNotice = {
  id: string;
  title: string;
  content: string;
  date: string;
  buildingId: string;
};

export default function OwnerDashboard() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [buildings, setBuildings] = useState<OwnerBuilding[]>([]);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [payments, setPayments] = useState<OwnerPayment[]>([]);
  const [notices, setNotices] = useState<OwnerNotice[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const role = normalizeRole(user?.role);
    const hasOwnerAccess = role === "land_owner" || role === "flat_owner";
    if (!isLoading && (!user || !hasOwnerAccess)) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const role = normalizeRole(user?.role);
    const hasOwnerAccess = role === "land_owner" || role === "flat_owner";
    if (isLoading || !token || !hasOwnerAccess) return;

    const load = async () => {
      setLoadingData(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/owner`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to load owner dashboard data");

        const data = await response.json();
        setBuildings(data.buildings || []);
        setBookings(data.bookings || []);
        setPayments(data.payments || []);
        setNotices(data.notices || []);
      } catch {
        setBuildings([]);
        setBookings([]);
        setPayments([]);
        setNotices([]);
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [isLoading, token, user]);

  if (isLoading || !user) return null;

  const myFlats = useMemo(() => buildings.flatMap((building) => building.units), [buildings]);
  const myBookings = bookings;
  const myNotices = notices;
  const confirmedPayments = payments.filter((p) => p.status === "Paid");

  // Statistics Calculation
  const bookedFlatsCount = myBookings.filter(b => b.status === "Confirmed").length;
  const totalAdvanceReceived = confirmedPayments.filter((p) => p.purpose === "Advance").reduce((sum, p) => sum + p.amount, 0);
  const commissionPayable = totalAdvanceReceived * 0.05; // 5% mock commission
  const totalProperties = myFlats.length;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Owner Dashboard</h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your properties, tenants, and view financial reports</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 shadow-sm whitespace-nowrap">
            <Plus className="w-5 h-5" /> Add New Building
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-36">
            <h3 className="text-gray-500 font-semibold text-sm">Total Properties Hosted</h3>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-gray-900">{totalProperties}</span>
              <Building2 className="w-8 h-8 text-blue-100 mb-1" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-36">
            <h3 className="text-gray-500 font-semibold text-sm">Active Bookings</h3>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-gray-900">{bookedFlatsCount}</span>
              <CheckCircle className="w-8 h-8 text-emerald-100 mb-1" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-36">
            <h3 className="text-gray-500 font-semibold text-sm">Advance Payments Collected</h3>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-gray-900">৳{totalAdvanceReceived.toLocaleString()}</span>
              <Receipt className="w-8 h-8 text-amber-100 mb-1" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-md text-white flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <h3 className="text-blue-100 font-semibold text-sm">Admin Commission Due</h3>
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold backdrop-blur-sm">5% Rate</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black">৳{commissionPayable.toLocaleString()}</span>
              <button className="text-sm font-semibold bg-white text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition shadow-sm">Pay Now</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Listings - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-gray-900">
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Home className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Property Management</h2>
                </div>
              </div>
              
              <div className="divide-y divide-gray-50">
                {buildings.map((building) => {
                  const buildingFlats = building.units;
                  return (
                    <div key={building.id} className="p-6 md:p-8 hover:bg-gray-50/30 transition-colors">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{building.name}</h3>
                          <p className="text-gray-500 text-sm">{building.address}</p>
                        </div>
                        <button className="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <PlusCircle className="w-4 h-4" /> Add Flat
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {buildingFlats.map(flat => (
                          <div key={flat.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                              <span className="font-bold text-gray-900">Apt {flat.unitNumber}</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                flat.status === 'Listed' ? 'bg-emerald-50 text-emerald-700' : 
                                flat.status === 'Booked' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {flat.status}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{flat.type}</span>
                              <span className="font-bold text-gray-900">৳{flat.price.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar - Notices & Feed - 1/3 width */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-gray-900 relative">
              <div className="p-6 md:p-8 bg-gray-50/80 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-sm">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Manage Notices</h2>
                </div>
                <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition shadow-sm text-sm">
                  Publish New Notice
                </button>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                {myNotices.map((notice) => {
                  const targetBuilding = buildings.find(b => b.id === notice.buildingId);
                  return (
                    <div key={notice.id} className="group cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">{targetBuilding?.name}</span>
                        <span className="text-xs text-gray-400 font-medium">{notice.date}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{notice.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{notice.content}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

        </div>

        {loadingData && (
          <p className="text-center text-sm text-gray-500 mt-6">Loading owner dashboard data...</p>
        )}
      </div>
    </div>
  );
}
