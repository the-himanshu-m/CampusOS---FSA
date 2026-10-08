import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";

const createAssignment = async (data, user) => {
    const { title, description, course: courseId, deadline, maxPoints, status } = data;

    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        throw error;
    }

    const userRole = (user.role || "").toUpperCase();
    if (userRole === "FACULTY" && String(course.faculty) !== String(user.userId)) {
        const error = new Error("You are not assigned to instruct this course");
        error.statusCode = 403;
        throw error;
    }

    const assignment = await Assignment.create({
        title: title.trim(),
        description: description?.trim(),
        course: courseId,
        createdBy: user.userId,
        deadline: new Date(deadline),
        maxPoints: maxPoints || 100,
        status: status || "PUBLISHED",
        submissions: []
    });

    return await Assignment.findById(assignment._id)
        .populate("course", "name code department")
        .populate("createdBy", "name email");
};

const getAssignments = async (user, filters = {}) => {
    const userRole = (user.role || "").toUpperCase();
    let query = {};

    if (filters.course) {
        query.course = filters.course;
    }

    if (filters.status) {
        query.status = filters.status;
    }

    if (userRole === "FACULTY") {
        const facultyCourses = await Course.find({ faculty: user.userId }).select("_id");
        const courseIds = facultyCourses.map((c) => c._id);
        query.$or = [{ course: { $in: courseIds } }, { createdBy: user.userId }];
    } else if (userRole === "STUDENT") {
        const enrolledCourses = await Course.find({ students: user.userId }).select("_id");
        const courseIds = enrolledCourses.map((c) => c._id);
        query.course = { $in: courseIds };
        query.status = "PUBLISHED";
    }

    const assignments = await Assignment.find(query)
        .populate("course", "name code department")
        .populate("createdBy", "name email")
        .populate("submissions.student", "name email identifier")
        .sort({ deadline: 1 });

    if (userRole === "STUDENT") {
        return assignments.map((assignment) => {
            const assignmentObj = assignment.toObject();
            const mySubmission = assignment.submissions.find(
                (s) => String(s.student?._id || s.student) === String(user.userId)
            );
            return {
                ...assignmentObj,
                mySubmission: mySubmission || null,
                isSubmitted: !!mySubmission
            };
        });
    }

    return assignments;
};

const getAssignmentById = async (assignmentId, user) => {
    const assignment = await Assignment.findById(assignmentId)
        .populate("course", "name code department faculty students")
        .populate("createdBy", "name email")
        .populate("submissions.student", "name email identifier department");

    if (!assignment) {
        const error = new Error("Assignment not found");
        error.statusCode = 404;
        throw error;
    }

    const userRole = (user.role || "").toUpperCase();
    if (userRole === "STUDENT") {
        const isEnrolled = assignment.course.students?.some(
            (id) => String(id._id || id) === String(user.userId)
        );
        if (!isEnrolled) {
            const error = new Error("You are not enrolled in the course for this assignment");
            error.statusCode = 403;
            throw error;
        }

        const assignmentObj = assignment.toObject();
        const mySubmission = assignment.submissions.find(
            (s) => String(s.student?._id || s.student) === String(user.userId)
        );
        return {
            ...assignmentObj,
            mySubmission: mySubmission || null,
            isSubmitted: !!mySubmission
        };
    }

    return assignment;
};

