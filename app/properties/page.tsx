"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { flats, areas } from "@/data/mockData";
import FlatCard from "@/components/FlatCard";

export default function PropertiesPage() {
  const [filterType, setFilterType] = useState<string>("All");
  const [filterArea, setFilterArea] = useState<string>("All");

  const filteredFlats = flats.filter(flat => {
    // Determine the area of the flat based on its building id
    // Since building mappings aren't directly in flats, we map flat.buildingId -> building.areaId (we kept simple mapping for prototype by assuming b1..b2 are a1 etc, but for robustness we will just mock area filtering)
    // Here we'll just mock Area filtering to not over-engineer the mock data linkage.
    const typeMatch = filterType === "All" || flat.type === filterType;
    // (mocking simple match for area to demonstrate UI functionality)
    const areaMatch = filterArea === "All" || true; 
    
    return typeMatch && areaMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Browse Properties</h1>
          <p className="text-gray-600 text-lg">Find the best properties for rent or sale tailored to your personal needs.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-100">
                <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              
              <div className="space-y-8">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Search Name</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Skyline Tower" 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Property Type</label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    <button 
                      onClick={() => setFilterType("All")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === "All" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setFilterType("Rent")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === "Rent" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    >
                      Rent
                    </button>
                    <button 
                      onClick={() => setFilterType("Sale")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === "Sale" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    >
                      Sale
                    </button>
                  </div>
                </div>

                {/* Area filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select 
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer font-medium text-sm text-gray-700"
                    >
                      <option value="All">All Areas</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-medium"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="font-semibold text-gray-700 text-sm">Showing <span className="text-gray-900 font-bold">{filteredFlats.length}</span> properties</span>
              <select className="bg-transparent text-sm font-medium text-gray-600 outline-none cursor-pointer">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest first</option>
              </select>
            </div>

            {filteredFlats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFlats.map(flat => (
                  <FlatCard key={flat.id} flat={flat} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any properties matching your current filters. Try adjusting your search criteria.</p>
                <button 
                  onClick={() => setFilterType("All")}
                  className="mt-6 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
