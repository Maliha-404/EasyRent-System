"use client";
import { Building2, Home, Receipt, Megaphone, Plus, PlusCircle, CheckCircle, LayoutDashboard, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { normalizeRole } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type OwnerPlot = {
  id: string;
  plotNumber: string;
  address: string;
};

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
    size: number;
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
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view") || "land";
  
  const [activeTab, setActiveTab] = useState<"overview" | "buildings" | "flats" | "notices">("overview");

  useEffect(() => {
    setActiveTab("overview");
  }, [viewMode]);
  
  const [plots, setPlots] = useState<OwnerPlot[]>([]);
  const [buildings, setBuildings] = useState<OwnerBuilding[]>([]);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [payments, setPayments] = useState<OwnerPayment[]>([]);
  const [notices, setNotices] = useState<OwnerNotice[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modals state
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showFlatModal, setShowFlatModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  
  const [buildingForm, setBuildingForm] = useState({ plotId: "", name: "", totalFloors: "1" });
  const [flatForm, setFlatForm] = useState({ buildingId: "", floorNumber: "1", unitNumber: "", size: "", bedrooms: "", bathrooms: "", type: "Rent", price: "" });
  const [noticeForm, setNoticeForm] = useState({ buildingId: "", title: "", content: "" });

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (!isLoading && (!user || role !== "owner")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const loadData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/owner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to load owner dashboard data");

      const data = await response.json();
      setPlots(data.plots || []);
      setBuildings(data.buildings || []);
      setBookings(data.bookings || []);
      setPayments(data.payments || []);
      setNotices(data.notices || []);
    } catch {
      setPlots([]);
      setBuildings([]);
      setBookings([]);
      setPayments([]);
      setNotices([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (isLoading || !token || role !== "owner") return;
    loadData();
  }, [isLoading, token, user]);

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/owner/buildings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildingForm),
      });
      if (res.ok) {
        setShowBuildingModal(false);
        setBuildingForm({ plotId: "", name: "", totalFloors: "1" });
        loadData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create building");
      }
    } catch (e) {
      alert("An error occurred");
    }
  };

  const handleCreateFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/owner/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(flatForm),
      });
      if (res.ok) {
        setShowFlatModal(false);
        setFlatForm({ buildingId: "", floorNumber: "1", unitNumber: "", size: "", bedrooms: "", bathrooms: "", type: "Rent", price: "" });
        loadData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create flat");
      }
    } catch (e) {
      alert("An error occurred");
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/owner/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(noticeForm),
      });
      if (res.ok) {
        setShowNoticeModal(false);
        setNoticeForm({ buildingId: "", title: "", content: "" });
        loadData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to publish notice");
      }
    } catch (e) {
      alert("An error occurred");
    }
  };

  const myFlats = useMemo(() => buildings.flatMap((building) => building.units), [buildings]);
  const confirmedPayments = payments.filter((p) => p.status === "Paid");

  const bookedFlatsCount = bookings.filter(b => b.status === "Confirmed").length;
  const totalAdvanceReceived = confirmedPayments.filter((p) => p.purpose === "Advance").reduce((sum, p) => sum + p.amount, 0);
  const commissionPayable = totalAdvanceReceived * 0.05;
  const totalProperties = myFlats.length;

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Owner Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage your properties, tenants, and view financial reports</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-8 pb-px space-x-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          
          {viewMode === "land" && (
            <button
              onClick={() => setActiveTab("buildings")}
              className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === "buildings" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Building2 className="w-4 h-4" /> My Land & Buildings
            </button>
          )}

          {viewMode === "flat" && (
            <>
              <button
                onClick={() => setActiveTab("flats")}
                className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "flats" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Home className="w-4 h-4" /> My Flats
              </button>
              <button
                onClick={() => setActiveTab("notices")}
                className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === "notices" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Megaphone className="w-4 h-4" /> Notices
              </button>
            </>
          )}
        </div>

        {loadingData && <p className="text-sm text-gray-500 mb-4">Loading data...</p>}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        )}

        {activeTab === "buildings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Land & Buildings</h2>
                <p className="text-gray-500 text-sm mt-1">Manage buildings on plots you own</p>
              </div>
              <button 
                onClick={() => setShowBuildingModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Building
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {buildings.map((b) => (
                <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{b.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{b.address}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-semibold">{b.units.length} Units</span>
                    <button 
                      onClick={() => {
                        setFlatForm(prev => ({ ...prev, buildingId: b.id }));
                        setShowFlatModal(true);
                      }}
                      className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Flat Here
                    </button>
                  </div>
                </div>
              ))}
              {buildings.length === 0 && !loadingData && (
                <p className="text-gray-500 text-sm">You haven't added any buildings yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "flats" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Flats</h2>
                <p className="text-gray-500 text-sm mt-1">Manage all individual flats</p>
              </div>
              <button 
                onClick={() => setShowFlatModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Flat
              </button>
            </div>

            <div className="space-y-6">
              {buildings.map((building) => {
                if (building.units.length === 0) return null;
                return (
                  <div key={building.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{building.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {building.units.map(flat => (
                        <div key={flat.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                            <span className="font-bold text-gray-900">Unit {flat.unitNumber}</span>
                            <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                              flat.status === 'Listed' ? 'bg-emerald-100 text-emerald-700' : 
                              flat.status === 'Booked' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {flat.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Type</span>
                            <span className="font-semibold text-gray-900">{flat.type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Price</span>
                            <span className="font-bold text-blue-600">৳{flat.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {myFlats.length === 0 && !loadingData && (
                <p className="text-gray-500 text-sm">No flats found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "notices" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notice Board</h2>
                <p className="text-gray-500 text-sm mt-1">Publish notices to your tenants</p>
              </div>
              <button 
                onClick={() => setShowNoticeModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 text-sm"
              >
                <Megaphone className="w-4 h-4" /> Publish Notice
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notices.map((notice) => {
                const targetBuilding = buildings.find(b => b.id === notice.buildingId);
                return (
                  <div key={notice.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">
                        {targetBuilding ? targetBuilding.name : "All Buildings"}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{notice.date}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors text-lg">{notice.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{notice.content}</p>
                  </div>
                );
              })}
              {notices.length === 0 && !loadingData && (
                <p className="text-gray-500 text-sm">No notices published yet.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODALS */}
      {showBuildingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold">Add New Building</h3>
              <button onClick={() => setShowBuildingModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateBuilding} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Plot</label>
                <select 
                  required
                  value={buildingForm.plotId}
                  onChange={(e) => setBuildingForm({...buildingForm, plotId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">Select a plot...</option>
                  {plots.map(p => (
                    <option key={p.id} value={p.id}>{p.plotNumber} - {p.address}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Building Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Skyline Tower"
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({...buildingForm, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Floors (Auto-generates floor records)</label>
                <input 
                  required
                  type="number"
                  min="1"
                  value={buildingForm.totalFloors}
                  onChange={(e) => setBuildingForm({...buildingForm, totalFloors: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2">Create Building</button>
            </form>
          </div>
        </div>
      )}

      {showFlatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold">Add New Flat</h3>
              <button onClick={() => setShowFlatModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateFlat} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Building</label>
                  <select 
                    required
                    value={flatForm.buildingId}
                    onChange={(e) => setFlatForm({...flatForm, buildingId: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">Select building...</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Floor Number</label>
                  <input 
                    required type="number" min="1"
                    value={flatForm.floorNumber}
                    onChange={(e) => setFlatForm({...flatForm, floorNumber: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Number</label>
                  <input 
                    required type="text" placeholder="e.g. 4A"
                    value={flatForm.unitNumber}
                    onChange={(e) => setFlatForm({...flatForm, unitNumber: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select 
                    value={flatForm.type}
                    onChange={(e) => setFlatForm({...flatForm, type: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (৳)</label>
                  <input 
                    required type="number"
                    value={flatForm.price}
                    onChange={(e) => setFlatForm({...flatForm, price: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Size (sqft)</label>
                  <input 
                    required type="number"
                    value={flatForm.size}
                    onChange={(e) => setFlatForm({...flatForm, size: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bedrooms</label>
                  <input 
                    required type="number"
                    value={flatForm.bedrooms}
                    onChange={(e) => setFlatForm({...flatForm, bedrooms: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bathrooms</label>
                  <input 
                    required type="number"
                    value={flatForm.bathrooms}
                    onChange={(e) => setFlatForm({...flatForm, bathrooms: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition mt-4">Create Flat</button>
            </form>
          </div>
        </div>
      )}

      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold">Publish Notice</h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Building (Optional)</label>
                <select 
                  value={noticeForm.buildingId}
                  onChange={(e) => setNoticeForm({...noticeForm, buildingId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">All Buildings</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input 
                  required type="text" placeholder="e.g. Water Maintenance"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                <textarea 
                  required rows={4} placeholder="Details about the notice..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({...noticeForm, content: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 transition mt-2">Publish Notice</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
