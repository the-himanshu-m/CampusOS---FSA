import Course from "../models/Course.js";
import User from "../models/User.js";

const createCourse = async (courseData) => {
    const { name, code, description, department, semester, faculty } = courseData;

    const existingCourse = await Course.findOne({ code: code.toUpperCase().trim() });
    if (existingCourse) {
        const error = new Error("Course code already exists");
        error.statusCode = 409;
        throw error;
    }

    if (faculty) {
        const facultyUser = await User.findById(faculty);
        if (!facultyUser) {
            const error = new Error("Assigned faculty user not found");
            error.statusCode = 404;
            throw error;
        }
    }

    const course = await Course.create({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description?.trim(),
        department: department?.trim() || "CSE",
        semester: semester?.trim(),
        faculty: faculty || null,
        students: []
    });

    return await Course.findById(course._id)
        .populate("faculty", "name email department officeLocation")
        .populate("students", "name email identifier department");
};

const getCourses = async (user, filters = {}) => {
    const userRole = (user.role || "").toUpperCase();
    let query = {};

    if (userRole === "FACULTY") {
        query.faculty = user.userId;
    } else if (userRole === "STUDENT") {
        if (filters.all === "true") {
            // allow students to see active catalog for self-enrollment
            query.status = "ACTIVE";
        } else {
            // enrolled courses
            query.students = user.userId;
        }
    }

    if (filters.department) {
        query.department = filters.department;
    }

    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: "i" } },
            { code: { $regex: filters.search, $options: "i" } }
        ];
    }

    return await Course.find(query)
        .populate("faculty", "name email department")
        .populate("students", "name email identifier")
        .sort({ createdAt: -1 });
};

const getCourseById = async (courseId) => {
    const course = await Course.findById(courseId)
        .populate("faculty", "name email department officeLocation")
        .populate("students", "name email identifier department");

    if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        throw error;
    }

    return course;
};

const updateCourse = async (courseId, updateData, user) => {
    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        throw error;
    }

    const userRole = (user.role || "").toUpperCase();
    if (userRole === "FACULTY" && String(course.faculty) !== String(user.userId)) {
        const error = new Error("You are not authorized to update this course");
        error.statusCode = 403;
        throw error;
    }

    if (updateData.code && updateData.code.toUpperCase() !== course.code) {
        const existing = await Course.findOne({ code: updateData.code.toUpperCase() });
        if (existing) {
            const error = new Error("Course code already exists");
            error.statusCode = 409;
            throw error;
        }
        course.code = updateData.code.toUpperCase();
    }

    if (updateData.name !== undefined) course.name = updateData.name.trim();
    if (updateData.description !== undefined) course.description = updateData.description.trim();
    if (updateData.department !== undefined) course.department = updateData.department.trim();
    if (updateData.semester !== undefined) course.semester = updateData.semester.trim();
    if (updateData.status !== undefined) course.status = updateData.status;

    // Only Admin can reassign faculty
    if (updateData.faculty !== undefined && userRole === "ADMIN") {
        course.faculty = updateData.faculty || null;
    }

    await course.save();

    return await Course.findById(courseId)
        .populate("faculty", "name email department officeLocation")
        .populate("students", "name email identifier department");
};

const deleteCourse = async (courseId) => {
    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        throw error;
    }

    await Course.findByIdAndDelete(courseId);
    return { message: "Course deleted successfully" };
};

const enrollStudent = async (courseId, studentId) => {
    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        throw error;
    }

    const student = await User.findById(studentId);
    if (!student) {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
    }

    const isAlreadyEnrolled = course.students.some(
        (id) => id.toString() === studentId.toString()
    );

    if (isAlreadyEnrolled) {
        const error = new Error("Student is already enrolled in this course");
        error.statusCode = 409;
        throw error;
    }

    course.students.push(studentId);
    await course.save();

    return await Course.findById(courseId)
        .populate("faculty", "name email department")
        .populate("students", "name email identifier department");
};

const unenrollStudent = async (courseId, studentId) => {
    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        throw error;
    }

    course.students = course.students.filter(
        (id) => id.toString() !== studentId.toString()
    );
    await course.save();

    return await Course.findById(courseId)
        .populate("faculty", "name email department")
        .populate("students", "name email identifier department");
};

export {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    enrollStudent,
    unenrollStudent
};
