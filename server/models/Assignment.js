import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            trim: true
        },
        fileUrl: {
            type: String,
            trim: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["SUBMITTED", "GRADED", "LATE"],
            default: "SUBMITTED"
        },
        grade: {
            type: Number,
            default: null
        },
        feedback: {
            type: String,
            trim: true
        }
    },
    { _id: true }
);

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        deadline: {
            type: Date,
            required: true
        },
        maxPoints: {
            type: Number,
            default: 100
        },
        status: {
            type: String,
            enum: ["PUBLISHED", "DRAFT", "CLOSED"],
            default: "PUBLISHED"
        },
        submissions: [submissionSchema]
    },
    {
        timestamps: true
    }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
