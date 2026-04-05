import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding */}
        <div className="col-span-1 md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-500" />
            <span className="font-bold text-xl text-white">EasyRent</span>
          </div>
          <p className="text-sm text-gray-400">
            Your trusted housing availability and booking platform, brought to you by AllInfoZone.
          </p>
        </div>

        {/* Site Map */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
            <li><Link href="/properties" className="hover:text-blue-400 transition-colors">Browse Properties</Link></li>
            <li><Link href="/dashboard/owner" className="hover:text-blue-400 transition-colors">Add Listing</Link></li>
            <li><Link href="/dashboard/user" className="hover:text-blue-400 transition-colors">My Profile</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span>support@allinfozone.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" />
              <span>+1 (800) 123-4567</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>123 Logic Ave, Tech City</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
        &copy; {new Date().getFullYear()} AllInfoZone. All rights reserved. EasyRent Prototype.
      </div>
    </footer>
  );
}
