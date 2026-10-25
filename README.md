# CampusOS — Campus Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-gray?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-30%20Passing%20%28100%25%29-brightgreen)](#automated-test-suites)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC%20%2B%20Helmet-indigo)](#authentication--security)

CampusOS is a full-stack, enterprise-grade campus management platform built for students, faculty, and institutional administrators. It streamlines academic operations including course enrollment, assignment publishing, student submissions, evaluation and grading, targeted campus announcements, and telemetry dashboards.

---

## Overview

Educational institutions often suffer from fragmented tools for coursework, enrollment, grades, and communication. CampusOS unifies these workflows into a single system:
- **Students** can discover active courses, enroll with a single click, track upcoming/overdue tasks, turn in assignments with links and notes, and review grades with faculty feedback.
- **Faculty** can manage course curricula, inspect enrolled rosters, publish assignments, review submissions, award grades with comments, and broadcast targeted bulletins.
- **Administrators** possess full oversight to provision users, assign faculty to course modules, audit curriculum assignments, and broadcast institutional announcements.

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Node.js (v20+), Express.js 5 | Layered architecture (`routes` → `controllers` → `services` → `models`) |
| **Database** | MongoDB & Mongoose 9 | Relational references (`ref`), population, query compound indexing |
| **Authentication** | JWT (`jsonwebtoken`) & `bcryptjs` | Stateless bearer tokens, salted hashing (12 rounds), RBAC |
| **Security** | `helmet`, `cors`, `express-rate-limit` | Header hardening, CORS allowlist, login rate limiting |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Turbopack compilation, typed API integration layer |
| **Styling** | Tailwind CSS & Lucide Icons | Responsive dashboard layout, accessible modals and tables |

---

## Architecture & Request Flow

The backend follows strict separation of concerns with centralized error handling and graceful shutdown:

```
HTTP Client (Next.js / Browser)
     │  (Bearer <JWT> header)
     ▼
[Security Middleware]   ──► Helmet, CORS origin check, Express Rate Limiter
     │
     ▼
[Auth & RBAC Guards]    ──► authMiddleware (JWT verify) & authorize (Role checking)
     │
     ▼
[Input Validators]      ──► Schema & field validations (auth, course, assignment, announcement)
     │
     ▼
[Routes Layer]          ──► /api/auth, /api/courses, /api/assignments, /api/announcements, /api/dashboard
     │
     ▼
[Controllers Layer]     ──► Extracts params, delegates to services, formats HTTP response
     │
     ▼
[Services Layer]        ──► Business rules, permission checks, enrollment logic
     │
     ▼
[Data Layer (Mongoose)] ──► User, Course, Assignment, Announcement Models with indexes
     │
     ▼
[Persistence Engine]   ──► MongoDB Atlas Cluster (with automatic embedded fallback for zero-downtime local dev)
```

---

## Project Structure

