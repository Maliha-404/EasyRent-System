# EasyRent - System Documentation & Faculty Guide

This document outlines the architecture, features, and code structure of the **EasyRent** frontend prototype. It maps the implemented functionality directly to the **Software Requirement Specifications (SRS)** provided for the Area-Based Housing Availability and Booking Platform, specifically tailored for the Bangladesh (Dhaka) context.

---

## 📌 1. Project Overview & Purpose

**EasyRent** is built to solve a specific regional problem: finding, booking, and managing flats effectively on a structured, area-by-area basis. The prototype fulfills the fundamental UX/UI requirements of the SRS by providing a distinct division between public browsing layers and role-based operational dashboards.

**Tech Stack Used:**
- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Styling:** Tailwind CSS (Utility-First)
- **Icons:** Lucide-React 
- **Data Source:** Local Mock JSON representing relational database entities.

---

## 🎯 2. How the Prototype Fulfills the Requirements

The system explicitly tackles the 15 functional requirements categorized by user roles:

### Unregistered & General Users
1. **Browsing & Discovery (Req 1, 3, 4):**
   - Users can land on the Homepage and immediately see Featured Areas (Uttara, Bashundhara, Gulshan) and Handpicked Flats.
   - The `/properties` page features a comprehensive sidebar filtering mechanism to zero in on properties by Area, Type (Rent/Sale), and Price bracket.
   - Distinct Flat pages (`/properties/[id]`) display the required parameters: Size, Price (in ৳ BDT), Floor, and Status badges.

### Role-Based Architectures (Req 2, 6-15)
While backend logic (databases, auth sessions) is reserved for Phase 2, the frontend establishes strict routing silos for role requirements:
- **Authentication:** `(auth)/login` & `(auth)/register` govern entry points.
- **Tenant Dashboard (`/dashboard/user`):** Outlines where a logged-in user will track their advance payments, rent receipts, and booking statuses.
- **Owner Dashboard (`/dashboard/owner`):** Grants property owners the interface to add buildings to specific areas, list flats, manage notices, and track admin commission metrics.
- **Admin Dashboard (`/dashboard/admin`):** Acts as the centralized hub for user management, system-wide total bookings, and commission revenue summaries.

---

## 📂 3. Codebase Structure & Navigation

For faculty review, it's critical to understand how the Next.js **App Router** separates concerns. Here is where every piece of code lives:

### The "app/" Directory (Pages & Routing)
- `app/layout.tsx`: The global wrapper. This file defines the global font (Inter) and holds the permanent `<Navbar />` and `<Footer />` components so they appear on every page.
- `app/page.tsx`: The primary **Homepage**. Contains the Hero Search Banner, Area Discovery Grids, and the 3-step 'Trust & Process' module.
- `app/properties/page.tsx`: The **Search & Filtering Engine**. A two-column layout mapping over our mock data array based on user input (Area, Rent/Sale).
- `app/properties/[id]/page.tsx`: A **Dynamic Route**. When a user clicks a Flat Card, Next.js dynamically loads this file, injecting the `id` to pull the specific flat details from our mock data.
- `app/dashboard/`: Contains the split logic for the 3 user roles (`admin`, `owner`, `user`), ensuring they are visually and logically separated.

### The "components/" Directory (Reusable UI)
- `components/Navbar.tsx`: Features conditional rendering concepts and "Glassmorphism" styling using Tailwind backdrop filters.
- `components/Footer.tsx`: Contains all site-map links and legal/contact information branding for *AllInfoZone*.
- `components/FlatCard.tsx`: The most important reusable component. It takes a raw `Flat` object and formats it into a beautiful, clickable card with status-driven color badges (e.g., Green for Available, Red for Occupied).

### The "data/" Directory (Database Mockup)
- `data/mockData.ts`: Since the backend is pending, this file acts as our Entity Relationship database. It holds relational TypeScript arrays for `areas`, `buildings`, and `flats`. 
   - **Note for Faculty:** Notice how a `Flat` object contains a `buildingId`, and a `Building` object contains an `areaId`. This accurately simulates robust relational database structuring.

---

## 🏙️ 4. Localization (The Bangladesh Context)

To ensure the project aligns with the target demographic:
- Currency outputs across the application strictly use regional formats (e.g., `৳35,000` via automated `.toLocaleString()` methods).
- Seeded Data specifically replicates upscale and high-density Dhaka environments: **Uttara Sector 11, Uttara Sector 4, Bashundhara R/A, and Gulshan 2**.
- Pricing models emulate realistic property valuations for the simulated sectors.

---

## 🚀 5. Next Steps for Development
If explaining the project roadmap to faculty, highlight that this is the **Frontend Interactive Prototype**. The subsequent steps will be:
1. Connecting PostgreSQL/MongoDB to replace the `mockData.ts` arrays.
2. Integrating NextAuth or Firebase to harden the `(auth)/` workflows.
3. Hooking up payment gateways (e.g., SSLCommerz, bKash) to fulfill the advance booking and monthly rent functional transactions.
