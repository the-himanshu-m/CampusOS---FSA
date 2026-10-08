const validateUserCreate = (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            message: "Valid email is required"
        });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    const allowedRoles = ["STUDENT", "FACULTY", "ADMIN", "PLACEMENT_OFFICER"];
    if (role && !allowedRoles.includes(String(role).toUpperCase())) {
        return res.status(400).json({
            success: false,
            message: "Invalid role specified"
        });
    }

    next();
};

const validateUserUpdate = (req, res, next) => {
    const { email, role, password } = req.body;

    if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== "string" || !emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Valid email is required"
            });
        }
    }

    if (password !== undefined) {
        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }
    }

    if (role !== undefined) {
        const allowedRoles = ["STUDENT", "FACULTY", "ADMIN", "PLACEMENT_OFFICER"];
        if (!allowedRoles.includes(String(role).toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified"
            });
        }
    }

    next();
};

export {
    validateUserCreate,
    validateUserUpdate
};
