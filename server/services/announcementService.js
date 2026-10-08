import Announcement from "../models/Announcement.js";

const createAnnouncement = async (data, user) => {
    const { title, content, audience, priority, course } = data;

    const announcement = await Announcement.create({
        title: title.trim(),
        content: content.trim(),
        author: user.userId,
        audience: audience ? audience.toUpperCase() : "ALL",
        priority: priority ? priority.toUpperCase() : "NORMAL",
        course: course || null
    });

    return await Announcement.findById(announcement._id)
        .populate("author", "name email role department")
        .populate("course", "name code");
};

const getAnnouncements = async (user, filters = {}) => {
    const userRole = (user.role || "").toUpperCase();
    let query = {};

    if (userRole === "STUDENT") {
        query.audience = { $in: ["ALL", "STUDENT"] };
    } else if (userRole === "FACULTY") {
        query.audience = { $in: ["ALL", "FACULTY"] };
    }
    // ADMIN can see all

    if (filters.priority) {
        query.priority = filters.priority.toUpperCase();
    }

    if (filters.search) {
        query.$or = [
            { title: { $regex: filters.search, $options: "i" } },
            { content: { $regex: filters.search, $options: "i" } }
        ];
    }

    return await Announcement.find(query)
        .populate("author", "name email role department")
        .populate("course", "name code")
        .sort({ createdAt: -1 });
};

const getAnnouncementById = async (id) => {
    const announcement = await Announcement.findById(id)
        .populate("author", "name email role department")
        .populate("course", "name code");

    if (!announcement) {
        const error = new Error("Announcement not found");
        error.statusCode = 404;
        throw error;
    }

    return announcement;
};

const updateAnnouncement = async (id, data, user) => {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
        const error = new Error("Announcement not found");
        error.statusCode = 404;
        throw error;
    }

    const userRole = (user.role || "").toUpperCase();
    if (userRole !== "ADMIN" && String(announcement.author) !== String(user.userId)) {
        const error = new Error("You are not authorized to update this announcement");
        error.statusCode = 403;
        throw error;
    }

    if (data.title !== undefined) announcement.title = data.title.trim();
    if (data.content !== undefined) announcement.content = data.content.trim();
    if (data.audience !== undefined) announcement.audience = data.audience.toUpperCase();
    if (data.priority !== undefined) announcement.priority = data.priority.toUpperCase();
    if (data.course !== undefined) announcement.course = data.course || null;

    await announcement.save();

    return await Announcement.findById(id)
        .populate("author", "name email role department")
        .populate("course", "name code");
};

const deleteAnnouncement = async (id, user) => {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
        const error = new Error("Announcement not found");
        error.statusCode = 404;
        throw error;
    }

    const userRole = (user.role || "").toUpperCase();
    if (userRole !== "ADMIN" && String(announcement.author) !== String(user.userId)) {
        const error = new Error("You are not authorized to delete this announcement");
        error.statusCode = 403;
        throw error;
    }

    await Announcement.findByIdAndDelete(id);
    return { message: "Announcement deleted successfully" };
};

export {
    createAnnouncement,
    getAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement
};
