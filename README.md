# Smart Inventory and Warehouse Management System

Full-stack academic project for CSE12202 (Unstructured Database Lab), focused on MongoDB-first system design, CRUD workflows, aggregation reporting, and index-driven query performance.
## 🎥 Demo Video

[![Watch Demo](https://img.shields.io/badge/▶️%20Watch%20Demo-Click%20Here-blue?style=for-the-badge)](https://drive.google.com/file/d/1xXOL-blNuD-Wq9wKdnIcJD-pjpBc_5hM/view?usp=drive_link)

## 1. Project Objective

This application simulates a real warehouse environment where teams can:
- manage suppliers and inventory records
- perform stock-in and stock-out operations
- monitor low-stock risk in real time
- analyze movement and value reports using aggregation pipelines
- operate with strict role-based authorization (worker, admin, super_admin)

The project is designed to be:
- technically correct for marking criteria
- presentation-ready for viva and PDF submission
- deployable in cloud setup (Render + Vercel + MongoDB Atlas)


### Data Modeling 
Implemented collections and relationships:
- users
- suppliers
- items
- transactions
- audit_logs
- item_requests

Modeling quality highlights:
- reference-based relations with ObjectId between items, suppliers, users, and transactions
- validation constraints in schemas (required fields, enums, defaults)
- role model and status model for lifecycle control

### CRUD Operations 
Complete CRUD is implemented for primary entities:
- items: create, read, update, delete
- suppliers: create, read, update, delete
- users: create, read, update, role/status updates, delete
- transactions: create stock-in and stock-out, list, detail, item-wise history
- item requests: create request, list requests, review status (approve/reject)

### Aggregation Queries 
Backend exposes report APIs backed by MongoDB aggregations:
- worker summary
- admin summary
- super admin summary
- low-stock report
- stock-value report
- category-distribution report
- movement-summary report
- user-role-summary report

### Indexing (5/5)
Mandatory compound index added:
- transactions: { item_id: 1, date: 1 }

Why this matters:
- accelerates item-wise history queries
- improves date-filtered transaction analytics
- supports report endpoints under larger datasets

## 3. Technology Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Zustand
- React Hook Form + Zod
- Sonner toasts

### Backend
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT authentication
- Joi validation
- Helmet, CORS, rate limiting
- Morgan logging

## 4. Architecture Overview

### Client Layer
- role-aware dashboards and guarded routes
- modular pages for worker, admin, and super admin

### API Layer
- RESTful route modules for each domain
- auth middleware and role middleware per endpoint scope
- centralized error and not-found handlers

### Data Layer
- Mongoose models with schema-level validation and indexing
- transactional stock movement records for IN and OUT flows
- audit logging for sensitive platform actions

## 5. Role-Based Access Control

### Worker
- view items/suppliers/transactions
- create stock IN/OUT transactions
- submit item requests
- track own item request status

### Admin
- all worker access
- create and update items/suppliers
- view advanced reports
- review item requests

### Super Admin
- full access
- user management
- delete-protected operations
- audit log visibility
- super-admin reports

## 6. API Endpoint Reference

### Health
- GET /api/health

### Auth
- POST /api/auth/login
- GET /api/auth/me

### Users (super_admin)
- POST /api/users
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- PATCH /api/users/:id/status
- PATCH /api/users/:id/role
- DELETE /api/users/:id

### Items
- GET /api/items
- GET /api/items/:id
- POST /api/items (admin, super_admin)
- PUT /api/items/:id (admin, super_admin)
- DELETE /api/items/:id (super_admin)

### Suppliers
- GET /api/suppliers
- GET /api/suppliers/:id
- POST /api/suppliers (admin, super_admin)
- PUT /api/suppliers/:id (admin, super_admin)
- DELETE /api/suppliers/:id (super_admin)

### Transactions
- POST /api/transactions/in
- POST /api/transactions/out
- GET /api/transactions
- GET /api/transactions/item/:itemId
- GET /api/transactions/:id

### Reports
- GET /api/reports/worker-summary
- GET /api/reports/admin-summary
- GET /api/reports/super-admin-summary
- GET /api/reports/low-stock
- GET /api/reports/stock-value
- GET /api/reports/category-distribution
- GET /api/reports/movement-summary
- GET /api/reports/user-role-summary

### Item Requests
- POST /api/item-requests
- GET /api/item-requests
- PATCH /api/item-requests/:id/status (admin, super_admin)

### Audit Logs
- GET /api/audit-logs (super_admin)

## 7. Database Design Snapshot

### users
Core identity and role assignment.

### suppliers
Supplier master data (id, contacts, location, status).

### items
Inventory entity linked to supplier with stock, pricing, and reorder controls.

### transactions
Stock movement ledger linked to item, supplier, and performer.

### audit_logs
Action trail for administrative traceability.

### item_requests
Worker-driven request workflow with approval states.

## 8. Seed Dataset (Current)

Seed script file:
- backend/src/seed/seed.js

Generated records:
- 5 users
- 12 suppliers
- 24 items
- 96 transactions (mixed IN and OUT)
- 6 audit logs

Command:

```bash
cd backend
npm run seed
```

## 9. Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend URL:
- http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:
- http://localhost:5173

## 10. Environment Variables

### backend/.env

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/smart_inventory
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=1d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

### frontend/.env (for deployment)

```env
VITE_API_BASE_URL=https://your-render-backend-url/api
```

## 11. Deployment Plan (Render + Vercel)

### Backend on Render
1. Create Web Service from backend folder.
2. Build command: npm install
3. Start command: npm start
4. Add env vars: PORT, NODE_ENV, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN
5. Verify health endpoint: /api/health

### Frontend on Vercel
1. Import frontend project.
2. Framework preset: Vite.
3. Add VITE_API_BASE_URL pointing to Render backend /api.
4. Deploy and verify login and dashboard API calls.

## 12. Security Implementations

- JWT-based authentication
- password hashing with bcrypt
- role authorization middleware
- request payload sanitization middleware
- helmet hardening headers
- rate limiting
- centralized error handling

## 13. Viva and Report Checklist

### Screenshots to Include
- login page
- worker dashboard
- admin dashboard
- super admin dashboard
- items CRUD page
- suppliers CRUD page
- transactions page
- reports page with charts
- item requests workflow pages
- user management page
- audit log page
- MongoDB collections and index proof

### 5-Minute Viva Flow
1. state problem and scope
2. explain MongoDB schema and references
3. demonstrate role-based access differences
4. show CRUD operations and transaction flow
5. open report APIs and chart views
6. highlight mandatory compound index and performance reason

## 14. Troubleshooting

### Atlas authentication failed
- reset Atlas database user password
- ensure authSource=admin in URI
- whitelist IP in Atlas Network Access

### Seed command fails
- use npm run seed (not npm run seed.js)
- verify MONGO_URI and Atlas access

### Frontend cannot reach backend
- set VITE_API_BASE_URL correctly in Vercel
- verify backend CORS and Render URL health

## 15. Academic Note

This repository is prepared for educational submission under CSE12202 and demonstrates practical NoSQL system design with production-oriented engineering practices.
