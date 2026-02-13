import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        progress: {
            type: Number,
            default: 0, // Percentage 0-100
        },
        completedLectures: [
            {
                type: mongoose.Schema.Types.ObjectId, // IDs of completed lecture subdocuments
            },
        ],
        isCompleted: {
            type: Boolean,
            default: false,
        },
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Prevent duplicate enrollments
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
