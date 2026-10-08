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

    if (!email || typeof email !== "string") {
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