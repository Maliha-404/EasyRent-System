# EasyRent Frontend Instruction Guide

This guide explains the frontend structure, how it integrates with your backend auth APIs, and what each key file/folder does.

## 1. Frontend Folder Map

### App Router pages

- `app/layout.tsx`: global layout, wraps whole app with `AuthProvider`, plus `Navbar` and `Footer`.
- `app/page.tsx`: landing page.
- `app/(auth)/login/page.tsx`: sign-in UI and login submission flow.
- `app/(auth)/register/page.tsx`: sign-up UI and registration submission flow.
- `app/dashboard/admin/page.tsx`: admin dashboard, fetches admin APIs with JWT.
- `app/dashboard/owner/page.tsx`: owner dashboard UI.
- `app/dashboard/user/page.tsx`: user dashboard UI.
- `app/properties/page.tsx`: property list/browse.
- `app/properties/[id]/page.tsx`: property detail by dynamic route id.

### Shared UI and utility

- `components/Navbar.tsx`: auth-aware top nav; shows profile menu and logout when logged in.
- `components/Footer.tsx`: common site footer.
- `components/FlatCard.tsx`: reusable property card component.
- `context/AuthContext.tsx`: main auth state manager and backend API communication for auth.
- `lib/auth.ts`: role normalization and role-based navigation helpers.
- `types/auth.ts`: shared TypeScript auth payload/user/role types.
- Public and dashboard pages now load data from backend APIs (`/api/public/*`, `/api/dashboard/*`).

## 2. How Backend API Is Integrated

The main API integration for auth happens in `context/AuthContext.tsx`.

### Base URL configuration

- Uses `NEXT_PUBLIC_API_BASE_URL`.
- Fallback is `http://localhost:5000`.

Code pattern:

`const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";`

This is used for auth, public property, and dashboard fetch calls.

## 3. Authentication Integration Flow

### A) Register flow

From `app/(auth)/register/page.tsx`:

1. Collects form data (`fullName`, `email`, `password`, `role`, `phoneNumber`, optional profile fields).
2. Calls `register(...)` from `useAuth()`.

In `context/AuthContext.tsx`:

3. Sends `POST ${API_BASE_URL}/api/auth/register`.
4. If failed, parses backend error message and throws.
5. If successful, returns created user.

Back in page:

6. Shows success message.
7. Redirects to `/login`.

### B) Login flow

From `app/(auth)/login/page.tsx`:

1. Collects `email` and `password`.
2. Calls `login(...)` from `useAuth()`.

In `context/AuthContext.tsx`:

3. Sends `POST ${API_BASE_URL}/api/auth/login`.
4. Receives `{ token, user }` from backend.
5. Normalizes user payload.
6. Stores token and user in state and `localStorage`:
    - `easyrent_token`
    - `easyrent_user`

Back in page:

7. Redirects based on role via `getDashboardPath(...)`:
    - `admin` -> `/dashboard/admin`
   - `land_owner` or `flat_owner` -> `/dashboard/owner`
    - default -> `/dashboard/user`

### C) Session restore on refresh

On app load (`AuthProvider` `useEffect`):

1. Reads `localStorage` for token and cached user.
2. If token exists, calls `refreshUser(...)`.
3. `refreshUser(...)` sends `GET ${API_BASE_URL}/api/auth/me` with bearer token.
4. If valid, updates user state.
5. If invalid/expired, clears local session.

This keeps users logged in across reloads until token becomes invalid.

### D) Logout

From `components/Navbar.tsx`, `handleLogout()`:

1. Calls `logout()` from `AuthContext`.
2. Clears user/token state and localStorage keys.
3. Redirects to `/`.

## 4. Admin API Integration in Frontend

In `app/dashboard/admin/page.tsx`:

- Requires authenticated `admin` role.
- Uses token from `useAuth()`.
- Fetches in parallel:
   - `GET /api/admin/overview`
   - `GET /api/admin/users`
- Sends bearer token in `Authorization` header.
- For status changes, uses:
   - `PATCH /api/admin/users/:id/status`

If request succeeds, it re-fetches dashboard data.

## 5. Role and Access Logic

In `lib/auth.ts`:

- `normalizeRole(...)`: converts role aliases to one canonical role.
- `getDashboardPath(...)`: maps role to dashboard route.
- `canAccessDashboard(...)`: strict role check for protected pages.
- `toAvatarInitial(...)`: fallback initial for navbar avatar.

