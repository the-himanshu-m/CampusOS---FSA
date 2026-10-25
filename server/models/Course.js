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
            default: null,
            index: true
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

courseSchema.index({ students: 1 });
courseSchema.index({ department: 1, status: 1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;