const updateAssignment = async (assignmentId, data, user) => {
    const assignment = await Assignment.findById(assignmentId).populate("course");
    if (!assignment) {
        const error = new Error("Assignment not found");
        error.statusCode = 404;
        throw error;
    }

    const userRole = (user.role || "").toUpperCase();
    if (userRole === "FACULTY") {
        const isCourseFaculty = String(assignment.course.faculty) === String(user.userId);
        const isCreator = String(assignment.createdBy) === String(user.userId);
        if (!isCourseFaculty && !isCreator) {
            const error = new Error("You are not authorized to update this assignment");
            error.statusCode = 403;
            throw error;
        }
    }

    if (data.title !== undefined) assignment.title = data.title.trim();
    if (data.description !== undefined) assignment.description = data.description.trim();
    if (data.deadline !== undefined) assignment.deadline = new Date(data.deadline);
    if (data.maxPoints !== undefined) assignment.maxPoints = data.maxPoints;
    if (data.status !== undefined) assignment.status = data.status;

    await assignment.save();

    return await Assignment.findById(assignmentId)
        .populate("course", "name code department")
        .populate("createdBy", "name email");
};

const deleteAssignment = async (assignmentId, user) => {
    const assignment = await Assignment.findById(assignmentId).populate("course");
    if (!assignment) {
        const error = new Error("Assignment not found");
        error.statusCode = 404;
        throw error;
    }

    const userRole = (user.role || "").toUpperCase();
    if (userRole === "FACULTY") {
        const isCourseFaculty = String(assignment.course.faculty) === String(user.userId);
        const isCreator = String(assignment.createdBy) === String(user.userId);
        if (!isCourseFaculty && !isCreator) {
            const error = new Error("You are not authorized to delete this assignment");
            error.statusCode = 403;
            throw error;
        }
    }

    await Assignment.findByIdAndDelete(assignmentId);
    return { message: "Assignment deleted successfully" };
};

const submitAssignment = async (assignmentId, submissionData, user) => {
    const assignment = await Assignment.findById(assignmentId).populate("course");
    if (!assignment) {
        const error = new Error("Assignment not found");
        error.statusCode = 404;
        throw error;
    }

    const isEnrolled = assignment.course.students.some(
        (id) => String(id) === String(user.userId)
    );
    if (!isEnrolled) {
        const error = new Error("You are not enrolled in the course for this assignment");
        error.statusCode = 403;
        throw error;
    }

    const existingIndex = assignment.submissions.findIndex(
        (s) => String(s.student) === String(user.userId)
    );

    const now = new Date();
    const isLate = now > new Date(assignment.deadline);

    const newSub = {
        student: user.userId,
        content: submissionData.content?.trim(),
        fileUrl: submissionData.fileUrl?.trim(),
        submittedAt: now,
        status: isLate ? "LATE" : "SUBMITTED"
    };

    if (existingIndex >= 0) {
        assignment.submissions[existingIndex] = {
            ...assignment.submissions[existingIndex].toObject(),
            ...newSub
        };
    } else {
        assignment.submissions.push(newSub);
    }

    await assignment.save();

    return await Assignment.findById(assignmentId)
        .populate("course", "name code")
        .populate("submissions.student", "name email identifier");
};

const gradeSubmission = async (assignmentId, submissionId, gradeData, user) => {
    const assignment = await Assignment.findById(assignmentId).populate("course");
    if (!assignment) {
        const error = new Error("Assignment not found");
        error.statusCode = 404;
        throw error;
    }

    const userRole = (user.role || "").toUpperCase();
    if (userRole === "FACULTY") {
        const isCourseFaculty = String(assignment.course.faculty) === String(user.userId);
        const isCreator = String(assignment.createdBy) === String(user.userId);
        if (!isCourseFaculty && !isCreator) {
            const error = new Error("You are not authorized to grade this assignment");
            error.statusCode = 403;
            throw error;
        }
    }

    const sub = assignment.submissions.id(submissionId);
    if (!sub) {
        const error = new Error("Submission not found");
        error.statusCode = 404;
        throw error;
    }

    sub.grade = gradeData.grade;
    if (gradeData.feedback !== undefined) sub.feedback = gradeData.feedback;
    sub.status = "GRADED";

    await assignment.save();

    return await Assignment.findById(assignmentId)
        .populate("course", "name code")
        .populate("submissions.student", "name email identifier");
};

export {
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    gradeSubmission
};
