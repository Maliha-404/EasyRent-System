"use client";

import Link from "next/link";
import { Building2, Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPath, toAvatarInitial } from "@/lib/auth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const displayName = user?.fullName || "User";
  const displayPhone = user?.phoneNumber || "Phone not set";
  const displayPicture = user?.profile?.profilePicture || "";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const dashboardRoute = user ? getDashboardPath(user.role) : "/login";

  return (
    <nav className="fixed top-0 w-full z-50 glass-morphism border-b bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl tracking-tight text-gray-900">EasyRent</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Browse Flats
            </Link>
            {!user && (
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                List Your Property
              </Link>
            )}
            
            {!user ? (
              <Link 
                href="/login" 
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            ) : (
              <div 
                ref={menuRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 cursor-pointer rounded-full pr-3 pl-1 py-1.5 bg-blue-50 text-blue-700 border border-blue-100"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200 overflow-hidden">
                    {displayPicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={displayPicture} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      toAvatarInitial(displayName)
                    )}
                  </div>
                  <span className="text-sm font-semibold hidden lg:inline">{displayName}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                      <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{displayPhone}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link 
                      href={dashboardRoute}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
                </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
