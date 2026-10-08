import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        audience: {
            type: String,
            enum: ["ALL", "STUDENT", "FACULTY"],
            default: "ALL"
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            default: null
        },
        priority: {
            type: String,
            enum: ["NORMAL", "IMPORTANT", "URGENT"],
            default: "NORMAL"
        }
    },
    {
        timestamps: true
    }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
