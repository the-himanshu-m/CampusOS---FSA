import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectToMongoDB from "../config/db.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Announcement from "../models/Announcement.js";

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log("Connecting to database for seeding...");
        await connectToMongoDB();

        console.log("Clearing existing sample records...");
        await Promise.all([
            User.deleteMany({ email: { $in: ["admin@campus.edu", "faculty@campus.edu", "student@campus.edu"] } }),
            Course.deleteMany({ code: { $in: ["CS101", "CS201", "CS301"] } }),
            Announcement.deleteMany({ title: { $regex: /CampusOS|Welcome to Spring|Mid-Semester/i } })
        ]);

        console.log("Seeding Demo Users...");
        const adminPassword = await bcrypt.hash("Admin@1234", 12);
        const facultyPassword = await bcrypt.hash("Faculty@1234", 12);
        const studentPassword = await bcrypt.hash("Student@1234", 12);

        const admin = await User.create({
            name: "Dr. Eleanor Vance",
            email: "admin@campus.edu",
            password: adminPassword,
            role: "ADMIN",
            department: "CSE",
            identifier: "ADM-2026-01",
            phone: "+1 (555) 019-2831",
            bio: "Dean of Academic Systems & Information Technologies"
        });

        const faculty = await User.create({
            name: "Prof. Alan Turing",
            email: "faculty@campus.edu",
            password: facultyPassword,
            role: "FACULTY",
            department: "CSE",
            identifier: "FAC-1002",
            officeLocation: "Turing Hall, Suite 402",
            phone: "+1 (555) 019-8834",
            bio: "Professor of Theoretical Computer Science and Distributed Algorithms"
        });

        const student = await User.create({
            name: "Maya Lin",
            email: "student@campus.edu",
            password: studentPassword,
            role: "STUDENT",
            department: "CSE",
            identifier: "STU-2024-890",
            batch: "2024-2028",
            phone: "+1 (555) 019-9921",
            bio: "Undergraduate Computer Science major passionate about full-stack systems"
        });

        console.log("Seeding Courses...");
        const course1 = await Course.create({
            name: "Introduction to Computer Systems",
            code: "CS101",
            description: "Fundamental computer architecture, memory models, and assembly programming concepts.",
            department: "CSE",
            faculty: faculty._id,
            students: [],
            status: "ACTIVE"
        });

        const course2 = await Course.create({
            name: "Data Structures & Algorithms",
            code: "CS201",
            description: "Abstract data types, amortized algorithm analysis, graph traversals, and dynamic programming.",
            department: "CSE",
            faculty: faculty._id,
            students: [student._id],
            status: "ACTIVE"
        });

        const course3 = await Course.create({
            name: "Database Management Systems",
            code: "CS301",
            description: "Relational algebra, SQL, normalization theory, indexing, query optimization, and ACID properties.",
            department: "CSE",
            faculty: faculty._id,
            students: [student._id],
            status: "ACTIVE"
        });

        console.log("Seeding Assignments...");
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000 * 3);
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 2);

        await Assignment.create({
            title: "Lab 1: Recursion & Binary Search Trees",
            description: "Implement balanced AVL and BST tree traversal methods with O(log n) search proofs.",
            course: course2._id,
            createdBy: faculty._id,
            deadline: yesterday,
            maxPoints: 100,
            status: "PUBLISHED",
            submissions: [
                {
                    student: student._id,
                    content: "Completed all tree rotational functions with test harness passing 100% test cases.",
                    fileUrl: "https://github.com/campusos-student/bst-lab",
                    submittedAt: yesterday,
                    status: "GRADED",
                    grade: 95,
                    feedback: "Excellent documentation and algorithmic complexity proof!"
                }
            ]
        });

        await Assignment.create({
            title: "Project 1: SQL Schema Design & Normalization",
            description: "Design a 3NF relational schema with foreign key constraints, indexes, and write analytical queries.",
            course: course3._id,
            createdBy: faculty._id,
            deadline: tomorrow,
            maxPoints: 100,
            status: "PUBLISHED",
            submissions: []
        });

        console.log("Seeding Announcements...");
        await Announcement.create({
            title: "Welcome to the Spring 2026 Academic Term!",
            content: "Welcome students and faculty to CampusOS. Please verify your course enrollments and update your academic profiles before the semester add/drop deadline.",
            author: admin._id,
            audience: "ALL",
            priority: "IMPORTANT"
        });

        await Announcement.create({
            title: "Mid-Term Examination & Lab Schedule Released",
            content: "The mid-term examination schedule for Computer Science and Information Technology has been published. Check course syllabi for assigned examination slots.",
            author: faculty._id,
            audience: "STUDENT",
            priority: "URGENT"
        });

        await Announcement.create({
            title: "Faculty Senate Committee Meeting",
            content: "Departmental faculty meeting scheduled for Friday at 3:00 PM in Conference Room A regarding 2026 curriculum review.",
            author: admin._id,
            audience: "FACULTY",
            priority: "NORMAL"
        });

        console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
        console.log("Demo Accounts Created:");
        console.log("  Admin:   admin@campus.edu   / Admin@1234");
        console.log("  Faculty: faculty@campus.edu / Faculty@1234");
        console.log("  Student: student@campus.edu / Student@1234");

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

seedDatabase();
