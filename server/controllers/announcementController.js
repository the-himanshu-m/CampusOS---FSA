import * as announcementService from "../services/announcementService.js";

const create = async (req, res, next) => {
    try {
        const announcement = await announcementService.createAnnouncement(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            announcement
        });
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const announcements = await announcementService.getAnnouncements(req.user, req.query);
        return res.status(200).json({
            success: true,
            count: announcements.length,
            announcements
        });
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const announcement = await announcementService.getAnnouncementById(req.params.id);
        return res.status(200).json({
            success: true,
            announcement
        });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const announcement = await announcementService.updateAnnouncement(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Announcement updated successfully",
            announcement
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await announcementService.deleteAnnouncement(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            ...result
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
    remove
};
