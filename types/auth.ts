export type UserRole = "tenant" | "owner" | "admin" | "sub_admin";
export type UserPersona =
  | "tenant"
  | "owner"
  | "central_admin";

export interface AuthProfile {
  profilePicture: string;
  address: string;
  preferredArea: string;
  nid: string;
  bio: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  persona: string;
  phoneNumber?: string;
  profile?: AuthProfile;
  permissions?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  persona?: UserPersona;
  phoneNumber: string;
  profilePicture?: string;
  address?: string;
  preferredArea?: string;
  nid?: string;
  bio?: string;
}
