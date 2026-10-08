import * as courseService from "../services/courseService.js";

const create = async (req, res, next) => {
    try {
        const course = await courseService.createCourse(req.body);
        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const courses = await courseService.getCourses(req.user, req.query);
        return res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        return res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const course = await courseService.updateCourse(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await courseService.deleteCourse(req.params.id);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

const enroll = async (req, res, next) => {
    try {
        // If student calls enroll, studentId is req.user.userId; if admin, can pass studentId in body
        const studentId = req.user.role.toUpperCase() === "STUDENT" 
            ? req.user.userId 
            : (req.body.studentId || req.user.userId);

        const course = await courseService.enrollStudent(req.params.id, studentId);
        return res.status(200).json({
            success: true,
            message: "Enrolled in course successfully",
            course
        });
    } catch (error) {
        next(error);
    }
};

const unenroll = async (req, res, next) => {
    try {
        const studentId = req.user.role.toUpperCase() === "STUDENT" 
            ? req.user.userId 
            : (req.body.studentId || req.user.userId);

        const course = await courseService.unenrollStudent(req.params.id, studentId);
        return res.status(200).json({
            success: true,
            message: "Unenrolled from course successfully",
            course
        });
    } catch (error) {
        next(error);
    }
};

export {
    create,
    getAll,
    getById,
    update,
    remove,
    enroll,
    unenroll
};
