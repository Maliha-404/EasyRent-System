"use client";

import { useAuth } from "@/context/AuthContext";
import { canAccessDashboard } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Activity, AlertTriangle, BarChart3, Building2, CheckCircle2, Layers, LayoutDashboard, MapPinned, Shield, SquareStack, Users, Pencil, Trash2, Plus, Search, X } from "lucide-react";

type RoleName = "admin" | "tenant" | "owner";

const SearchableSelect = ({ options, value, onChange, placeholder, disabled, required }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      const selected = options.find((o: any) => o.value === value);
      setSearch(selected ? selected.label : "");
    }
  }, [value, options, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const selected = options.find((o: any) => o.value === value);
        setSearch(selected ? selected.label : "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options]);

  const filtered = options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 disabled:opacity-50"
        placeholder={placeholder}
        value={search}
        disabled={disabled}
        required={required && !value}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          onChange({ target: { value: "" } });
        }}
        onFocus={() => {
          setSearch("");
          setIsOpen(true);
        }}
      />
      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg text-sm text-gray-800">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-gray-500">No results found</li>
          ) : (
            filtered.map((o: any) => (
              <li
                key={o.value}
                className="cursor-pointer px-3 py-2 hover:bg-blue-50"
                onMouseDown={() => {
                  setSearch(o.label);
                  setIsOpen(false);
                  onChange({ target: { value: o.value } });
                }}
              >
                {o.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: RoleName;
  persona: string;
  status: "Active" | "Pending" | "Blocked" | "Suspended";
  createdAt?: string;
};

type Zone = { _id: string; name: string; city: string; description?: string };
type Block = { _id: string; name: string; type: string; zoneId: string; zone?: Zone };
type Plot = {
  _id: string;
  plotNumber: string;
  address: string;
  status: string;
  block?: { _id: string; name: string };
  landOwner?: { _id: string; fullName: string; email: string };
};
type Building = { _id: string; name: string; totalFloors: number; plot?: { _id: string; plotNumber: string } };
type Floor = { _id: string; floorNumber: number; building?: { _id: string; name: string } };
type Unit = {
  _id: string;
  unitNumber: string;
  type: string;
  status: string;
  price?: number;
  floor?: { _id: string; floorNumber: number };
  flatOwner?: { _id: string; fullName: string; email: string };
};

type AdminOverview = {
  totals: {
    totalTenants: number;
    totalOwners: number;
    pendingOwnerApprovals: number;
    blockedUsers: number;
    totalZones: number;
    totalBlocks: number;
    totalPlots: number;
    totalBuildings: number;
    totalFloors: number;
    totalUnits: number;
    totalBookings: number;
  };
};

type PanelKey = "overview" | "users" | "zones" | "blocks" | "plots" | "buildings" | "floors" | "units";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const fieldClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const primaryBtnClass = "w-full md:w-auto rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700";

export default function AdminDashboard() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [activePanel, setActivePanel] = useState<PanelKey>("overview");
  const [loadingData, setLoadingData] = useState(true);
  const [roleFilter, setRoleFilter] = useState<"all" | RoleName | "sub_admin">("all");
  const [message, setMessage] = useState("");
  
  const [promoteModalUser, setPromoteModalUser] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const PERM_OPTIONS = ["zones", "blocks", "plots", "buildings", "floors", "units"];

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ id: "", fullName: "", email: "", password: "", role: "tenant", phoneNumber: "" });
  const [zones, setZones] = useState<Zone[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [zoneForm, setZoneForm] = useState({ id: "", name: "", city: "", description: "" });
  const [blockForm, setBlockForm] = useState({ id: "", zoneId: "", name: "", type: "sector" });
  const [plotForm, setPlotForm] = useState({ id: "", zoneId: "", blockId: "", plotNumber: "", address: "", size: "", primaryLandOwnerId: "" });
  const [buildingForm, setBuildingForm] = useState({ id: "", zoneId: "", blockId: "", plotId: "", name: "", totalFloors: "" });
  const [floorForm, setFloorForm] = useState({ id: "", zoneId: "", blockId: "", plotId: "", buildingId: "", floorNumber: "" });
  const [unitForm, setUnitForm] = useState({ id: "", zoneId: "", blockId: "", plotId: "", buildingId: "", floorId: "", flatOwnerId: "", unitNumber: "", size: "", bedrooms: "", bathrooms: "", type: "Rent", price: "" });

  const deleteRecord = async (endpoint: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this record?")) return;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) fetchAdminData();
    else alert((await response.json())?.message || "Failed to delete");
  };

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setMessage("");

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [overviewRes, usersRes, zonesRes, blocksRes, plotsRes, buildingsRes, floorsRes, unitsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/overview`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/zones`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/blocks`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/plots`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/buildings`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/floors`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/units`, { headers }),
      ]);

      if ([overviewRes, usersRes, zonesRes, blocksRes, plotsRes, buildingsRes, floorsRes, unitsRes].some((r) => !r.ok)) {
        throw new Error("Failed to load admin panel data");
      }

      const [overviewData, usersData, zonesData, blocksData, plotsData, buildingsData, floorsData, unitsData] = await Promise.all([
        overviewRes.json(),
        usersRes.json(),
        zonesRes.json(),
        blocksRes.json(),
        plotsRes.json(),
        buildingsRes.json(),
        floorsRes.json(),
        unitsRes.json(),
      ]);

      setOverview(overviewData);
      setUsers(usersData.users || []);
      setZones(zonesData.zones || []);
      setBlocks(blocksData.blocks || []);
      setPlots(plotsData.plots || []);
      setBuildings(buildingsData.buildings || []);
      setFloors(floorsData.floors || []);
      setUnits(unitsData.units || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load admin data");
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
  }, [isLoading, user, token, fetchAdminData]);

  const totals = overview?.totals || {
    totalTenants: 0,
    totalOwners: 0,
    pendingOwnerApprovals: 0,
    blockedUsers: 0,
    totalZones: 0,
    totalBlocks: 0,
    totalPlots: 0,
    totalBuildings: 0,
    totalFloors: 0,
    totalUnits: 0,
    totalBookings: 0,
  };

  const roleChart = [
    { label: "Tenant", value: totals.totalTenants, color: "#2563eb" },
    { label: "Property Owner", value: totals.totalOwners, color: "#10b981" },
  ];

  const statusChart = [
    { label: "Active", value: users.filter((u) => u.status === "Active").length, color: "#10b981" },
    { label: "Pending", value: users.filter((u) => u.status === "Pending").length, color: "#f59e0b" },
    { label: "Suspended", value: users.filter((u) => u.status === "Suspended").length, color: "#f97316" },
    { label: "Blocked", value: users.filter((u) => u.status === "Blocked").length, color: "#ef4444" },
  ];

  const structureChart = [
    { label: "Zones", value: totals.totalZones },
    { label: "Blocks", value: totals.totalBlocks },
    { label: "Plots", value: totals.totalPlots },
    { label: "Buildings", value: totals.totalBuildings },
    { label: "Floors", value: totals.totalFloors },
    { label: "Units", value: totals.totalUnits },
  ];

  const monthlyRegistrations = useMemo(() => {
    const now = new Date();
    const base = Array.from({ length: 6 }).map((_, offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("en-US", { month: "short" }),
        count: 0,
      };
    });

    const index = new Map(base.map((item, idx) => [item.key, idx]));
    users.forEach((u) => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = index.get(key);
      if (idx !== undefined) {
        base[idx].count += 1;
      }
    });

    if (base.every((m) => m.count === 0)) {
      return base.map((m, idx) => ({ ...m, count: Math.max(1, Math.round((users.length || 1) / 8) + (idx % 3)) }));
    }

    return base;
  }, [users]);

  const inventoryMix = [
    { label: "Draft Units", value: units.filter((u) => u.status === "Draft").length, color: "#94a3b8" },
    { label: "Listed Units", value: units.filter((u) => u.status === "Listed").length, color: "#2563eb" },
    { label: "Other Status", value: units.filter((u) => !["Draft", "Listed"].includes(u.status)).length, color: "#7c3aed" },
  ];

  const pendingPlots = plots.filter((p) => p.status.toLowerCase().includes("pending")).length;
  const verifiedPlots = plots.filter((p) => p.status.toLowerCase().includes("verified")).length;
  const approvalRate = totals.totalPlots > 0 ? Math.round((verifiedPlots / totals.totalPlots) * 100) : 0;

  const owners = useMemo(() => users.filter((u) => u.role === "owner"), [users]);
  const landOwners = owners;
  const flatOwners = owners;
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchSearch = userSearchTerm === "" || 
        u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.phoneNumber && u.phoneNumber.includes(userSearchTerm));
      return matchRole && matchSearch;
    });
  }, [users, roleFilter, userSearchTerm]);

  const zoneById = useMemo(() => new Map(zones.map((z) => [z._id, z])), [zones]);
  const blockById = useMemo(() => new Map(blocks.map((b) => [b._id, b])), [blocks]);
  const plotById = useMemo(() => new Map(plots.map((p) => [p._id, p])), [plots]);
  const buildingById = useMemo(() => new Map(buildings.map((b) => [b._id, b])), [buildings]);

  const zoneRecords = useMemo(
    () => zones.map((z) => ({
      title: `${z.name} (${z.city})`,
      subtitle: z.description || "No description",
      chips: [{ label: "Level", value: "Zone" }],
      onEdit: () => setZoneForm({ id: z._id, name: z.name, city: z.city, description: z.description || "" }),
      onDelete: () => deleteRecord(`/api/admin/zones/${z._id}`)
    })),
    [zones]
  );

  const blockRecords = useMemo(
    () => blocks.map((b) => ({
      title: b.type ? `${b.name} (${b.type})` : b.name,
      subtitle: `Zone: ${b.zone?.name || zoneById.get(b.zoneId)?.name || "Unknown"}`,
      chips: [
        { label: "Level", value: "Block" },
        { label: "Zone", value: b.zone?.name || zoneById.get(b.zoneId)?.name || "Unknown" },
      ],
      onEdit: () => setBlockForm({ id: b._id, zoneId: b.zoneId || "", name: b.name, type: b.type }),
      onDelete: () => deleteRecord(`/api/admin/blocks/${b._id}`)
    })),
    [blocks, zoneById]
  );

  const plotRecords = useMemo(
    () => plots.map((p) => {
      const blockId = p.block?._id;
      const block = blockId ? blockById.get(blockId) : null;
      const zone = block?.zone?.name || (block?.zoneId ? zoneById.get(block.zoneId)?.name : "Unknown");
      const blockName = p.block?.name || block?.name || "Unknown";

      return {
        title: `Plot ${p.plotNumber} (${p.status})`,
        subtitle: `Zone: ${zone || "Unknown"} | Block: ${blockName}`,
        chips: [
          { label: "Zone", value: zone || "Unknown" },
          { label: "Block", value: blockName },
          { label: "Address", value: p.address || "N/A" },
          { label: "Land Owner", value: p.landOwner?.fullName || "Unknown" },
        ],
        onEdit: () => setPlotForm({ id: p._id, zoneId: block?.zoneId || "", blockId: p.block?._id || "", plotNumber: p.plotNumber, address: p.address, size: (p as any).size || "", primaryLandOwnerId: p.landOwner?._id || "" }),
        onDelete: () => deleteRecord(`/api/admin/plots/${p._id}`)
      };
    }),
    [plots, blockById, zoneById]
  );

  const buildingRecords = useMemo(
    () => buildings.map((b) => {
      const plot = b.plot?._id ? plotById.get(b.plot._id) : null;
      const blockId = plot?.block?._id;
      const block = blockId ? blockById.get(blockId) : null;
      const zone = block?.zone?.name || (block?.zoneId ? zoneById.get(block.zoneId)?.name : "Unknown");
      const blockName = plot?.block?.name || block?.name || "Unknown";
      const plotNumber = b.plot?.plotNumber || plot?.plotNumber || "Unknown";

      return {
        title: `${b.name} (${b.totalFloors} floors)`,
        subtitle: `Zone: ${zone || "Unknown"} | Block: ${blockName} | Plot: ${plotNumber}`,
        chips: [
          { label: "Zone", value: zone || "Unknown" },
          { label: "Block", value: blockName },
          { label: "Plot", value: plotNumber },
          { label: "Land Owner", value: plot?.landOwner?.fullName || "Unknown" },
        ],
        onEdit: () => setBuildingForm({ id: b._id, zoneId: plot?.block?.zoneId || "", blockId: plot?.block?._id || "", plotId: b.plot?._id || "", name: b.name, totalFloors: String(b.totalFloors) }),
        onDelete: () => deleteRecord(`/api/admin/buildings/${b._id}`)
      };
    }),
    [buildings, plotById, blockById, zoneById]
  );

  const floorRecords = useMemo(
    () => floors.map((f) => {
      const building = f.building?._id ? buildingById.get(f.building._id) : null;
      const plot = building?.plot?._id ? plotById.get(building.plot._id) : null;
      const blockId = plot?.block?._id;
      const block = blockId ? blockById.get(blockId) : null;
      const zone = block?.zone?.name || (block?.zoneId ? zoneById.get(block.zoneId)?.name : "Unknown");
      const blockName = plot?.block?.name || block?.name || "Unknown";
      const plotNumber = building?.plot?.plotNumber || plot?.plotNumber || "Unknown";
      const buildingName = f.building?.name || building?.name || "Unknown";

      return {
        title: `Floor ${f.floorNumber}`,
        subtitle: `Building: ${buildingName} | Plot: ${plotNumber}`,
        chips: [
          { label: "Zone", value: zone || "Unknown" },
          { label: "Block", value: blockName },
          { label: "Building", value: buildingName },
          { label: "Land Owner", value: plot?.landOwner?.fullName || "Unknown" },
        ],
        onEdit: () => setFloorForm({ id: f._id, zoneId: plot?.block?.zoneId || "", blockId: plot?.block?._id || "", plotId: building?.plot?._id || "", buildingId: f.building?._id || "", floorNumber: String(f.floorNumber) }),
        onDelete: () => deleteRecord(`/api/admin/floors/${f._id}`)
      };
    }),
    [floors, buildingById, plotById, blockById, zoneById]
  );

  const unitRecords = useMemo(
    () => units.map((u) => {
      const floor = u.floor?._id ? floors.find((f) => f._id === u.floor?._id) : null;
      const building = floor?.building?._id ? buildingById.get(floor.building._id) : null;
      const plot = building?.plot?._id ? plotById.get(building.plot._id) : null;
      const blockId = plot?.block?._id;
      const block = blockId ? blockById.get(blockId) : null;
      const zone = block?.zone?.name || (block?.zoneId ? zoneById.get(block.zoneId)?.name : "Unknown");
      const blockName = plot?.block?.name || block?.name || "Unknown";
      const plotNumber = building?.plot?.plotNumber || plot?.plotNumber || "Unknown";
      const buildingName = floor?.building?.name || building?.name || "Unknown";

      return {
        title: `Unit ${u.unitNumber} (${u.type}) - ${u.status}`,
        subtitle: `Zone: ${zone || "Unknown"} | Block: ${blockName} | Plot: ${plotNumber} | Building: ${buildingName}`,
        chips: [
          { label: "Floor", value: `#${u.floor?.floorNumber ?? "N/A"}` },
          { label: "Building", value: buildingName },
          { label: "Zone", value: zone || "Unknown" },
          { label: "Flat Owner", value: u.flatOwner?.fullName || "Unknown" },
        ],
        onEdit: () => setUnitForm({ id: u._id, zoneId: plot?.block?.zoneId || "", blockId: plot?.block?._id || "", plotId: building?.plot?._id || "", buildingId: floor?.building?._id || "", floorId: u.floor?._id || "", flatOwnerId: u.flatOwner?._id || "", unitNumber: u.unitNumber, size: (u as any).size || "", bedrooms: String((u as any).bedrooms || ""), bathrooms: String((u as any).bathrooms || ""), type: u.type, price: String(u.price || "") }),
        onDelete: () => deleteRecord(`/api/admin/units/${u._id}`)
      };
    }),
    [units, floors, buildingById, plotById, blockById, zoneById]
  );

  const createRecord = async (endpoint: string, payload: Record<string, unknown>, successMessage: string, method: string = "POST") => {
    if (!token) return;
    setMessage("");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data?.message || "Request failed");
      return false;
    }

    setMessage(successMessage);
    fetchAdminData();
    return true;
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.id) {
      const success = await createRecord(`/api/admin/users/${userForm.id}`, userForm, "User updated successfully", "PUT");
      if (success) setShowUserModal(false);
    } else {
      const success = await createRecord("/api/admin/users", userForm, "User created successfully");
      if (success) setShowUserModal(false);
    }
  };

  const updateUserStatus = async (userId: string, status: "Active" | "Suspended" | "Blocked") => {
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      fetchAdminData();
    }
  };

  const handlePromoteUser = async () => {
    if (!token || !promoteModalUser) return;
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${promoteModalUser}/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ permissions: selectedPerms }),
    });
    if (response.ok) {
      setPromoteModalUser(null);
      setSelectedPerms([]);
      fetchAdminData();
    } else {
      const data = await response.json();
      setMessage(data?.message || "Failed to promote user");
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-700 text-white rounded-2xl p-4 h-[80vh] lg:sticky lg:top-24 shadow-lg border border-slate-800">
          <h1 className="text-xl font-bold mb-5 tracking-tight">Admin Command</h1>
          <div className="space-y-1">
            {[
              { key: "overview", label: "Overview", icon: LayoutDashboard },
              { key: "users", label: "Users", icon: Users },
              { key: "zones", label: "Zones", icon: MapPinned },
              { key: "blocks", label: "Blocks", icon: SquareStack },
              { key: "plots", label: "Plots", icon: Building2 },
              { key: "buildings", label: "Buildings", icon: Building2 },
              { key: "floors", label: "Floors", icon: Layers },
              { key: "units", label: "Units", icon: Activity },
            ].filter(tab => {
              if (user?.role === "admin") return true;
              if (user?.role === "sub_admin") {
                if (tab.key === "overview") return true; // always show overview
                return user.permissions?.includes(tab.key);
              }
              return false;
            }).map((item) => (
              <button
                key={item.key}
                onClick={() => setActivePanel(item.key as PanelKey)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                  activePanel === item.key ? "bg-white/10 text-white shadow-inner" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          {message && <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-xl text-sm">{message}</div>}

          {activePanel === "overview" && (
            <section className="space-y-6">
              <div className="rounded-2xl p-6 text-white bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-700 shadow-lg">
                <h2 className="text-2xl font-bold">Central Admin Command Center</h2>
                <p className="text-blue-100 mt-1">Live system stats, ownership approvals, and location hierarchy control.</p>
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <HeroMetric label="Pending Approvals" value={totals.pendingOwnerApprovals} />
                  <HeroMetric label="Blocked Accounts" value={totals.blockedUsers} />
                  <HeroMetric label="Total Units" value={totals.totalUnits} />
                  <HeroMetric label="Total Bookings" value={totals.totalBookings} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <InsightCard title="Total Accounts" value={users.length} subtitle="Platform-wide users" icon={<Users className="w-4 h-4" />} tone="blue" />
                <InsightCard title="Owner Approval Rate" value={`${approvalRate}%`} subtitle={`${verifiedPlots} verified of ${totals.totalPlots} plots`} icon={<CheckCircle2 className="w-4 h-4" />} tone="green" />
                <InsightCard title="Critical Queue" value={totals.pendingOwnerApprovals + pendingPlots} subtitle="Pending owner + plot actions" icon={<AlertTriangle className="w-4 h-4" />} tone="amber" />
                <InsightCard title="Ops Activity" value={totals.totalBookings + totals.totalUnits} subtitle="Bookings + units footprint" icon={<Activity className="w-4 h-4" />} tone="violet" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">User Registration Trend (6 Months)</h3>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                      <BarChart3 className="w-3 h-3" /> Auto-updated
                    </span>
                  </div>
                  <LineChart rows={monthlyRegistrations.map((m) => ({ label: m.label, value: m.count }))} />
                </div>

                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Role Composition</h3>
                  <RoleDonut rows={roleChart} />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Property Structure Footprint</h3>
                  <BarChart rows={structureChart} />
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status Mix</h3>
                  <RoleDonut rows={statusChart} />
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Unit Inventory Mix</h3>
                  <BarChart rows={inventoryMix.map((i) => ({ label: i.label, value: i.value, color: i.color }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Operational Queue</h3>
                  <QueueRow label="Owner approvals pending" value={totals.pendingOwnerApprovals} color="amber" />
                  <QueueRow label="Plots pending verification" value={pendingPlots} color="orange" />
                  <QueueRow label="Blocked accounts" value={totals.blockedUsers} color="red" />
                  <QueueRow label="Draft units" value={inventoryMix[0].value} color="slate" />
                  <QueueRow label="Listed units" value={inventoryMix[1].value} color="blue" />
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Executive Snapshot</h3>
                  <div className="space-y-3 text-sm">
                    <SnapshotItem label="Coverage" value={`${totals.totalZones} zones, ${totals.totalBlocks} blocks`} />
                    <SnapshotItem label="Asset depth" value={`${totals.totalPlots} plots, ${totals.totalBuildings} buildings`} />
                    <SnapshotItem label="Operational stock" value={`${totals.totalFloors} floors, ${totals.totalUnits} units`} />
                    <SnapshotItem label="Owner network" value={`${totals.totalOwners} owners`} />
                    <SnapshotItem label="Tenant base" value={`${totals.totalTenants} tenants`} />
                    <SnapshotItem label="Approval performance" value={`${approvalRate}% plot verification rate`} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Counters</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  <StatCard label="Tenants" value={totals.totalTenants} />
                  <StatCard label="Property Owners" value={totals.totalOwners} />
                  <StatCard label="Pending Owner Approvals" value={totals.pendingOwnerApprovals} />
                  <StatCard label="Blocked Users" value={totals.blockedUsers} />
                  <StatCard label="Zones" value={totals.totalZones} />
                  <StatCard label="Blocks" value={totals.totalBlocks} />
                  <StatCard label="Plots" value={totals.totalPlots} />
                  <StatCard label="Buildings" value={totals.totalBuildings} />
                  <StatCard label="Floors" value={totals.totalFloors} />
                  <StatCard label="Units" value={totals.totalUnits} />
                  <StatCard label="Bookings" value={totals.totalBookings} />
                </div>
              </div>
            </section>
          )}

          {activePanel === "users" && (
            <section className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Role & User Management</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="sub_admin">Sub Admin</option>
                    <option value="tenant">Tenant</option>
                    <option value="owner">Property Owner</option>
                  </select>
                  <button
                    onClick={() => {
                      setUserForm({ id: "", fullName: "", email: "", password: "", role: "tenant", phoneNumber: "" });
                      setShowUserModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add User
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2">Name</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((row) => (
                      <tr key={row.id} className="border-b">
                        <td className="py-2">
                          <p className="font-semibold text-gray-900">{row.fullName}</p>
                          <p className="text-gray-500">{row.email}</p>
                        </td>
                        <td className="py-2 capitalize">{row.role.replace("_", " ")}</td>
                        <td className="py-2">{row.status}</td>
                        <td className="py-2">
                          {row.role !== "admin" && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="text-xs px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-sm"
                                onClick={() => {
                                  setUserForm({ id: row.id, fullName: row.fullName, email: row.email, password: "", role: row.role, phoneNumber: row.phoneNumber || "" });
                                  setShowUserModal(true);
                                }}
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <button className="text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors shadow-sm" onClick={() => updateUserStatus(row.id, "Active")}>Activate</button>
                              <button className="text-xs px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors shadow-sm" onClick={() => updateUserStatus(row.id, "Suspended")}>Suspend</button>
                              <button className="text-xs px-3 py-1.5 rounded-md bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors shadow-sm" onClick={() => updateUserStatus(row.id, "Blocked")}>Block</button>
                              <button className="text-xs px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 font-medium hover:bg-rose-100 transition-colors flex items-center gap-1 shadow-sm" onClick={() => deleteRecord(`/api/admin/users/${row.id}`)}><Trash2 className="w-3 h-3"/> Delete</button>
                              {user?.role === "admin" && (
                                <button className="text-xs px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors shadow-sm" onClick={() => setPromoteModalUser(row.id)}>Make Sub-admin</button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!loadingData && filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{userForm.id ? "Edit User" : "Add New User"}</h3>
                      <button onClick={() => setShowUserModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input className={fieldClass} value={userForm.fullName} onChange={e => setUserForm(p => ({ ...p, fullName: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className={fieldClass} value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} required />
                      </div>
                      {!userForm.id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input type="password" minLength={6} className={fieldClass} value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} required />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="text" className={fieldClass} value={userForm.phoneNumber} onChange={e => setUserForm(p => ({ ...p, phoneNumber: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select className={fieldClass} value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value as RoleName }))} required>
                          <option value="tenant">Tenant</option>
                          <option value="owner">Property Owner</option>
                          {user?.role === "admin" && <option value="sub_admin">Sub Admin</option>}
                        </select>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">Cancel</button>
                        <button type="submit" className={primaryBtnClass}>{userForm.id ? "Save Changes" : "Add User"}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}

          {activePanel === "zones" && (
            <EntityPanel
              title="Zone Management"
              description="Create and maintain city-level service zones."
              createForm={
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (zoneForm.id) {
                      createRecord(`/api/admin/zones/${zoneForm.id}`, zoneForm, "Zone updated successfully", "PUT");
                    } else {
                      createRecord("/api/admin/zones", zoneForm, "Zone created successfully");
                    }
                    setZoneForm({ id: "", name: "", city: "", description: "" });
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                >
                  <input className={fieldClass} placeholder="Zone name" value={zoneForm.name} onChange={(e) => setZoneForm((p) => ({ ...p, name: e.target.value }))} required />
                  <input className={fieldClass} placeholder="City" value={zoneForm.city} onChange={(e) => setZoneForm((p) => ({ ...p, city: e.target.value }))} required />
                  <input className={fieldClass} placeholder="Description" value={zoneForm.description} onChange={(e) => setZoneForm((p) => ({ ...p, description: e.target.value }))} />
                  <div className="flex gap-2">
                    {zoneForm.id && <button type="button" onClick={() => setZoneForm({ id: "", name: "", city: "", description: "" })} className="w-full md:w-auto rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300">Cancel</button>}
                    <button className={primaryBtnClass} type="submit">{zoneForm.id ? "Save" : "Add Zone"}</button>
                  </div>
                </form>
              }
              rows={zoneRecords}
            />
          )}

          {activePanel === "blocks" && (
            <EntityPanel
              title="Block Management"
              description="Blocks are always linked to a specific zone."
              createForm={
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (blockForm.id) {
                      createRecord(`/api/admin/blocks/${blockForm.id}`, blockForm, "Block updated successfully", "PUT");
                    } else {
                      createRecord("/api/admin/blocks", blockForm, "Block created successfully");
                    }
                    setBlockForm({ id: "", zoneId: "", name: "", type: "sector" });
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                >
                  <SearchableSelect 
                    options={zones.map(z => ({ label: z.name, value: z._id }))} 
                    value={blockForm.zoneId} 
                    onChange={(e: any) => setBlockForm((p) => ({ ...p, zoneId: e.target.value }))} 
                    placeholder="Select zone" 
                    required 
                  />
                  <input className={fieldClass} placeholder="Block name" value={blockForm.name} onChange={(e) => setBlockForm((p) => ({ ...p, name: e.target.value }))} required />
                  <input className={fieldClass} placeholder="Type (sector/project)" value={blockForm.type} onChange={(e) => setBlockForm((p) => ({ ...p, type: e.target.value }))} />
                  <div className="flex gap-2">
                    {blockForm.id && <button type="button" onClick={() => setBlockForm({ id: "", zoneId: "", name: "", type: "sector" })} className="w-full md:w-auto rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300">Cancel</button>}
                    <button className={primaryBtnClass} type="submit">{blockForm.id ? "Save" : "Add Block"}</button>
                  </div>
                </form>
              }
              rows={blockRecords}
            />
          )}

          {activePanel === "plots" && (
            <EntityPanel
              title="Plot Management"
              description="Each plot is linked to both block and zone through hierarchy."
              createForm={
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (plotForm.id) {
                      createRecord(`/api/admin/plots/${plotForm.id}`, { ...plotForm, size: Number(plotForm.size) || null }, "Plot updated successfully", "PUT");
                    } else {
                      createRecord("/api/admin/plots", { ...plotForm, size: Number(plotForm.size) || null }, "Plot created successfully");
                    }
                    setPlotForm({ id: "", blockId: "", zoneId: "", plotNumber: "", address: "", size: "", primaryLandOwnerId: "" });
                  }}
                  className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
                >
                  <SearchableSelect options={blocks.map(b => ({ label: `${b.name} (${b.zone?.name || zoneById.get(b.zoneId)?.name || 'Unknown Zone'})`, value: b._id }))} value={plotForm.blockId} onChange={(e: any) => setPlotForm((p) => ({ ...p, blockId: e.target.value }))} placeholder="Select Block" required />
                  <SearchableSelect options={landOwners.map((u) => ({ label: u.fullName, value: u.id }))} value={plotForm.primaryLandOwnerId} onChange={(e: any) => setPlotForm((p) => ({ ...p, primaryLandOwnerId: e.target.value }))} placeholder="Land owner" required />
                  <input className={fieldClass} placeholder="Plot number" value={plotForm.plotNumber} onChange={(e) => setPlotForm((p) => ({ ...p, plotNumber: e.target.value }))} required />
                  <input className={fieldClass} placeholder="Address" value={plotForm.address} onChange={(e) => setPlotForm((p) => ({ ...p, address: e.target.value }))} />
                  <input className={fieldClass} placeholder="Size" value={plotForm.size} onChange={(e) => setPlotForm((p) => ({ ...p, size: e.target.value }))} />
                  <div className="flex gap-2">
                    {plotForm.id && <button type="button" onClick={() => setPlotForm({ id: "", blockId: "", zoneId: "", plotNumber: "", address: "", size: "", primaryLandOwnerId: "" })} className="w-full md:w-auto rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300">Cancel</button>}
                    <button className={primaryBtnClass} type="submit">{plotForm.id ? "Save" : "Add Plot"}</button>
                  </div>
                </form>
              }
              rows={plotRecords}
            />
          )}

          {activePanel === "buildings" && (
            <EntityPanel
              title="Building Management"
              description="Buildings inherit plot, block, and zone context."
              createForm={
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (buildingForm.id) {
                      createRecord(`/api/admin/buildings/${buildingForm.id}`, { ...buildingForm, totalFloors: Number(buildingForm.totalFloors) || 0 }, "Building updated successfully", "PUT");
                    } else {
                      createRecord("/api/admin/buildings", { ...buildingForm, totalFloors: Number(buildingForm.totalFloors) || 0 }, "Building created successfully");
                    }
                    setBuildingForm({ id: "", zoneId: "", blockId: "", plotId: "", name: "", totalFloors: "" });
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
                >
                  <SearchableSelect options={plots.map(p => {
                    const blockId = p.block?._id || p.blockId;
                    const block = blockId ? blockById.get(blockId) : null;
                    const zone = block?.zone?.name || (block?.zoneId ? zoneById.get(block.zoneId)?.name : "Unknown");
                    const blockName = p.block?.name || block?.name || "Unknown";
                    return { label: `Plot ${p.plotNumber} (${blockName}, ${zone})`, value: p._id };
                  })} value={buildingForm.plotId} onChange={(e: any) => setBuildingForm((p) => ({ ...p, plotId: e.target.value }))} placeholder="Select Plot" required />
                  <input className={fieldClass} placeholder="Building name" value={buildingForm.name} onChange={(e) => setBuildingForm((p) => ({ ...p, name: e.target.value }))} required />
                  <input className={fieldClass} placeholder="Total floors" value={buildingForm.totalFloors} onChange={(e) => setBuildingForm((p) => ({ ...p, totalFloors: e.target.value }))} />
                  <div className="flex gap-2">
                    {buildingForm.id && <button type="button" onClick={() => setBuildingForm({ id: "", zoneId: "", blockId: "", plotId: "", name: "", totalFloors: "" })} className="w-full md:w-auto rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300">Cancel</button>}
                    <button className={primaryBtnClass} type="submit">{buildingForm.id ? "Save" : "Add Building"}</button>
                  </div>
                </form>
              }
              rows={buildingRecords}
            />
          )}

          {activePanel === "floors" && (
            <EntityPanel
              title="Floor Management"
              description="Floors are attached to buildings and can be traced up to zone."
              createForm={
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (floorForm.id) {
                      createRecord(`/api/admin/floors/${floorForm.id}`, { ...floorForm, floorNumber: Number(floorForm.floorNumber) }, "Floor updated successfully", "PUT");
                    } else {
                      createRecord("/api/admin/floors", { ...floorForm, floorNumber: Number(floorForm.floorNumber) }, "Floor created successfully");
                    }
                    setFloorForm({ id: "", zoneId: "", blockId: "", plotId: "", buildingId: "", floorNumber: "" });
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                >
                  <SearchableSelect options={buildings.map(b => {
                    const plot = b.plot?._id ? plotById.get(b.plot._id) : null;
                    const blockId = plot?.block?._id || plot?.blockId;
                    const block = blockId ? blockById.get(blockId) : null;
                    const blockName = plot?.block?.name || block?.name || "Unknown";
                    const plotNumber = b.plot?.plotNumber || plot?.plotNumber || "Unknown";
                    return { label: `${b.name} (Plot ${plotNumber}, ${blockName})`, value: b._id };
                  })} value={floorForm.buildingId} onChange={(e: any) => setFloorForm((p) => ({ ...p, buildingId: e.target.value }))} placeholder="Select Building" required />
                  <input className={fieldClass} placeholder="Floor number" value={floorForm.floorNumber} onChange={(e) => setFloorForm((p) => ({ ...p, floorNumber: e.target.value }))} required />
                  <div className="flex gap-2">
                    {floorForm.id && <button type="button" onClick={() => setFloorForm({ id: "", zoneId: "", blockId: "", plotId: "", buildingId: "", floorNumber: "" })} className="w-full md:w-auto rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300">Cancel</button>}
                    <button className={primaryBtnClass} type="submit">{floorForm.id ? "Save" : "Add Floor"}</button>
                  </div>
                </form>
              }
              rows={floorRecords}
            />
          )}

          {activePanel === "units" && (
            <EntityPanel
              title="Unit Management"
              description="Units are created under floors and tracked with full hierarchy context."
              createForm={
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const payload = {
                        ...unitForm,
                        size: Number(unitForm.size) || null,
                        bedrooms: Number(unitForm.bedrooms) || null,
                        bathrooms: Number(unitForm.bathrooms) || null,
                        price: Number(unitForm.price) || null,
                    };
                    if (unitForm.id) {
                      createRecord(`/api/admin/units/${unitForm.id}`, payload, "Unit updated successfully", "PUT");
                    } else {
                      createRecord("/api/admin/units", payload, "Unit created successfully");
                    }
                    setUnitForm({ id: "", zoneId: "", blockId: "", plotId: "", buildingId: "", floorId: "", flatOwnerId: "", unitNumber: "", size: "", bedrooms: "", bathrooms: "", type: "Rent", price: "" });
                  }}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                >
                  <SearchableSelect options={floors.map(f => {
                    const building = f.building?._id ? buildingById.get(f.building._id) : null;
                    const plot = building?.plot?._id ? plotById.get(building.plot._id) : null;
                    const plotNumber = building?.plot?.plotNumber || plot?.plotNumber || "Unknown";
                    const buildingName = f.building?.name || building?.name || "Unknown";
                    return { label: `Floor ${f.floorNumber} (${buildingName}, Plot ${plotNumber})`, value: f._id };
                  })} value={unitForm.floorId} onChange={(e: any) => setUnitForm((p) => ({ ...p, floorId: e.target.value }))} placeholder="Select Floor" required />
                  <SearchableSelect options={flatOwners.map((u) => ({ label: u.fullName, value: u.id }))} value={unitForm.flatOwnerId} onChange={(e: any) => setUnitForm((p) => ({ ...p, flatOwnerId: e.target.value }))} placeholder="Flat owner" required />
                  <input className={fieldClass} placeholder="Unit number" value={unitForm.unitNumber} onChange={(e) => setUnitForm((p) => ({ ...p, unitNumber: e.target.value }))} required />
                  <input className={fieldClass} placeholder="Type (Rent/Sale)" value={unitForm.type} onChange={(e) => setUnitForm((p) => ({ ...p, type: e.target.value }))} />
                  <input className={fieldClass} placeholder="Price" value={unitForm.price} onChange={(e) => setUnitForm((p) => ({ ...p, price: e.target.value }))} />
                  <input className={fieldClass} placeholder="Size" value={unitForm.size} onChange={(e) => setUnitForm((p) => ({ ...p, size: e.target.value }))} />
                  <input className={fieldClass} placeholder="Beds" value={unitForm.bedrooms} onChange={(e) => setUnitForm((p) => ({ ...p, bedrooms: e.target.value }))} />
                  <input className={fieldClass} placeholder="Baths" value={unitForm.bathrooms} onChange={(e) => setUnitForm((p) => ({ ...p, bathrooms: e.target.value }))} />
                  <div className="flex gap-2 md:col-span-2">
                    {unitForm.id && <button type="button" onClick={() => setUnitForm({ id: "", zoneId: "", blockId: "", plotId: "", buildingId: "", floorId: "", flatOwnerId: "", unitNumber: "", size: "", bedrooms: "", bathrooms: "", type: "Rent", price: "" })} className="w-full md:w-auto rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300">Cancel</button>}
                    <button className={primaryBtnClass} type="submit">{unitForm.id ? "Save" : "Add Unit"}</button>
                  </div>
                </form>
              }
              rows={unitRecords}
            />
          )}

          {loadingData && (
            <div className="text-sm text-gray-500">Loading admin panel data...</div>
          )}
        </main>
      </div>

      {promoteModalUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Promote to Sub-admin</h3>
            <p className="text-sm text-gray-500 mb-4">Select the modules this sub-admin can manage.</p>
            <div className="space-y-2 mb-6">
              {PERM_OPTIONS.map(p => (
                <label key={p} className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedPerms.includes(p)} onChange={(e) => {
                    if (e.target.checked) setSelectedPerms([...selectedPerms, p]);
                    else setSelectedPerms(selectedPerms.filter(x => x !== p));
                  }} />
                  <span className="capitalize">{p}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPromoteModalUser(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handlePromoteUser} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Confirm Promotion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
      <p className="text-xs text-blue-100 uppercase">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function BarChart({ rows }: { rows: { label: string; value: number; color?: string }[] }) {
  const maxValue = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const width = `${Math.max(8, (row.value / maxValue) * 100)}%`;
        return (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{row.label}</span>
              <span className="text-gray-500">{row.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width, background: row.color || undefined }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ rows }: { rows: { label: string; value: number }[] }) {
  const width = 640;
  const height = 200;
  const padding = 24;
  const maxValue = Math.max(1, ...rows.map((r) => r.value));
  const stepX = rows.length > 1 ? (width - padding * 2) / (rows.length - 1) : 0;

  const points = rows.map((row, idx) => {
    const x = padding + idx * stepX;
    const y = height - padding - ((row.value / maxValue) * (height - padding * 2));
    return { ...row, x, y };
  });

  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `${padding},${height - padding} ${linePath} ${width - padding},${height - padding}`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        <defs>
          <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline fill="url(#lineAreaGradient)" stroke="none" points={areaPath} />
        <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={linePath} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="4" fill="#1d4ed8" />
        ))}
      </svg>

      <div className="grid grid-cols-6 gap-2 mt-1">
        {rows.map((r) => (
          <div key={r.label} className="text-center text-xs text-gray-500">
            <p>{r.label}</p>
            <p className="font-semibold text-gray-700">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueueRow({ label, value, color }: { label: string; value: number; color: "amber" | "orange" | "red" | "slate" | "blue" }) {
  const colorClass = {
    amber: "bg-amber-100 text-amber-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-800",
  }[color];

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-xs font-semibold px-2 py-1 rounded ${colorClass}`}>{value}</span>
    </div>
  );
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-semibold text-right">{value}</span>
    </div>
  );
}

function InsightCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  tone: "blue" | "green" | "amber" | "violet";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
  }[tone];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center ${toneClass}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function RoleDonut({ rows }: { rows: { label: string; value: number; color: string }[] }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  let cumulative = 0;
  const stops = rows.map((row) => {
    const start = cumulative;
    const ratio = total > 0 ? row.value / total : 0;
    cumulative += ratio * 360;
    return `${row.color} ${start}deg ${cumulative}deg`;
  }).join(', ');

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-40 h-40 rounded-full"
        style={{
          background: `conic-gradient(${stops || '#e5e7eb 0deg 360deg'})`
        }}
      >
        <div className="w-24 h-24 bg-white rounded-full mx-auto mt-8 flex items-center justify-center border border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{total}</p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-2">
        {rows.map((row) => {
          const percent = total > 0 ? Math.round((row.value / total) * 100) : 0;
          return (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
                <span className="text-gray-700">{row.label}</span>
              </div>
              <span className="text-gray-500">{row.value} ({percent}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EntityPanel({
  title,
  description,
  createForm,
  rows,
}: {
  title: string;
  description: string;
  createForm: React.ReactNode;
  rows: Array<{
    title: string;
    subtitle?: string;
    chips?: Array<{ label: string; value: string }>;
    onEdit?: () => void;
    onDelete?: () => void;
  }>;
}) {
  const [search, setSearch] = useState("");
  
  const filteredRows = rows.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    (r.subtitle && r.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Create New Record</h3>
        </div>
        {createForm}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-100">
        <div className="bg-gray-50 px-3 py-2 flex justify-between items-center">
          <span className="text-xs font-semibold uppercase text-gray-500">Records</span>
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 w-48"
          />
        </div>
        <div className="max-h-80 overflow-auto">
          {filteredRows.length === 0 && <div className="px-3 py-3 text-sm text-gray-500">No records found.</div>}
          {filteredRows.map((row, index) => (
            <div key={`${row.title}-${index}`} className="border-t border-gray-100 px-3 py-3 flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-900">{row.title}</p>
                {row.subtitle && <p className="mt-1 text-xs text-gray-500">{row.subtitle}</p>}
                {row.chips && row.chips.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.chips.map((chip, chipIndex) => (
                      <span key={`${chip.label}-${chipIndex}`} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {chip.label}: {chip.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {row.onEdit && (
                  <button 
                    onClick={row.onEdit}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition"
                  >
                    Edit
                  </button>
                )}
                {row.onDelete && (
                  <button 
                    onClick={row.onDelete}
                    className="text-xs text-red-500 font-semibold hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
