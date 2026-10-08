import * as dashboardService from "../services/dashboardService.js";

const getStudent = async (req, res, next) => {
    try {
        const data = await dashboardService.getStudentDashboard(req.user.userId);
        return res.status(200).json({
            success: true,
            dashboard: data
        });
    } catch (error) {
        next(error);
    }
};

const getFaculty = async (req, res, next) => {
    try {
        const data = await dashboardService.getFacultyDashboard(req.user.userId);
        return res.status(200).json({
            success: true,
            dashboard: data
        });
    } catch (error) {
        next(error);
    }
};

const getAdmin = async (req, res, next) => {
    try {
        const data = await dashboardService.getAdminDashboard();
        return res.status(200).json({
            success: true,
            dashboard: data
        });
    } catch (error) {
        next(error);
    }
};

export {
    getStudent,
    getFaculty,
    getAdmin
};
