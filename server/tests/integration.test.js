import assert from "node:assert";
import http from "node:http";
import dotenv from "dotenv";
import app from "../app.js";
import connectToMongoDB, { disconnectFromMongoDB } from "../config/db.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Announcement from "../models/Announcement.js";

dotenv.config();

process.env.PORT = "5099";
process.env.JWT_SECRET = "integration_test_secret_key_987654321";

console.log("=== RUNNING CAMPUSOS INTEGRATION TEST SUITE ===");

let passed = 0;
let total = 0;

const test = async (name, fn) => {
    total++;
    try {
        await fn();
        console.log(`[PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`[FAIL] ${name}:`, err.message);
    }
};

const runAllTests = async () => {
    let server = null;
    let baseUrl = "";

    try {
        console.log("Initializing database for integration suite...");
        await connectToMongoDB();

        await new Promise((resolve) => {
            server = app.listen(5099, () => {
                baseUrl = "http://localhost:5099";
                console.log(`Test server running at ${baseUrl}`);
                resolve();
            });
        });

        const request = async (path, options = {}) => {
            const res = await fetch(`${baseUrl}${path}`, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
            });
            const data = await res.json().catch(() => ({}));
            return { status: res.status, data };
        };

        // 1. Health check
        await test("API Health: /api/health should return 200 OK", async () => {
            const res = await request("/api/health");
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.data.status, "ok");
        });

        // 2. Auth: Registration
        let testUserEmail = `test_${Date.now()}@campus.edu`;
        await test("Auth: POST /api/auth/register should create new student", async () => {
            const res = await request("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: "Integration Test Student",
                    email: testUserEmail,
                    password: "password123",
                    role: "STUDENT",
                    department: "CSE",
                    identifier: "STU-INT-01"
                })
            });
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.data.success, true);
            assert.strictEqual(res.data.user.email, testUserEmail.toLowerCase());
        });

        // 3. Auth: Registration duplicate check
        await test("Auth: POST /api/auth/register should reject duplicate email with 409", async () => {
            const res = await request("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: "Duplicate Student",
                    email: testUserEmail,
                    password: "password123"
                })
            });
            assert.strictEqual(res.status, 409);
            assert.strictEqual(res.data.success, false);
        });

        // 4. Auth: Login with valid credentials
        let studentToken = "";
        let studentUser = null;
        await test("Auth: POST /api/auth/login should authenticate student and return token", async () => {
            const res = await request("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: "student@campus.edu",
                    password: "Student@1234"
                })
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.data.success, true);
            assert(typeof res.data.token === "string");
            assert.strictEqual(res.data.user.role, "STUDENT");
            studentToken = res.data.token;
            studentUser = res.data.user;
        });

        // 5. Auth: Login with invalid password
        await test("Auth: POST /api/auth/login should reject bad password with 401", async () => {
            const res = await request("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: "student@campus.edu",
                    password: "wrong_password"
                })
            });
            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.data.success, false);
        });

        // 6. Auth: Login as Faculty and Admin
        let facultyToken = "";
        let facultyUser = null;
        await test("Auth: Login as Faculty demo user", async () => {
            const res = await request("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: "faculty@campus.edu",
                    password: "Faculty@1234"
                })
            });
            assert.strictEqual(res.status, 200);
            facultyToken = res.data.token;
            facultyUser = res.data.user;
        });

        let adminToken = "";
        await test("Auth: Login as Admin demo user", async () => {
            const res = await request("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: "admin@campus.edu",
                    password: "Admin@1234"
                })
            });
            assert.strictEqual(res.status, 200);
            adminToken = res.data.token;
        });

        // 7. Auth: Protected /api/auth/me
        await test("Auth: GET /api/auth/me should return current user profile", async () => {
            const res = await request("/api/auth/me", {
                headers: { Authorization: `Bearer ${studentToken}` }
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.data.success, true);
            assert.strictEqual(res.data.user.email, "student@campus.edu");
        });

        await test("Auth: GET /api/auth/me without token should return 401", async () => {
            const res = await request("/api/auth/me");
            assert.strictEqual(res.status, 401);
            assert.strictEqual(res.data.success, false);
        });

        // 8. Courses: RBAC and Catalog
        let createdCourseId = "";
        await test("Courses: Admin can create new course", async () => {
            const code = `CS_INT_${Date.now()}`;
            const res = await request("/api/courses", {
                method: "POST",
                headers: { Authorization: `Bearer ${adminToken}` },
                body: JSON.stringify({
                    name: "Automated Software Verification",
                    code: code,
                    description: "End-to-end integration and smoke testing protocols.",
                    department: "CSE",
                    faculty: facultyUser._id || facultyUser.id
                })
            });
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.data.success, true);
            createdCourseId = res.data.course._id;
        });

        await test("Courses: Student cannot create course (403 Forbidden)", async () => {
            const res = await request("/api/courses", {
                method: "POST",
                headers: { Authorization: `Bearer ${studentToken}` },
                body: JSON.stringify({
                    name: "Unauthorized Course",
                    code: "UNAUTH_01"
                })
            });
            assert.strictEqual(res.status, 403);
        });

        // 9. Course Enrollment
        await test("Courses: Student can enroll in active course", async () => {
            const res = await request(`/api/courses/${createdCourseId}/enroll`, {
                method: "POST",
                headers: { Authorization: `Bearer ${studentToken}` }
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.data.success, true);
        });

        // 10. Assignments: Faculty create assignment
        let createdAssignmentId = "";
        await test("Assignments: Faculty can create assignment in course", async () => {
            const res = await request("/api/assignments", {
                method: "POST",
                headers: { Authorization: `Bearer ${facultyToken}` },
                body: JSON.stringify({
                    title: "Integration Test Assignment",
                    description: "Submit test coverage reports.",
                    course: createdCourseId,
                    deadline: new Date(Date.now() + 86400000).toISOString(),
                    maxPoints: 100
                })
            });
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.data.success, true);
            createdAssignmentId = res.data.assignment._id;
        });

        // 11. Assignments: Student submit work
        await test("Assignments: Enrolled student can submit assignment", async () => {
            const res = await request(`/api/assignments/${createdAssignmentId}/submit`, {
                method: "POST",
                headers: { Authorization: `Bearer ${studentToken}` },
                body: JSON.stringify({
                    content: "All test suites passing with 100% assertions.",
                    fileUrl: "https://github.com/campusos/deliverable"
                })
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.data.success, true);
        });

        // 12. Assignments: Faculty grade submission
        await test("Assignments: Faculty can grade student submission", async () => {
            // Fetch assignment to get submission ID
            const getRes = await request(`/api/assignments/${createdAssignmentId}`, {
                headers: { Authorization: `Bearer ${facultyToken}` }
            });
            const subId = getRes.data.assignment.submissions[0]._id;

            const gradeRes = await request(`/api/assignments/${createdAssignmentId}/submissions/${subId}/grade`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${facultyToken}` },
                body: JSON.stringify({
                    grade: 98,
                    feedback: "Outstanding work on test harness."
                })
            });
            assert.strictEqual(gradeRes.status, 200);
            assert.strictEqual(gradeRes.data.success, true);
        });

        // 13. Dashboards
        await test("Dashboard: Student dashboard returns enrolled courses and metrics", async () => {
            const res = await request("/api/dashboard/student", {
                headers: { Authorization: `Bearer ${studentToken}` }
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.data.success, true);
            assert(res.data.dashboard.stats.totalEnrolledCourses >= 1);
        });

        await test("Dashboard: Faculty dashboard returns assigned courses and submissions", async () => {
            const res = await request("/api/dashboard/faculty", {
                headers: { Authorization: `Bearer ${facultyToken}` }
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.data.success, true);
            assert(res.data.dashboard.stats.totalCourses >= 1);
        });

        await test("Dashboard: Admin dashboard returns institution-wide aggregates", async () => {
            const res = await request("/api/dashboard/admin", {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.data.success, true);
            assert(res.data.dashboard.stats.totalUsers >= 3);
            assert(res.data.dashboard.stats.totalCourses >= 1);
        });

        console.log(`\n========================================`);
        console.log(`INTEGRATION TEST SUMMARY: ${passed} / ${total} passed.`);
        console.log(`========================================\n`);

    } finally {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
            console.log("Test HTTP server closed.");
        }
        await disconnectFromMongoDB();
    }

    if (passed !== total) {
        process.exit(1);
    } else {
        process.exit(0);
    }
};

runAllTests();

