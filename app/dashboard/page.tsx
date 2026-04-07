"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";

export default function DashboardEntryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(getDashboardPath(user.role));
  }, [user, isLoading, router]);

  return null;
}
