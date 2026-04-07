"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { getDashboardPath } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loggedInUser = await login({ email, password });
      router.push(getDashboardPath(loggedInUser.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-semibold flex items-center justify-center py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing In..." : "Sign In Securely"}
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-500">
          New here?{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
