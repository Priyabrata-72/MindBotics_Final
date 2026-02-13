import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    // specifications: [
    //   {
    //     label: String,
    //     value: String,
    //   },
    // ],
    
    uses: {
      type: [String],
      default: [],
    },
    includes: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
