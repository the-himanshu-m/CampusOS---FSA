# CampusOS — Campus Management Platform

CampusOS is a full-stack campus management platform built for students, faculty, and institutional administrators. It streamlines academic operations including course enrollment, assignment publishing, student submissions, evaluation and grading, targeted campus announcements, and telemetry dashboards.

---

## Overview

Educational institutions often suffer from fragmented tools for coursework, enrollment, grades, and communication. CampusOS unifies these workflows into a single system:
- **Students** can discover active courses, enroll with a single click, track upcoming/overdue tasks, turn in assignments with links and notes, and review grades with faculty feedback.
- **Faculty** can manage course curricula, inspect enrolled rosters, publish assignments, review submissions, award grades with comments, and broadcast targeted bulletins.
- **Administrators** possess full oversight to provision users, assign faculty to course modules, audit curriculum assignments, and broadcast institutional announcements.

---

## Features

### Authentication & Security
- Secure registration and login with bcryptjs password hashing (12 salt rounds).
- Stateless JWT authentication via `Bearer` token authorization headers.
- Granular Role-Based Access Control (RBAC) supporting `STUDENT`, `FACULTY`, and `ADMIN`.
- Rate limiting on authentication endpoints to defend against brute-force attacks.
- Centralized error handling preventing sensitive stack traces from leaking in production.
- Sanitized security headers via Helmet and CORS origin whitelist.

### Course Management
- Create, update, archive, and delete course modules with department codes.
- Faculty assignment to courses by administrators.
- Student self-service course catalog enrollment and dropping.
- Detailed syllabus and student roster views.

### Assignments & Grading
- Faculty assignment creation with deadline enforcement, point weights, and rubrics.
- Scoped viewing: students only see assignments for courses in which they are enrolled.
- Submission portal: students turn in work with text summaries and artifact/repo links.
- Automatic late submission tagging if turned in after deadline.
- In-place grading interface for faculty: score entry and qualitative feedback.

### Campus Bulletins & Announcements
- Targeted audience distribution: `ALL`, `STUDENT`, or `FACULTY`.
- Priority flags: `URGENT`, `IMPORTANT`, `NORMAL`.
- Real-time bulletin feeds on student and faculty workspaces.

### Role-Tailored Dashboards
- **Student Dashboard**: Enrolled course count, upcoming tasks, overdue task alerts, completed tasks, and urgent campus bulletins.
- **Faculty Dashboard**: Taught courses, total students across sections, active assignments, pending grading count, and departmental bulletins.
- **Admin Control Center**: Telemetry metrics (total users, students, faculty, courses, assignments, announcements), recent registrations, and course registry.

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Node.js (v20+), Express.js 5 | Modular layered architecture (`routes` → `controllers` → `services` → `models`) |
| **Database** | MongoDB & Mongoose | Relational references (`ref`), population, indexing |
| **Authentication** | JWT (`jsonwebtoken`) & `bcryptjs` | Stateless bearer tokens, salted hashing |
| **Security** | `helmet`, `cors`, `express-rate-limit` | Header hardening, CORS whitelisting, IP rate limiting |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Fully responsive, modern component architecture |
| **Styling** | Tailwind CSS & Lucide Icons | Clean, responsive dashboard layout with accessible forms |

---

## Architecture

The backend follows strict separation of concerns:

```
HTTP Request
     │
     ▼
[Middleware Layer]  ──► (CORS, Helmet, RateLimiter, AuthJWT, AuthorizeRole, RequestValidators)
     │
     ▼
[Routes Layer]      ──► Maps HTTP methods & endpoints to controller functions
     │
     ▼
[Controllers Layer] ──► Extracts parameters, invokes service, shapes HTTP responses
     │
     ▼
[Services Layer]    ──► Core business logic, access rules, validation checks
     │
     ▼
[Mongoose Models]   ──► Schema definitions, validation rules, MongoDB persistence
     │
     ▼
[Error Handler]     ──► Centralized JSON response with proper HTTP status codes
```

---

## Project Structure

