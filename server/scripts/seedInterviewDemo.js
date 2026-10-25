
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Announcement from "../models/Announcement.js";

dotenv.config({ path: "server/.env" });

const DB_NAME = "campusos";

const accounts = [
    {
        name: "Dr. Eleanor Vance",
        email: "admin@campus.edu",
        password: "Admin@1234",
        role: "ADMIN",
        department: "CSE",
        identifier: "ADM-DEMO-01",
    },
    {
        name: "Prof. Alan Turing",
        email: "faculty@campus.edu",
        password: "Faculty@1234",
        role: "FACULTY",
        department: "CSE",
        identifier: "FAC-DEMO-01",
        officeLocation: "Engineering Block, Room 402",
    },
    {
        name: "Maya Lin",
        email: "student@campus.edu",
        password: "Student@1234",
        role: "STUDENT",
        department: "CSE",
        identifier: "STU-DEMO-01",
        batch: "2024-2028",
    },
];

async function upsertUser(account) {
    const password = await bcrypt.hash(account.password, 12);

    return User.findOneAndUpdate(
        { email: account.email.toLowerCase() },
        {
            $set: {
                name: account.name,
                email: account.email.toLowerCase(),
                password,
                role: account.role,
                department: account.department,
                identifier: account.identifier,
                ...(account.officeLocation && {
                    officeLocation: account.officeLocation,
                }),
                ...(account.batch && { batch: account.batch }),
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    );
}

async function upsertCourse(data) {
    return Course.findOneAndUpdate(
        { code: data.code },
        { $set: data },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    );
}

async function run() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("MONGO_URI is missing from server/.env");
    }

    console.log(`Connecting to database: ${DB_NAME}`);

    // Explicitly selects CampusOS's own database, rather than
    // accidentally using the cluster's default database.
    await mongoose.connect(uri, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 15000,
    });

    console.log("Connected. Preparing demo accounts...");

    const users = {};

    for (const account of accounts) {
        users[account.role] = await upsertUser(account);
        console.log(`Account ready: ${account.email}`);
    }

    const admin = users.ADMIN;
    const faculty = users.FACULTY;
    const student = users.STUDENT;

    console.log("Preparing courses...");

    const course1 = await upsertCourse({
        name: "Introduction to Computer Systems",
        code: "CS101",
        description:
            "Computer architecture, operating systems, and memory fundamentals.",
        department: "CSE",
        faculty: faculty._id,
        students: [],
        status: "ACTIVE",
    });

    const course2 = await upsertCourse({
        name: "Data Structures and Algorithms",
        code: "CS201",
        description:
            "Data structures, algorithm analysis, trees, graphs, and problem solving.",
        department: "CSE",
        faculty: faculty._id,
        students: [student._id],
        status: "ACTIVE",
    });

    const course3 = await upsertCourse({
        name: "Database Management Systems",
        code: "CS301",
        description:
            "Relational databases, SQL, normalization, indexing, and transactions.",
        department: "CSE",
        faculty: faculty._id,
        students: [student._id],
        status: "ACTIVE",
    });

    console.log("Preparing assignments...");

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const assignmentData = [
        {
            title: "Lab 1: Trees and Recursion",
            description:
                "Implement tree traversals and explain the time complexity of your solution.",
            course: course2._id,
            createdBy: faculty._id,
            deadline: new Date(now + 3 * day),
            maxPoints: 100,
            status: "PUBLISHED",
            submissions: [
                {
                    student: student._id,
                    content:
                        "Completed the tree traversals and documented the complexity.",
                    fileUrl: "https://github.com/",
                    submittedAt: new Date(now - day),
                    status: "GRADED",
                    grade: 92,
                    feedback:
                        "Good work. Explain the recursive base case more clearly.",
                },
            ],
        },
        {
            title: "Project 1: Database Design",
            description:
                "Design a normalized database schema and write SQL queries for common operations.",
            course: course3._id,
            createdBy: faculty._id,
            deadline: new Date(now + 5 * day),
            maxPoints: 100,
            status: "PUBLISHED",
            submissions: [],
        },
        {
            title: "Operating Systems: Process Scheduling",
            description:
                "Compare FCFS, SJF, and Round Robin scheduling using a worked example.",
            course: course1._id,
            createdBy: faculty._id,
            deadline: new Date(now - day),
            maxPoints: 50,
            status: "PUBLISHED",
            submissions: [],
        },
    ];

    const assignments = [];

    for (const data of assignmentData) {
        const assignment = await Assignment.findOneAndUpdate(
            {
                title: data.title,
                course: data.course,
            },
            { $set: data },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        assignments.push(assignment);
        console.log(`Assignment ready: ${assignment.title}`);
    }

    console.log("Preparing announcements...");

    const notices = [
        {
            title: "CampusOS Demo: Welcome Students",
            content:
                "Welcome to CampusOS. Review your course enrollments, check upcoming deadlines, and keep your profile updated.",
            author: admin._id,
            audience: "ALL",
            priority: "IMPORTANT",
        },
        {
            title: "Assignment Submission Reminder",
            content:
                "Students should review assignment instructions and submit their work before the listed deadlines.",
            author: faculty._id,
            audience: "STUDENT",
            priority: "URGENT",
        },
        {
            title: "Faculty Coordination Meeting",
            content:
                "Faculty members should review course progress, pending submissions, and upcoming assessment schedules.",
            author: admin._id,
            audience: "FACULTY",
            priority: "NORMAL",
        },
    ];

    for (const notice of notices) {
        await Announcement.findOneAndUpdate(
            { title: notice.title },
            { $set: notice },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        console.log(`Announcement ready: ${notice.title}`);
    }

    console.log("\nVerifying demo passwords...");

    for (const account of accounts) {
        const user = await User.findOne({
            email: account.email,
        }).select("+password");

        const valid = await bcrypt.compare(
            account.password,
            user.password
        );

        if (!valid) {
            throw new Error(
                `Password verification failed for ${account.email}`
            );
        }

        console.log(`Verified: ${account.email}`);
    }

    console.log("\n=== CAMPUSOS DEMO DATA READY ===");
    console.log("Database:", DB_NAME);
    console.log("Courses:", 3);
    console.log("Assignments:", assignments.length);
    console.log("Announcements:", notices.length);
    console.log("Demo password verification: PASSED");
    console.log("No unrelated users or collections were deleted.");
}

run()
    .catch((error) => {
        console.error("\nDemo setup failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
