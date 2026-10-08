import * as assignmentService from "../services/assignmentService.js";

const create = async (req, res, next) => {
    try {
        const assignment = await assignmentService.createAssignment(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            assignment
        });
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const assignments = await assignmentService.getAssignments(req.user, req.query);
        return res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const assignment = await assignmentService.getAssignmentById(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            assignment
        });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const assignment = await assignmentService.updateAssignment(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Assignment updated successfully",
            assignment
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await assignmentService.deleteAssignment(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

const submit = async (req, res, next) => {
    try {
        const assignment = await assignmentService.submitAssignment(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Assignment submitted successfully",
            assignment
        });
    } catch (error) {
        next(error);
    }
};

const grade = async (req, res, next) => {
    try {
        const assignment = await assignmentService.gradeSubmission(
            req.params.id,
            req.params.submissionId,
            req.body,
            req.user
        );
        return res.status(200).json({
            success: true,
            message: "Submission graded successfully",
            assignment
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
    submit,
    grade
};
