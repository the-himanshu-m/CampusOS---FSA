const validateCourseCreate = (req, res, next) => {
    const { name, code } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Course name is required"
        });
    }

    if (!code || typeof code !== "string" || code.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Course code is required"
        });
    }

    next();
};

const validateCourseUpdate = (req, res, next) => {
    const { name, code } = req.body;

    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Course name cannot be empty"
        });
    }

    if (code !== undefined && (typeof code !== "string" || code.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Course code cannot be empty"
        });
    }

    next();
};

export {
    validateCourseCreate,
    validateCourseUpdate
};
