import { flats } from "@/data/mockData";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FlatDetailsPage({ params }: { params: { id: string } }) {
  const flat = flats.find(f => f.id === params.id);

  if (!flat) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Flat Not Found</h1>
        <Link href="/properties" className="text-blue-600 hover:text-blue-800">Back to Properties</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/properties" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Properties
        </Link>
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative h-96 w-full">
            <Image 
              src={flat.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"} 
              alt={`Apt ${flat.flat_number}`} 
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-3">
                  {flat.type}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Apartment {flat.flat_number}</h1>
                <p className="text-gray-500">Floor {flat.floor} | {flat.size} sqft</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-900">৳{flat.price.toLocaleString()}</h2>
                {flat.type === "Rent" && <p className="text-gray-500">per month</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
