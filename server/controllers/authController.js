import { registerUser, loginUser } from "../services/authService.js";

const register = async (req, res, next) => {
    try {
        const user = await registerUser(req.body);

        res.status(201).json({
            success : true,
            message : "User Registered Successfully",
            user
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            ...result
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await getCurrentUser(req.user.userId);

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

export { register, login, getMe};