```
CampusOS/
├── server/
│   ├── config/
│   │   └── db.js                       # Mongoose connection with Atlas & embedded fallback
│   ├── controllers/
│   │   ├── authController.js           # Registration, login, profile fetch
│   │   ├── courseController.js         # Course CRUD and enrollment
│   │   ├── assignmentController.js     # Assignment lifecycle & grading
│   │   ├── announcementController.js   # Campus notices & announcements
│   │   ├── userController.js           # Admin user management
│   │   └── dashboardController.js      # Aggregated metrics for dashboards
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT Bearer token verification
│   │   ├── authorize.js                # Role-based route guard
│   │   ├── errorHandler.js             # Centralized error handler
│   │   └── rateLimiter.js              # Rate limiting middleware
│   ├── models/
│   │   ├── User.js                     # User schema (Student, Faculty, Admin, Placement)
│   │   ├── Course.js                   # Course schema with indexed students and faculty refs
│   │   ├── Assignment.js               # Assignment schema with nested submissions
│   │   └── Announcement.js             # Bulletins schema with audience scoping
│   ├── routes/
│   │   ├── authRoutes.js               # /api/auth
│   │   ├── courseRoutes.js             # /api/courses
│   │   ├── assignmentRoutes.js         # /api/assignments
│   │   ├── announcementRoutes.js       # /api/announcements
│   │   ├── userRoutes.js               # /api/users
│   │   └── dashboardRoutes.js          # /api/dashboard
│   ├── services/
│   │   ├── authService.js              # Auth business logic
│   │   ├── courseService.js            # Course queries & enrollment operations
│   │   ├── assignmentService.js        # Assignment & grading logic
│   │   ├── announcementService.js      # Announcement logic
│   │   ├── userService.js              # User management logic
│   │   └── dashboardService.js         # Analytical telemetry aggregations
│   ├── scripts/
│   │   ├── seedData.js                 # Reusable demo data seeding logic
│   │   └── seed.js                     # Standalone CLI seeding script
│   ├── tests/
│   │   ├── backend.test.js             # 12 Unit tests (JWT, RBAC, validators, error handler)
│   │   └── integration.test.js         # 18 HTTP Integration tests (End-to-end API workflows)
│   ├── app.js                          # Express application configuration
│   ├── server.js                       # Server entry point with graceful shutdown
│   ├── Dockerfile                      # Production container image definition
│   └── package.json
│
├── client/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with AuthProvider
│   │   ├── page.tsx                    # Landing hero page
│   │   ├── login/                      # Sign in page with demo credentials
│   │   ├── register/                   # Student registration
│   │   ├── dashboard/                  # Student portal (enrolled courses & deadlines)
│   │   ├── courses/                    # Course catalog & self-enrollment
│   │   ├── assignments/                # Student task submission portal
│   │   ├── announcements/              # Institutional bulletin feed
│   │   ├── profile/                    # Personal account settings
│   │   ├── faculty/                    # Faculty portal (rosters, assignments, grading)
│   │   └── admin/                      # Administration control center
│   ├── components/                     # DashboardLayout, Navbar, Sidebar, Modals, StatusBadges
│   ├── context/                        # AuthContext state manager
│   ├── lib/                            # Typed API fetch client with auto 401 redirect
│   ├── services/                       # Typed client API integration services
│   ├── types/                          # TypeScript definitions
│   └── vercel.json                     # Vercel deployment configuration
│
├── render.yaml                         # Render Web Service blueprint
├── package.json                        # Root monorepo orchestration scripts
└── README.md
```

---

## Authentication & Security

1. **Password Hashing**: Passwords are never stored in plaintext; salted with 12 rounds of bcrypt.
2. **Stateless JWT**: Signed using `JWT_SECRET` containing `{ userId, role }`.
3. **Bearer Token Authorization**: Injected automatically by `client/lib/api.ts` into every request.
4. **Session Recovery & Invalidation**: 401 errors clear invalid tokens and redirect to `/login?session_expired=true`.
5. **Role-Based Access Control (RBAC)**: Case-insensitive enforcement on backend endpoints via `authorize("ADMIN")`, `authorize("FACULTY")`, etc.
6. **Rate Limiting**: Protects login endpoint from brute-force credential stuffing.

---

## Demo Accounts

Pre-seeded demonstration accounts for immediate evaluation:

| Role | Email | Password | Section Access |
|---|---|---|---|
| **Admin** | `admin@campus.edu` | `Admin@1234` | Full access (`/admin`, user provisioning, all courses) |
| **Faculty** | `faculty@campus.edu` | `Faculty@1234` | Faculty portal (`/faculty`, assigned courses, grading) |
| **Student** | `student@campus.edu` | `Student@1234` | Student portal (`/dashboard`, enrollment, submissions) |

---

## Local Setup & Quick Start

### Prerequisites
- Node.js (v20.x or higher)
- npm (v10.x or higher)

### 1. Install Dependencies
```bash
# In server
cd server && npm install

# In client
cd ../client && npm install
```