In `app/dashboard/admin/page.tsx`:

- Redirects to `/login` if user is missing or not admin.

## 6. Data Contracts Used by Frontend

In `types/auth.ts`:

- `UserRole`: `user | owner | admin`
- `AuthUser`: authenticated user shape used in UI.
- `LoginPayload`: payload for login request.
- `RegisterPayload`: payload for register request.

These types keep frontend/backend payload handling consistent.

## 7. Design and UI Responsibilities

- Authentication page UI design:
   - `app/(auth)/login/page.tsx`
   - `app/(auth)/register/page.tsx`
- Global shell look and spacing:
   - `app/layout.tsx`
   - `components/Navbar.tsx`
   - `components/Footer.tsx`
- Dashboard UI design:
   - `app/dashboard/*`
- Property browsing card design:
   - `components/FlatCard.tsx`

The frontend styling uses Tailwind utility classes directly in these components/pages.

## 8. Frontend Environment Requirements

Set in frontend `.env.local`:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`

If omitted, frontend defaults to localhost backend URL, which is fine for local development.

## 9. Quick End-to-End Auth Trace

Register:

1. User submits register form.
2. Frontend calls `/api/auth/register`.
3. Backend validates and creates user.
4. Frontend redirects to login.

Login:

1. User submits login form.
2. Frontend calls `/api/auth/login`.
3. Backend returns JWT + user.
4. Frontend stores token/user.
5. Frontend redirects to role dashboard.

Protected request:

1. Frontend includes `Authorization: Bearer <token>`.
2. Backend middleware verifies JWT.
3. Controller returns protected data.

This is the current implemented integration between your frontend and backend.

## 10. Glossary (Frontend Terms)

- Component: Reusable UI unit in React (for example Navbar, FlatCard).
- Page: Route-level component in Next.js App Router.
- Layout: Shared wrapper around pages (header/footer/provider shell).
- Context: React state sharing mechanism used to provide auth state globally.
- Hook: Reusable React logic function, such as useAuth, useEffect, useState.
- Client Component: Component marked with use client; runs in browser and can use state/effects.
- Route Group: Folder grouping pattern like (auth) that organizes files without changing URL path.
- Dynamic Route: Parameterized route like properties/[id].
- API Integration: Frontend fetch calls to backend endpoints.
- Bearer Token: JWT sent in Authorization header for protected APIs.

## 11. Short Code Explanations

### A) Global auth state wiring

From app/layout.tsx:

```tsx
<AuthProvider>
   <Navbar />
   <main className="flex-grow pt-16">{children}</main>
   <Footer />
</AuthProvider>
```

Explanation:

- AuthProvider wraps the app so any child page/component can read auth state.
- Navbar and pages can call useAuth without prop drilling.

### B) API base URL configuration

From context/AuthContext.tsx:

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
```

Explanation:

- Reads backend URL from frontend env variable.
- Uses localhost default for local development.

### C) Login API call and error handling

From context/AuthContext.tsx:

```ts
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
});

if (!response.ok) {
   throw new Error(await parseApiMessage(response));
}
```

Explanation:

- Sends credentials to backend login endpoint.
- If backend returns non-2xx, frontend throws readable API error message.

### D) Session persistence in browser storage

From context/AuthContext.tsx:

```ts
localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
```

Explanation:

- Saves user and token so session survives page refresh.
- On app reload, AuthProvider restores these values and re-validates with /api/auth/me.

### E) Protected request with bearer token

From context/AuthContext.tsx:

```ts
const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
   method: "GET",
   headers: {
      Authorization: `Bearer ${tokenToUse}`,
   },
});
```

Explanation:

- Sends JWT in Authorization header.
- Backend middleware validates token before returning user profile.

### F) Role-based redirect after login

From app/(auth)/login/page.tsx:

```ts
const loggedInUser = await login({ email, password });
router.push(getDashboardPath(loggedInUser.role));
```

Explanation:

- Logs in using AuthContext.
- Redirects user to correct dashboard route by role.

### G) Admin dashboard protected fetch

From app/dashboard/admin/page.tsx:

```ts
fetch(`${API_BASE_URL}/api/admin/overview`, {
   headers: { Authorization: `Bearer ${token}` },
});
```

Explanation:

- Admin page calls protected admin API using current token.
- If token/role is invalid, backend returns unauthorized response.
