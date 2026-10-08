import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/jwt.js";

const registerUser = async (userData) => {
    const {name, email, password, department, identifier} = userData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;

        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        password : hashedPassword,
        role : "STUDENT",
        department,
        identifier
    });

    return {
        id : user._id,
        name : user.name,
        email : user.email,
        role : user.role,
        department : user.department,
        identifier : user.identifier
    };
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const passwordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordCorrect) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
        }
    };
};

const getCurrentUser = async (UserId) => {
    const user = await User.findById(UserId).select("-password");

    if (!user) {
        const error = new Error("User Not Found");
        error.statusCode = 404;
        throw error; 
    }

    return user;
}

export { registerUser, loginUser, getCurrentUser };