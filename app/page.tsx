import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Building, ShieldCheck, CalendarCheck } from "lucide-react";
import { areas, flats } from "@/data/mockData";
import FlatCard from "@/components/FlatCard";

export default function Home() {
  const featuredFlats = flats.slice(0, 6);

  return (
    <div className="w-full">
      {/* SECTION 1: HERO BANNER */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2000"
          alt="Modern Home Building"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            Find Your Next Perfect Home
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-medium">
            Discover premium flats for rent or sale. The best properties across the most vibrant neighborhoods.
          </p>

          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl w-full max-w-3xl shadow-2xl border border-white/20">
            <div className="bg-white rounded-xl p-2 flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 flex items-center px-4 w-full">
                <MapPin className="text-gray-400 h-5 w-5 mr-3 flex-shrink-0" />
                <select className="w-full py-3 bg-transparent text-gray-700 outline-none cursor-pointer appearance-none font-medium">
                  <option value="">Select an Area</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="hidden md:block w-px h-8 bg-gray-200"></div>
              <div className="flex-1 flex items-center px-4 w-full">
                <Building className="text-gray-400 h-5 w-5 mr-3 flex-shrink-0" />
                <select className="w-full py-3 bg-transparent text-gray-700 outline-none cursor-pointer appearance-none font-medium">
                  <option value="">Property Type</option>
                  <option value="Rent">For Rent</option>
                  <option value="Sale">For Sale</option>
                </select>
              </div>
              <div className="w-full md:w-auto mt-2 md:mt-0 px-2 md:px-0">
                <Link href="/properties" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md">
                  <Search className="h-5 w-5" />
                  Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: AREA DISCOVERY */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Neighborhoods</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover properties in our most sought-after locations, offering the best amenities and lifestyle.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {areas.map((area) => (
              <Link href="/properties" key={area.id} className="group relative rounded-2xl overflow-hidden h-72 shadow-sm hover:shadow-xl transition-all block">
                <Image
                  src={area.image || "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800"}
                  alt={area.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-xl font-bold text-white mb-2">{area.name}</h3>
                  <div className="flex items-center text-white/80 text-sm gap-2">
                    <Building className="h-4 w-4" />
                    <span>View Buildings</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED LISTINGS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Handpicked Properties</h2>
              <p className="text-gray-600 max-w-2xl">Browse our top selection of premium flats perfectly suited for your needs.</p>
            </div>
            <Link href="/properties" className="hidden sm:flex text-blue-600 font-semibold items-center gap-1 hover:text-blue-700 transition-colors">
              View All Properties <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredFlats.map((flat) => (
              <FlatCard key={flat.id} flat={flat} />
            ))}
          </div>
          
          <div className="mt-12 text-center sm:hidden">
            <Link href="/properties" className="inline-block bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-xl hover:bg-gray-50 transition-all w-full">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: TRUST & PROCESS */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 rounded-bl-[100px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Process</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">From discovering your dream home to moving in, we make the entire process completely seamless.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 transform rotate-3 relative">
                <Search className="h-10 w-10 text-white transform -rotate-3" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center font-bold text-sm shadow-md">1</div>
              </div>
              <h3 className="text-xl font-bold mb-3">Search & Filter</h3>
              <p className="text-gray-400">Discover extensive listings with detailed descriptions and immersive photos.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 transform -rotate-3 relative">
                <CalendarCheck className="h-10 w-10 text-white transform rotate-3" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center font-bold text-sm shadow-md">2</div>
              </div>
              <h3 className="text-xl font-bold mb-3">Book & Verify</h3>
              <p className="text-gray-400">Secure your dream home online. We verify owners to guarantee your peace of mind.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 transform rotate-3 relative">
                <ShieldCheck className="h-10 w-10 text-white transform -rotate-3" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center font-bold text-sm shadow-md">3</div>
              </div>
              <h3 className="text-xl font-bold mb-3">Move In Safely</h3>
              <p className="text-gray-400">Finalize paperwork digitally and get ready for a stress-free move into your new place.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
