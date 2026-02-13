import mongoose from "mongoose";

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
    category: {
      type: String,
      default: "General",
    },

    // ✅ FIXED IMAGES STRUCTURE
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

    specifications: [
      {
        key: String,
        value: String,
      },
    ],

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
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
