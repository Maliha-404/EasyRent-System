# Authenticated Demo Guide

To make your presentation fully functional, I have integrated a **Mock Authentication Context** using local storage. This simulates a real backend session.

## Test Credentials

Navigate to `http://localhost:3000/login` and use any of the credentials below to log into the respective roles. 

*(Note: The global password for all demo accounts is `1234`)*

### 👤 Tenant (User) Role
Demonstrates the `User Dashboard` showing active flat bookings and rent payments.
- **Email:** `sakib@example.com`
- **Email:** `mushfiq@example.com`
- **Password:** `1234`

### 🏢 Property Owner Role
Demonstrates the `Owner Dashboard` showing property analytics, building management, and notices.
- **Email:** `tamim@owner.com`
- **Password:** `1234`

*(Note: I added an account `mash@owner.com` which is currently set to `Pending` status. If you try logging in with it, the UI will currently accept it, but typically this serves to test Admin verifications!).*

### ⚙️ Admin Role
Demonstrates the `Super Admin Hub` for verifying users, suspending accounts, and tracking system-wide metrics.
- **Email:** `admin@easyrent.bd`
- **Password:** `1234`

---

## How It Works

**1. The Auth Context (`context/AuthContext.tsx`)**
When you enter an email and password in the `/login` route, the interface checks if those details precisely match an object inside `mockData.ts`. If it does, the `AuthContext` saves that specific user object into your browser's `localStorage` and redirects you.

**2. Dynamic Navbars**
The `<Navbar />` listens to `useAuth()`.
- If no user is logged in, it shows the **Sign In** button.
- If a user is logged in, it dynamically reads `user.name`, takes the first letter (e.g., 'S' for Sakib), and renders an **Avatar Badge**.
- Hovering the Avatar reveals a dropdown pointing exactly to that specific user's designated dashboard, alongside a secure **Logout** button.

**3. Protected Routing**
If anyone directly types `localhost:3000/dashboard/admin` into their URL bar without being logged in as the Admin, the `useEffect` inside `app/dashboard/admin/page.tsx` will detect their invalid role and immediately kick them back to the `/login` page.

Enjoy the fully functional routing demo!