```
CampusOS/
├── server/
│   ├── config/
│   │   └── db.js                       # Mongoose connection logic
│   ├── controllers/
│   │   ├── authController.js           # Registration, login, profile fetch
│   │   ├── courseController.js         # Course CRUD and enrollment
│   │   ├── assignmentController.js     # Assignment lifecycle & grading
│   │   ├── announcementController.js   # Campus notices & announcements
│   │   ├── userController.js           # Admin user management
│   │   └── dashboardController.js      # Aggregated metrics for dashboards
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT Bearer token verification
│   │   ├── authorize.js                # Role-based route guard (case-insensitive)
│   │   ├── errorHandler.js             # Centralized error handler
│   │   └── rateLimiter.js              # Rate limiting middleware
│   ├── models/
│   │   ├── User.js                     # User schema (Student, Faculty, Admin)
│   │   ├── Course.js                   # Course schema with faculty/student refs
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
│   │   ├── courseService.js            # Course queries & operations
│   │   ├── assignmentService.js        # Assignment & grading logic
│   │   ├── announcementService.js      # Announcement logic
│   │   ├── userService.js              # User management logic
│   │   └── dashboardService.js         # Analytical telemetry aggregations
│   ├── utils/
│   │   └── jwt.js                      # JWT token generation
│   ├── validators/
│   │   ├── authValidators.js           # Auth payload validation
│   │   ├── courseValidators.js         # Course creation/update validation
│   │   ├── assignmentValidators.js     # Assignment & grading validation
│   │   ├── announcementValidators.js   # Announcement validation
│   │   └── userValidators.js           # User management validation
│   ├── scripts/
│   │   └── seed.js                     # Demo data population script
│   ├── tests/
│   │   └── backend.test.js             # Automated unit & integration tests
│   ├── .env.example
│   ├── package.json
│   ├── app.js                          # Express application assembly
│   └── server.js                       # Server entry point
│
├── client/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with AuthProvider
│   │   ├── page.tsx                    # CampusOS landing page
│   │   ├── login/                      # Sign in page with demo autofill
│   │   ├── register/                   # Student/Faculty registration
│   │   ├── dashboard/                  # Student dashboard
│   │   ├── courses/                    # Course catalog & enrollment
│   │   │   └── [id]/                   # Course detail & syllabus
│   │   ├── assignments/                # Student tasks & submissions
│   │   │   └── [id]/                   # Task submission & grade review
│   │   ├── announcements/              # Campus bulletins board
│   │   ├── profile/                    # Personal profile & credentials
│   │   ├── faculty/                    # Faculty workspace
│   │   │   ├── courses/                # Assigned courses & rosters
│   │   │   ├── assignments/            # Assignment creator & grading
│   │   │   └── announcements/          # Faculty notice publisher
│   │   └── admin/                      # Administration center
│   │       ├── users/                  # User management & provisioning
│   │       ├── courses/                # Course directory & faculty assignment
│   │       ├── assignments/            # System assignment oversight
│   │       └── announcements/          # Institutional bulletin manager
│   ├── components/                     # Navbar, Sidebar, Modals, StatusBadges, EmptyStates
│   ├── context/                        # React AuthContext
│   ├── hooks/                          # Custom useAuth hook
│   ├── lib/                            # Centralized api.ts fetch client
│   ├── services/                       # Typed client API integration services
│   ├── types/                          # TypeScript domain interfaces
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── .gitignore
├── package.json                        # Root monorepo orchestration scripts
└── README.md
```

---

## Authentication

Authentication is token-based using JSON Web Tokens:
1. User provides `email` and `password` to `POST /api/auth/login`.
2. Password is verified against the stored bcrypt hash.
3. Express generates a signed JWT payload containing `{ userId, role }` with configurable expiry (`JWT_EXPIRES_IN`).
4. Client stores the token securely in `localStorage` and injects `Authorization: Bearer <token>` on all requests via the centralized API client (`client/lib/api.ts`).
5. `authMiddleware.js` verifies the token on incoming requests and attaches `req.user` to the request object.
6. When token expires, API client detects `401 Unauthorized` and cleanly redirects the user to `/login`.

---

## Roles & Permissions

| Feature / Action | Student | Faculty | Admin |
|---|---|---|---|
| Register / Login | Yes | Yes | Yes |
| View Student Dashboard | Yes | No | No |
| View Faculty Dashboard | No | Yes | Yes |
| View Admin Control Center | No | No | Yes |
| Browse Course Catalog | Yes | Yes | Yes |
| Enroll / Drop Courses | Yes | No | Yes (assign) |
| Create / Delete Courses | No | No | Yes |
| Assign Faculty to Course | No | No | Yes |
| Create Assignments | No | Yes (assigned course) | Yes |
| Turn in Work (Submit) | Yes | No | No |
| Grade Submissions & Give Feedback | No | Yes (course instructor) | Yes |
| Post Announcements | No | Yes | Yes |
| Manage User Accounts | No | No | Yes |

---

## API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create account (`name`, `email`, `password`, `department`, `role`, `identifier`)
- `POST /api/auth/login` — Sign in (Rate-limited, returns token & user profile)
- `GET /api/auth/me` — Retrieve authenticated user profile (`Bearer <token>`)

### Courses (`/api/courses`)
- `GET /api/courses` — List courses (Scoped: Student sees enrolled/catalog, Faculty sees assigned, Admin sees all)
- `GET /api/courses/:id` — Retrieve course syllabus, instructor, and student roster
- `POST /api/courses` — Create new course (`Admin` only)
- `PATCH /api/courses/:id` — Update course details (`Admin` or assigned `Faculty`)
- `DELETE /api/courses/:id` — Delete course (`Admin` only)
- `POST /api/courses/:id/enroll` — Enroll student in course
- `POST /api/courses/:id/unenroll` — Drop course enrollment

