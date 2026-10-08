import * as userService from "../services/userService.js";

const getAll = async (req, res, next) => {
    try {
        const users = await userService.getUsers(req.query);
        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await userService.deleteUser(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export {
    getAll,
    getById,
    create,
    update,
    remove
};