### 2. Configure Environment Files
- Ensure `server/.env` exists (see `server/.env.example`)
- Ensure `client/.env.local` exists (see `client/.env.example`)

### 3. Start Backend & Frontend
```bash
# Option A: Monorepo Root
npm run dev:server    # Terminal 1: Starts Express on http://localhost:5000
npm run dev:client    # Terminal 2: Starts Next.js on http://localhost:3000

# Option B: Run production build locally
npm run start:server  # Terminal 1
npm run build:client && npm run start:client  # Terminal 2
```

> **Note on Database**: CampusOS supports both MongoDB Atlas and zero-config local embedded mode. If connecting to MongoDB Atlas, ensure your IP is whitelisted in Atlas Network Access. In local mode (`USE_IN_MEMORY_DB=true`), CampusOS spins up an embedded in-memory MongoDB engine with pre-seeded demo records, allowing immediate, zero-friction demonstration without external dependencies.

---

## Automated Test Suites

CampusOS includes both unit test and end-to-end integration test harnesses:

```bash
# Run unit tests (12 tests)
npm test

# Run API integration tests (18 tests)
npm run test:integration

# Run entire test suite (30 tests)
npm run test:all
```

### Test Coverage Highlights:
- [x] JWT token signing, claims verification, and expiration handling
- [x] Authentication middleware & missing Bearer token rejection (401)
- [x] RBAC authorization guards & unauthorized role rejection (403)
- [x] Input validation for registration, login, courses, assignments, announcements
- [x] Centralized error handler mappings (`CastError` -> 400, `E11000 duplicate` -> 409)
- [x] Health check endpoint (`GET /api/health`)
- [x] Real HTTP registration & duplicate email rejection
- [x] Real HTTP login for Admin, Faculty, and Student demo accounts
- [x] Protected `/api/auth/me` profile retrieval
- [x] Admin course creation & Student RBAC access prevention
- [x] Student self-enrollment into active courses
- [x] Faculty assignment creation
- [x] Student coursework submission with link and content
- [x] Faculty evaluation, score entry, and qualitative feedback
- [x] Student, Faculty, and Admin telemetry dashboard endpoints

---

## Deployment Instructions

### Backend (Render / Railway / VPS / Docker)
The backend is ready to deploy via `render.yaml` or Docker:
1. Connect repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Root directory: `server`.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Configure environment variables:
   - `MONGO_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: 64+ character random string
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: Your deployed frontend URL (or `*`)
   - `NODE_ENV`: `production`

### Frontend (Vercel)
The Next.js 16 frontend is configured via `client/vercel.json`:
1. Import repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend API URL (e.g., `https://campusos-api.onrender.com/api`)
4. Click **Deploy**.

---

## Interview Walkthrough Guide

When presenting CampusOS:
1. **Introduction**: Introduce CampusOS as a full-stack campus management operating system designed to eliminate academic fragmentation between students, faculty, and administrative staff.
2. **Architecture**: Highlight the clean separation between Next.js 16 (React 19 App Router) and Express.js 5 with a modular layered pattern (`routes` → `controllers` → `services` → `models`).
3. **Security & RBAC**: Explain how stateless JWTs carry identity and role claims, and how route-level authorization guards enforce privileges at both UI and API layers.
4. **Live Demo Sequence**:
   - Log in as **Student** (`student@campus.edu` / `Student@1234`): view enrolled courses, browse course catalog, submit an assignment.
   - Log in as **Faculty** (`faculty@campus.edu` / `Faculty@1234`): view course rosters, grade the student's submission with feedback, and post an announcement.
   - Log in as **Admin** (`admin@campus.edu` / `Admin@1234`): inspect institution-wide telemetry, create a new course, assign faculty.
5. **Reliability & Resilience**: Showcase the 30 automated tests passing with 100% assertions (`npm run test:all`), graceful shutdown handling, compound database indexes, and database connection resiliency.
