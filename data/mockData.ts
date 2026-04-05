// --- Entities ---
export interface Area { id: string; name: string; city: string; description: string; image?: string; }
export interface Building { id: string; name: string; address: string; areaId: string; ownerId: string; }
export interface Flat { id: string; buildingId: string; flat_number: string; size: number; price: number; type: "Rent" | "Sale"; status: "Available" | "Booked" | "Occupied"; availability_date: string; floor: number; image?: string; bedrooms?: number; bathrooms?: number; }
export interface User { id: string; name: string; email: string; password?: string; role: "User" | "Owner" | "Admin"; status: "Active" | "Blocked" | "Pending"; }
export interface Booking { id: string; userId: string; flatId: string; date: string; status: "Pending" | "Confirmed" | "Cancelled"; advanceAmount: number; }
export interface Payment { id: string; userId: string; bookingId?: string; date: string; amount: number; purpose: "Rent" | "Advance" | "Commission"; status: "Paid" | "Pending"; }
export interface Notice { id: string; ownerId: string; buildingId: string; title: string; content: string; date: string; }

// --- Static Mock Data ---
export const areas: Area[] = [
  { id: "a1", name: "Uttara Sector 11", city: "Dhaka", description: "A peaceful residential area with excellent connectivity and modern amenities.", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800" },
  { id: "a2", name: "Uttara Sector 4", city: "Dhaka", description: "Well-planned sector known for its parks, quiet environment, and prominent schools.", image: "https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?auto=format&fit=crop&q=80&w=800" },
  { id: "a3", name: "Bashundhara R/A", city: "Dhaka", description: "Premium residential zone with top universities, hospitals, and shopping malls nearby.", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" },
  { id: "a4", name: "Gulshan 2", city: "Dhaka", description: "The diplomatic zone offering ultra-luxury apartments, embassies, and elite clubs.", image: "https://images.unsplash.com/photo-1512453979436-5a50ce8c5145?auto=format&fit=crop&q=80&w=800" },
];

export const buildings: Building[] = [
  { id: "b1", name: "Rahman Tower", address: "Road 14, Uttara Sector 11, Dhaka", areaId: "a1", ownerId: "o1" },
  { id: "b2", name: "Chowdhury Plaza", address: "Road 5, Uttara Sector 11, Dhaka", areaId: "a1", ownerId: "o2" },
  { id: "b3", name: "Bhuiyan Villa", address: "Road 7, Uttara Sector 4, Dhaka", areaId: "a2", ownerId: "o3" },
  { id: "b4", name: "Apollo Heights", address: "Block D, Bashundhara R/A, Dhaka", areaId: "a3", ownerId: "o4" },
  { id: "b5", name: "Imperial Court", address: "Road 79, Gulshan 2, Dhaka", areaId: "a4", ownerId: "o1" },
];

export const flats: Flat[] = [
  { id: "f1", buildingId: "b1", flat_number: "4A", size: 1400, price: 35000, type: "Rent", status: "Available", availability_date: "2024-11-01", floor: 4, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800", bedrooms: 3, bathrooms: 3 },
  { id: "f2", buildingId: "b1", flat_number: "7B", size: 1600, price: 12500000, type: "Sale", status: "Available", availability_date: "Immediate", floor: 7, image: "https://images.unsplash.com/photo-1502672260266-1c1e5250ce73?auto=format&fit=crop&q=80&w=800", bedrooms: 3, bathrooms: 3 },
  { id: "f3", buildingId: "b3", flat_number: "2A", size: 1100, price: 25000, type: "Rent", status: "Available", availability_date: "2024-12-15", floor: 2, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800", bedrooms: 2, bathrooms: 2 },
  { id: "f4", buildingId: "b4", flat_number: "5C", size: 1800, price: 42000, type: "Rent", status: "Booked", availability_date: "N/A", floor: 5, image: "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&q=80&w=800", bedrooms: 3, bathrooms: 4 },
  { id: "f5", buildingId: "b5", flat_number: "9B", size: 2800, price: 45000000, type: "Sale", status: "Available", availability_date: "Immediate", floor: 9, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800", bedrooms: 4, bathrooms: 4 },
  { id: "f6", buildingId: "b2", flat_number: "PH-1", size: 3000, price: 85000, type: "Rent", status: "Occupied", availability_date: "2025-05-01", floor: 12, image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800", bedrooms: 4, bathrooms: 4 },
];

export const users: User[] = [
  { id: "u1", name: "Sakib Al Hasan", email: "sakib@example.com", password: "1234", role: "User", status: "Active" },
  { id: "u2", name: "Mushfiqur Rahim", email: "mushfiq@example.com", password: "1234", role: "User", status: "Active" },
  { id: "o1", name: "Tamim Rahman", email: "tamim@owner.com", password: "1234", role: "Owner", status: "Active" },
  { id: "o2", name: "Mashrafe Bin", email: "mash@owner.com", password: "1234", role: "Owner", status: "Pending" },
  { id: "ad1", name: "System Admin", email: "admin@easyrent.bd", password: "1234", role: "Admin", status: "Active" },
];

export const bookings: Booking[] = [
  { id: "bk1", userId: "u1", flatId: "f4", date: "2024-03-24", status: "Confirmed", advanceAmount: 42000 },
  { id: "bk2", userId: "u2", flatId: "f6", date: "2024-03-20", status: "Confirmed", advanceAmount: 85000 },
  { id: "bk3", userId: "u1", flatId: "f3", date: "2024-03-28", status: "Pending", advanceAmount: 25000 },
  { id: "bk4", userId: "u2", flatId: "f1", date: "2024-02-15", status: "Cancelled", advanceAmount: 35000 },
];

export const payments: Payment[] = [
  { id: "p1", userId: "u1", bookingId: "bk1", date: "2024-03-24", amount: 42000, purpose: "Advance", status: "Paid" },
  { id: "p2", userId: "u2", bookingId: "bk2", date: "2024-03-20", amount: 85000, purpose: "Advance", status: "Paid" },
  { id: "p3", userId: "o1", date: "2024-03-25", amount: 2000, purpose: "Commission", status: "Pending" },
  { id: "p4", userId: "u1", bookingId: "bk1", date: "2024-04-01", amount: 42000, purpose: "Rent", status: "Paid" },
];

export const notices: Notice[] = [
  { id: "n1", ownerId: "o1", buildingId: "b1", title: "Lift Maintenance", content: "The left lift will be under maintenance from 10 AM to 2 PM on Sunday.", date: "2024-03-27" },
  { id: "n2", ownerId: "o4", buildingId: "b4", title: "Water Supply Delay", content: "Water supply will be restricted on Friday morning.", date: "2024-03-28" },
];
