const validateRegister = (req, res, next) => {
    const {
        name,
        email,
        password
    } = req.body;

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

    if (req.body.role) {
        const allowedRoles = ["STUDENT", "FACULTY", "ADMIN", "PLACEMENT_OFFICER"];
        if (!allowedRoles.includes(String(req.body.role).toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified"
            });
        }
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || typeof email !== "string") {
        return res.status(400).json({
            success: false,
            message: "Valid email is required"
        });
    }

    if (!password || typeof password !== "string") {
        return res.status(400).json({
            success: false,
            message: "Password is required"
        });
    }

    next();
};

export {
    validateRegister,
    validateLogin
};