export type UserRole = "user" | "owner" | "admin";
export type UserPersona =
  | "user"
  | "tenant"
  | "buyer"
  | "renter"
  | "owner"
  | "landlord"
  | "seller"
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
  phoneNumber: string;
  profile: AuthProfile;
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
