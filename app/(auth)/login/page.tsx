"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { users } from "@/data/mockData";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Look for matching user in mockData
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      if (foundUser.status === "Blocked") {
        setError("Your account has been suspended by the Admin.");
        return;
      }
      
      login(foundUser);
      
      // Redirect based on role
      switch (foundUser.role) {
        case "User": router.push("/dashboard/user"); break;
        case "Owner": router.push("/dashboard/owner"); break;
        case "Admin": router.push("/dashboard/admin"); break;
        default: router.push("/");
      }
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen py-24 bg-gray-50 flex items-center justify-center -mt-16">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-bold mb-2">Sign In</h1>
        <p className="text-gray-500 mb-8">Access your EasyRent dashboard</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input 
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
            placeholder="Email Address" 
          />
          <input 
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
            placeholder="Password" 
          />
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold flex items-center justify-center py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Sign In Securely
          </button>
        </form>
      </div>
    </div>
  );
}
