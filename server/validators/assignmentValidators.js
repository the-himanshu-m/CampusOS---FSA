import mongoose from "mongoose";

const validateAssignmentCreate = (req, res, next) => {
    const { title, course, deadline } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Assignment title is required"
        });
    }

    if (!course || !mongoose.Types.ObjectId.isValid(course)) {
        return res.status(400).json({
            success: false,
            message: "Valid course ID is required"
        });
    }

    if (!deadline || isNaN(Date.parse(deadline))) {
        return res.status(400).json({
            success: false,
            message: "Valid deadline date is required"
        });
    }

    next();
};

const validateAssignmentUpdate = (req, res, next) => {
    const { title, course, deadline } = req.body;

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Assignment title cannot be empty"
        });
    }

    if (course !== undefined && !mongoose.Types.ObjectId.isValid(course)) {
        return res.status(400).json({
            success: false,
            message: "Course ID must be valid"
        });
    }

    if (deadline !== undefined && isNaN(Date.parse(deadline))) {
        return res.status(400).json({
            success: false,
            message: "Deadline must be a valid date"
        });
    }

    next();
};

const validateSubmission = (req, res, next) => {
    const { content, fileUrl } = req.body;

    if ((!content || content.trim() === "") && (!fileUrl || fileUrl.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Either submission text or file URL is required"
        });
    }

    next();
};

const validateGrade = (req, res, next) => {
    const { grade } = req.body;

    if (grade === undefined || typeof grade !== "number" || grade < 0) {
        return res.status(400).json({
            success: false,
            message: "A valid positive numeric grade is required"
        });
    }

    next();
};

export {
    validateAssignmentCreate,
    validateAssignmentUpdate,
    validateSubmission,
    validateGrade
};
