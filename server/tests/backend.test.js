import assert from "node:assert";
import jwt from "jsonwebtoken";
import generateToken from "../utils/jwt.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import errorHandler from "../middleware/errorHandler.js";
import { validateRegister, validateLogin } from "../validators/authValidators.js";
import { validateCourseCreate, validateCourseUpdate } from "../validators/courseValidators.js";
import { validateAssignmentCreate } from "../validators/assignmentValidators.js";
import { validateAnnouncementCreate } from "../validators/announcementValidators.js";

process.env.JWT_SECRET = "test_super_secret_key_1234567890";
process.env.JWT_EXPIRES_IN = "1d";

console.log("=== RUNNING CAMPUSOS BACKEND TEST SUITE ===");

let passed = 0;
let total = 0;

const runTest = (name, fn) => {
    total++;
    try {
        fn();
        console.log(`[PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`[FAIL] ${name}:`, err.message);
    }
};

// 1. JWT Generation and Verification
runTest("JWT: should generate valid token with user claims", () => {
    const dummyUser = { _id: "661234567890abcdef123456", role: "FACULTY" };
    const token = generateToken(dummyUser);
    assert(typeof token === "string" && token.length > 20);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.userId, "661234567890abcdef123456");
    assert.strictEqual(decoded.role, "FACULTY");
});

// 2. Auth Middleware
runTest("AuthMiddleware: should reject request without Authorization header", () => {
    let statusCode = null;
    let jsonBody = null;
    let nextCalled = false;

    const req = { headers: {} };
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            jsonBody = data;
            return this;
        }
    };
    const next = () => { nextCalled = true; };

    authenticate(req, res, next);
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(jsonBody.success, false);
    assert.strictEqual(nextCalled, false);
});

runTest("AuthMiddleware: should accept valid Bearer token", () => {
    const dummyUser = { _id: "661234567890abcdef123456", role: "STUDENT" };
    const token = generateToken(dummyUser);

    let nextCalled = false;
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = () => { nextCalled = true; };

    authenticate(req, res, next);
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.userId, dummyUser._id);
    assert.strictEqual(req.user.role, "STUDENT");
});

// 3. Authorize Middleware (Role-Based Access Control)
runTest("Authorize: should allow authorized role (case-insensitive)", () => {
    let nextCalled = false;
    const req = { user: { role: "ADMIN" } };
    const res = {};
    const next = () => { nextCalled = true; };

    const middleware = authorize("admin");
    middleware(req, res, next);
    assert.strictEqual(nextCalled, true);
});

runTest("Authorize: should deny unauthorized role with 403 Forbidden", () => {
    let statusCode = null;
    let jsonBody = null;
    let nextCalled = false;

    const req = { user: { role: "STUDENT" } };
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            jsonBody = data;
            return this;
        }
    };
    const next = () => { nextCalled = true; };

    const middleware = authorize("FACULTY", "ADMIN");
    middleware(req, res, next);
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonBody.success, false);
    assert.strictEqual(nextCalled, false);
});

// 4. Input Validators
runTest("Validator: validateRegister should reject invalid email and short password", () => {
    let statusCode = null;
    let nextCalled = false;

    const req = {
        body: {
            name: "John Doe",
            email: "not-an-email",
            password: "123"
        }
    };
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json() { return this; }
    };
    const next = () => { nextCalled = true; };

    validateRegister(req, res, next);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(nextCalled, false);
});

runTest("Validator: validateRegister should pass with valid data", () => {
    let nextCalled = false;
    const req = {
        body: {
            name: "John Doe",
            email: "john@campus.edu",
            password: "securePassword123"
        }
    };
    const res = {};
    const next = () => { nextCalled = true; };

    validateRegister(req, res, next);
    assert.strictEqual(nextCalled, true);
});

runTest("Validator: validateCourseCreate should require name and code", () => {
    let statusCode = null;
    const req = { body: { name: "Web Dev" } }; // Missing code
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json() { return this; }
    };
    const next = () => {};

    validateCourseCreate(req, res, next);
    assert.strictEqual(statusCode, 400);
});

runTest("Validator: validateAssignmentCreate should require title, course, and deadline", () => {
    let statusCode = null;
    const req = {
        body: {
            title: "Project 1",
            course: "661234567890abcdef123456",
            deadline: "invalid-date"
        }
    };
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json() { return this; }
    };
    const next = () => {};

    validateAssignmentCreate(req, res, next);
    assert.strictEqual(statusCode, 400);
});

runTest("Validator: validateAnnouncementCreate should validate audience enum", () => {
    let statusCode = null;
    const req = {
        body: {
            title: "Hackathon 2026",
            content: "Registration open",
            audience: "INVALID_AUDIENCE"
        }
    };
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json() { return this; }
    };
    const next = () => {};

    validateAnnouncementCreate(req, res, next);
    assert.strictEqual(statusCode, 400);
});

// 5. Centralized Error Handler
runTest("ErrorHandler: should map CastError to 400 Bad Request", () => {
    let statusCode = null;
    let jsonBody = null;

    const castError = new Error("Cast to ObjectId failed");
    castError.name = "CastError";
    castError.path = "_id";

    const req = {};
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            jsonBody = data;
            return this;
        }
    };

    errorHandler(castError, req, res, () => {});
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonBody.success, false);
    assert(jsonBody.message.includes("Invalid ID format"));
});

runTest("ErrorHandler: should map duplicate key error (11000) to 409 Conflict", () => {
    let statusCode = null;
    let jsonBody = null;

    const dupError = new Error("E11000 duplicate key error");
    dupError.code = 11000;
    dupError.keyValue = { email: "test@example.com" };

    const req = {};
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            jsonBody = data;
            return this;
        }
    };

    errorHandler(dupError, req, res, () => {});
    assert.strictEqual(statusCode, 409);
    assert.strictEqual(jsonBody.success, false);
    assert(jsonBody.message.includes("email already exists"));
});

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
console.log(`========================================\n`);

if (passed !== total) {
    process.exit(1);
} else {
    process.exit(0);
}
