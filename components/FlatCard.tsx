import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Square, Building } from "lucide-react";
import { PropertyItem } from "@/types/property";

interface FlatCardProps {
  flat: PropertyItem;
}

export default function FlatCard({ flat }: FlatCardProps) {
  const normalizedStatus = String(flat.status || "").toLowerCase();
  const isAvailable = normalizedStatus === "available" || normalizedStatus === "listed";
  
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <div className="relative h-56 w-full overflow-hidden">
        <Image 
          src={flat.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"} 
          alt={`Flat ${flat.flat_number}`} 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${
            isAvailable ? "bg-emerald-500/90 text-white" : 
            normalizedStatus === "booked" ? "bg-amber-500/90 text-white" : "bg-red-500/90 text-white"
          }`}>
            {flat.status}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
          {flat.type}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-gray-900">
            ৳{flat.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">{flat.type === "Rent" ? "/ mo" : ""}</span>
          </h3>
          <div className="flex items-center text-gray-500 text-sm gap-1 bg-gray-50 px-2 py-1 rounded-md">
            <Building className="h-3 w-3" />
            <span>Fl. {flat.floor}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm font-medium mb-4 flex items-center gap-1">
          Apt {flat.flat_number}
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 mt-auto">
          {flat.bedrooms && (
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4" />
              <span>{flat.bedrooms} Beds</span>
            </div>
          )}
          {flat.bathrooms && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              <span>{flat.bathrooms} Baths</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Square className="h-4 w-4" />
            <span>{flat.size} sqft</span>
          </div>
        </div>
        
        <Link 
          href={`/properties/${flat.id}`} 
          className={`w-full text-center py-2.5 rounded-xl font-medium transition-colors ${
            isAvailable 
              ? "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
          }`}
        >
          {isAvailable ? "View Details" : "Not Available"}
        </Link>
      </div>
    </div>
  );
}
