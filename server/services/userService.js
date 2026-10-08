import bcrypt from "bcryptjs";
import User from "../models/User.js";

const getUsers = async (filters = {}) => {
    let query = {};

    if (filters.role) {
        query.role = filters.role.toUpperCase();
    }

    if (filters.department) {
        query.department = filters.department;
    }

    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: "i" } },
            { email: { $regex: filters.search, $options: "i" } },
            { identifier: { $regex: filters.search, $options: "i" } }
        ];
    }

    return await User.find(query).select("-password").sort({ createdAt: -1 });
};

const getUserById = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

const createUser = async (userData) => {
    const { name, email, password, role, department, identifier, phone, bio, officeLocation, batch } = userData;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const assignedRole = role ? String(role).toUpperCase() : "STUDENT";

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: assignedRole,
        department: department || "CSE",
        identifier: identifier?.trim(),
        phone: phone?.trim(),
        bio: bio?.trim(),
        officeLocation: officeLocation?.trim(),
        batch: batch?.trim()
    });

    return await User.findById(user._id).select("-password");
};

const updateUser = async (userId, updateData, currentUser) => {
    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const isAdmin = currentUser.role.toUpperCase() === "ADMIN";
    const isSelf = String(currentUser.userId) === String(userId);

    if (!isAdmin && !isSelf) {
        const error = new Error("Not authorized to update this profile");
        error.statusCode = 403;
        throw error;
    }

    if (updateData.email && updateData.email.toLowerCase() !== user.email) {
        const existing = await User.findOne({ email: updateData.email.toLowerCase().trim() });
        if (existing) {
            const error = new Error("Email already registered");
            error.statusCode = 409;
            throw error;
        }
        user.email = updateData.email.toLowerCase().trim();
    }

    if (updateData.password) {
        user.password = await bcrypt.hash(updateData.password, 12);
    }

    if (updateData.name !== undefined) user.name = updateData.name.trim();
    if (updateData.phone !== undefined) user.phone = updateData.phone.trim();
    if (updateData.bio !== undefined) user.bio = updateData.bio.trim();

    // Privileged fields can only be modified by Admin
    if (isAdmin) {
        if (updateData.role !== undefined) user.role = updateData.role.toUpperCase();
        if (updateData.department !== undefined) user.department = updateData.department.trim();
        if (updateData.identifier !== undefined) user.identifier = updateData.identifier.trim();
        if (updateData.officeLocation !== undefined) user.officeLocation = updateData.officeLocation.trim();
        if (updateData.batch !== undefined) user.batch = updateData.batch.trim();
    }

    await user.save();

    return await User.findById(userId).select("-password");
};

const deleteUser = async (userId, currentUser) => {
    if (String(currentUser.userId) === String(userId)) {
        const error = new Error("You cannot delete your own account");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    await User.findByIdAndDelete(userId);
    return { message: "User deleted successfully" };
};

export {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