### Assignments (`/api/assignments`)
- `GET /api/assignments` — List assignments (Scoped by user's courses)
- `GET /api/assignments/:id` — Get assignment details & submission status
- `POST /api/assignments` — Create assignment (`Faculty` of course, or `Admin`)
- `PATCH /api/assignments/:id` — Update assignment details
- `DELETE /api/assignments/:id` — Delete assignment
- `POST /api/assignments/:id/submit` — Submit work (`Student` only: `content`, `fileUrl`)
- `PATCH /api/assignments/:id/submissions/:submissionId/grade` — Grade submission (`grade`, `feedback`)

### Announcements (`/api/announcements`)
- `GET /api/announcements` — List announcements (Filtered by user audience)
- `GET /api/announcements/:id` — Get single notice
- `POST /api/announcements` — Create announcement (`Faculty` or `Admin`)
- `PATCH /api/announcements/:id` — Update announcement (`Author` or `Admin`)
- `DELETE /api/announcements/:id` — Delete announcement (`Author` or `Admin`)

### User Management (`/api/users`)
- `GET /api/users` — List directory users with filters (`Admin` only)
- `POST /api/users` — Provision new user account (`Admin` only)
- `GET /api/users/:id` — Get user profile (`Self` or `Admin`)
- `PATCH /api/users/:id` — Update profile or privileges (`Self` or `Admin`)
- `DELETE /api/users/:id` — Remove user account (`Admin` only)

### Telemetry Dashboards (`/api/dashboard`)
- `GET /api/dashboard/student` — Aggregated metrics, enrolled subjects, tasks, bulletins (`Student` only)
- `GET /api/dashboard/faculty` — Taught subjects, student count, pending grading count (`Faculty` only)
- `GET /api/dashboard/admin` — Global platform metrics, recent registrations, course directory (`Admin` only)

---

## Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/campusos?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_change_in_production_123456789
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Local Setup

### Prerequisites
- Node.js (v20.x or higher)
- npm (v10.x or higher)
- MongoDB instance (MongoDB Atlas cluster or local MongoDB)

### 1. Clone the repository
```bash
git clone <repository-url>
cd CampusOS
```

### 2. Configure Environment Files
- Copy `server/.env.example` to `server/.env` and update `MONGO_URI` and `JWT_SECRET`.
- Copy `client/.env.example` to `client/.env.local`.

---

## Database Setup

### Whitelisting IP on MongoDB Atlas
If using MongoDB Atlas:
1. Open the [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under Security.
3. Click **Add IP Address** and add `0.0.0.0/0` (Allow Access from Anywhere) or your current IP.
4. Paste the connection string into `server/.env` under `MONGO_URI`.

### Seeding Demo Data
To populate the database with demonstration accounts, courses, assignments, and bulletins:
```bash
npm run seed
```
This generates:
- **Admin**: `admin@campus.edu` / `Admin@1234`
- **Faculty**: `faculty@campus.edu` / `Faculty@1234`
- **Student**: `student@campus.edu` / `Student@1234`

---

## Running Backend

```bash
# From root:
npm run dev:server

# Or inside server/:
cd server
npm run dev
```
The Express server runs on `http://localhost:5000`.

---

## Running Frontend

```bash
# From root:
npm run dev:client

# Or inside client/:
cd client
npm run dev
```
The Next.js frontend runs on `http://localhost:3000`.

---

## Testing

Run the automated backend test suite:
```bash
npm test
```
The test suite covers:
- JWT signing and payload claim decoding
- Authorization Bearer verification & header validation
- Role-based access control (case-insensitive checks & 403 Forbidden enforcement)
- Request body validation for registration, login, courses, assignments, and announcements
- Centralized error handler mappings (`CastError` -> 400, `duplicate key` -> 409, `JWT error` -> 401)

---

## Deployment

### Backend Deployment (Render, Railway, or VPS)
1. Push repository to GitHub.
2. Create a Web Service pointing to the `server/` root.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Configure environment variables in the host dashboard:
   - `PORT=5000` (or host-assigned)
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `CLIENT_URL=https://your-frontend-domain.vercel.app`
   - `NODE_ENV=production`

### Frontend Deployment (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api`
4. Deploy.

---

## Future Improvements
- WebSockets / Server-Sent Events (SSE) for real-time notification toasts.
- S3 / Cloudinary integration for multi-file PDF assignment uploads.
- Calendar integration (iCal / Google Calendar sync) for assignment deadlines.
- Attendance tracking module for lecture halls.
#   C a m p u s O S - - - F S A  
 #   C a m p u s O S - - - F S A  
 