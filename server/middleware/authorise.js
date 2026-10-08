const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const userRole = (req.user.role || "").toUpperCase();
        const normalizedAllowed = allowedRoles.map(r => String(r).toUpperCase());

        if (!normalizedAllowed.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
};

export default authorize;