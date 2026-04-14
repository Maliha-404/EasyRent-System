# EasyRent Demo Users (Backend Seeded)

This project now uses real backend authentication and backend-provided dashboard/property data. The frontend no longer depends on mock data.

## Default Credentials

Run backend seed scripts first, then use the following accounts at /login.

Password for all users: 1234

### Admin
- Email: admin@easyrent.com

### Tenants
- Email: tenant1@easyrent.com
- Email: tenant2@easyrent.com
- Email: tenant3@easyrent.com

### Land Owners
- Email: landowner1@easyrent.com
- Email: landowner2@easyrent.com
- Email: landowner3@easyrent.com

### Flat Owners
- Email: flatowner1@easyrent.com
- Email: flatowner2@easyrent.com
- Email: flatowner3@easyrent.com

## Auth Flow Summary

1. Login calls backend endpoint POST /api/auth/login.
2. Backend returns JWT token plus user object.
3. Frontend stores token and user in localStorage.
4. Protected pages verify user role and token before rendering dashboard content.

## Important

- Some owner accounts are seeded with Pending status to demonstrate admin approval workflows.
- Public pages and dashboards fetch live data from backend routes:
	- /api/public/home
	- /api/public/properties
	- /api/public/properties/:id
	- /api/dashboard/owner
	- /api/dashboard/tenant
