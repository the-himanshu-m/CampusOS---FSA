import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Announcement from "../models/Announcement.js";

const getStudentDashboard = async (userId) => {
    const student = await User.findById(userId).select("-password");
    if (!student) {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
    }

    // Enrolled courses
    const enrolledCourses = await Course.find({ students: userId })
        .populate("faculty", "name email department officeLocation")
        .sort({ updatedAt: -1 });

    const courseIds = enrolledCourses.map((c) => c._id);

    // Assignments in enrolled courses
    const allAssignments = await Assignment.find({
        course: { $in: courseIds },
        status: "PUBLISHED"
    })
        .populate("course", "name code")
        .sort({ deadline: 1 });

    const now = new Date();
    const upcomingAssignments = [];
    const overdueAssignments = [];
    const completedAssignments = [];

    allAssignments.forEach((assignment) => {
        const mySub = assignment.submissions.find(
            (s) => String(s.student) === String(userId)
        );

        const item = {
            _id: assignment._id,
            title: assignment.title,
            course: assignment.course,
            deadline: assignment.deadline,
            maxPoints: assignment.maxPoints,
            submission: mySub || null,
            isSubmitted: !!mySub
        };

        if (mySub) {
            completedAssignments.push(item);
        } else if (new Date(assignment.deadline) < now) {
            overdueAssignments.push(item);
        } else {
            upcomingAssignments.push(item);
        }
    });

    // Recent announcements
    const recentAnnouncements = await Announcement.find({
        audience: { $in: ["ALL", "STUDENT"] }
    })
        .populate("author", "name email role")
        .sort({ createdAt: -1 })
        .limit(5);

    return {
        profile: student,
        courses: enrolledCourses,
        stats: {
            totalEnrolledCourses: enrolledCourses.length,
            upcomingCount: upcomingAssignments.length,
            overdueCount: overdueAssignments.length,
            completedCount: completedAssignments.length
        },
        upcomingAssignments,
        overdueAssignments,
        completedAssignments,
        recentAnnouncements
    };
};

const getFacultyDashboard = async (userId) => {
    const faculty = await User.findById(userId).select("-password");
    if (!faculty) {
        const error = new Error("Faculty not found");
        error.statusCode = 404;
        throw error;
    }

    // Assigned courses
    const courses = await Course.find({ faculty: userId })
        .populate("students", "name email identifier")
        .sort({ createdAt: -1 });

    const courseIds = courses.map((c) => c._id);

    // Assignments created by faculty or for assigned courses
    const assignments = await Assignment.find({
        $or: [{ course: { $in: courseIds } }, { createdBy: userId }]
    })
        .populate("course", "name code")
        .sort({ deadline: -1 });

    let totalSubmissions = 0;
    let pendingGrading = 0;

    assignments.forEach((a) => {
        a.submissions.forEach((sub) => {
            totalSubmissions++;
            if (sub.status === "SUBMITTED" || sub.status === "LATE") {
                pendingGrading++;
            }
        });
    });

    let totalStudents = 0;
    courses.forEach((c) => {
        totalStudents += (c.students || []).length;
    });

    const recentAnnouncements = await Announcement.find({
        audience: { $in: ["ALL", "FACULTY"] }
    })
        .populate("author", "name email role")
        .sort({ createdAt: -1 })
        .limit(5);

    return {
        profile: faculty,
        courses,
        assignments: assignments.slice(0, 10),
        stats: {
            totalCourses: courses.length,
            totalStudents,
            totalAssignments: assignments.length,
            totalSubmissions,
            pendingGrading
        },
        recentAnnouncements
    };
};

const getAdminDashboard = async () => {
    const [
        totalStudents,
        totalFaculty,
        totalAdmins,
        totalCourses,
        totalAssignments,
        totalAnnouncements,
        recentUsers,
        recentCourses,
        recentAnnouncements
    ] = await Promise.all([
        User.countDocuments({ role: "STUDENT" }),
        User.countDocuments({ role: "FACULTY" }),
        User.countDocuments({ role: "ADMIN" }),
        Course.countDocuments(),
        Assignment.countDocuments(),
        Announcement.countDocuments(),
        User.find().select("-password").sort({ createdAt: -1 }).limit(5),
        Course.find().populate("faculty", "name email").sort({ createdAt: -1 }).limit(5),
        Announcement.find().populate("author", "name email role").sort({ createdAt: -1 }).limit(5)
    ]);

    return {
        stats: {
            totalUsers: totalStudents + totalFaculty + totalAdmins,
            totalStudents,
            totalFaculty,
            totalAdmins,
            totalCourses,
            totalAssignments,
            totalAnnouncements
        },
        recentUsers,
        recentCourses,
        recentAnnouncements
    };
};

export {
    getStudentDashboard,
    getFacultyDashboard,
    getAdminDashboard
};
