"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "owner">("user");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [address, setAddress] = useState("");
  const [preferredArea, setPreferredArea] = useState("");
  const [nid, setNid] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await register({
        fullName,
        email,
        password,
        role,
        phoneNumber,
        profilePicture,
        address,
        preferredArea,
        nid,
        bio,
      });

      setSuccess("Registration successful. Please sign in to continue.");
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-24 bg-gray-50 flex items-center justify-center -mt-16 px-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-500 mb-8">Join EasyRent today.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Full Name*"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Phone Number* (e.g. +88017...)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password* (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "owner")}
          >
            <option value="user">User</option>
            <option value="owner">Owner</option>
          </select>
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Profile Picture URL (optional)"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Preferred Area (optional)"
            value={preferredArea}
            onChange={(e) => setPreferredArea(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="NID (optional)"
            value={nid}
            onChange={(e) => setNid(e.target.value)}
          />
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2 min-h-24"
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button
            className="w-full md:col-span-2 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
