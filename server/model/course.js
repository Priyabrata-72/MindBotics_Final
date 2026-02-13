import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number }, // in minutes
    public: { type: Boolean, default: false }, // Is this a free preview?
});

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        shortDescription: {
            type: String,
            required: true,
        },
        fullDescription: {
            type: String,
            required: true,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        image: {
            url: { type: String, default: "" },
            public_id: { type: String, default: "" },
        },
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "inactive",
        },
        duration: {
            type: String, // e.g. "12 Weeks"
        },
        instructorName: {
            type: String,
        },
        requirements: [String],
        learningOutcomes: [String],
        syllabus: [String],
        lectures: [lectureSchema],
        averageRating: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                rating: { type: Number, required: true },
                comment: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

courseSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id;
        // Provide image and thumbnail as strings for frontend compatibility
        if (ret.image && ret.image.url) {
            ret.thumbnail = ret.image.url;
            ret.image = ret.image.url;
        } else {
            ret.image = "";
            ret.thumbnail = "";
        }
        return ret;
    },
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
