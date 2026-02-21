import mongoose from "mongoose";

const threeDModelSchema = new mongoose.Schema(
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
      enum: ["Kits", "Boards", "Components", "Robotics", "Tools"],
      default: "General",
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const ThreeDModel = mongoose.model("ThreeDModel", threeDModelSchema);

export default ThreeDModel;