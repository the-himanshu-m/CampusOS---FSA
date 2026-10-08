const validateAnnouncementCreate = (req, res, next) => {
    const { title, content } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Announcement title is required"
        });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Announcement content is required"
        });
    }

    if (req.body.audience) {
        const allowed = ["ALL", "STUDENT", "FACULTY"];
        if (!allowed.includes(String(req.body.audience).toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Audience must be ALL, STUDENT, or FACULTY"
            });
        }
    }

    if (req.body.priority) {
        const allowedPriorities = ["NORMAL", "IMPORTANT", "URGENT"];
        if (!allowedPriorities.includes(String(req.body.priority).toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Priority must be NORMAL, IMPORTANT, or URGENT"
            });
        }
    }

    next();
};

const validateAnnouncementUpdate = (req, res, next) => {
    const { title, content } = req.body;

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Title cannot be empty"
        });
    }

    if (content !== undefined && (typeof content !== "string" || content.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Content cannot be empty"
        });
    }

    next();
};

export {
    validateAnnouncementCreate,
    validateAnnouncementUpdate
};
