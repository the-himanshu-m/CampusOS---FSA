import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },
        description: {
            type: String,
            trim: true
        },
        department: {
            type: String,
            trim: true,
            default: "CSE"
        },
        semester: {
            type: String,
            trim: true
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        status: {
            type: String,
            enum: ["ACTIVE", "ARCHIVED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
