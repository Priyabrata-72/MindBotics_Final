import mongoose from "mongoose";

// 🔹 Review Schema
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: String, // or ObjectId if you have User model
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
  },
  { timestamps: true }
);

// 🔹 Specification Schema
const specificationSchema = new mongoose.Schema({
  key: String,
  value: String,
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      default: 0,
    },

    category: {
      type: String,
      default: "General",
    },

    keyFeature: [
      {
        type: String,
      },
    ],

    // ✅ Main Images (Cloudinary structure)
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    // 🔹 Extra Gallery (optional separation)
    projectGallery: [
      {
        url: String,
        public_id: String,
      },
    ],

    specifications: [specificationSchema],

    uses: {
      type: [String],
      default: [],
    },

    includes: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // 🔹 Reviews
    reviews: [reviewSchema],

    // 🔹 Optional Aggregates
    averageRating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);