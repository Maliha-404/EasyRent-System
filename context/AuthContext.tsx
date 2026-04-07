"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "easyrent_user";
const TOKEN_STORAGE_KEY = "easyrent_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const normalizeUser = (raw: unknown): AuthUser | null => {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Record<string, unknown>;
  const profile = (data.profile && typeof data.profile === "object" ? data.profile : {}) as Record<string, unknown>;

  const id = String(data.id || "").trim();
  const fullName = String(data.fullName || data.name || "").trim();
  const email = String(data.email || "").trim();
  const role = String(data.role || "user").trim().toLowerCase();

  if (!id || !fullName || !email) return null;

  return {
    id,
    fullName,
    email,
    role: (role === "owner" || role === "admin" ? role : "user") as AuthUser["role"],
    phoneNumber: String(data.phoneNumber || "").trim(),
    profile: {
      profilePicture: String(profile.profilePicture || "").trim(),
      address: String(profile.address || "").trim(),
      preferredArea: String(profile.preferredArea || "").trim(),
      nid: String(profile.nid || "").trim(),
      bio: String(profile.bio || "").trim(),
    },
  };
};

const parseApiMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.message || "Request failed";
  } catch {
    return "Request failed";
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async (activeToken?: string): Promise<AuthUser | null> => {
    const tokenToUse = activeToken || token;
    if (!tokenToUse) return null;

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenToUse}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const normalized = normalizeUser(data.user);
    if (!normalized) return null;

    setUser(normalized);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (storedUser) {
      try {
        const normalized = normalizeUser(JSON.parse(storedUser));
        if (normalized) {
          setUser(normalized);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }

    if (storedToken) {
      setToken(storedToken);
      refreshUser(storedToken)
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    setIsLoading(false);
  }, []);

  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await parseApiMessage(response));
    }

    const data = await response.json();
    const normalized = normalizeUser(data.user);
    if (!normalized) {
      throw new Error("Received invalid user payload from server");
    }

    setUser(normalized);
    setToken(data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    return normalized;
  };

  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await parseApiMessage(response));
    }

    const data = await response.json();
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
