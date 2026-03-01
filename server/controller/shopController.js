import asyncHandler from "express-async-handler";
import Product from "../model/ThreeDModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

/* =========================================================
   @desc    Fetch all active 3D products
   @route   GET /api/shop
   @access  Public
========================================================= */
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({
    createdAt: -1,
  });

  res.json(products);
});

/* =========================================================
   @desc    Fetch all products (Admin)
   @route   GET /api/admin/shop
   @access  Private/Admin
========================================================= */
const getAdminProducts = asyncHandler(async (req, res) => {
  const pageSize = Math.max(Number(req.query.limit) || 12, 1);
  const page = Math.max(Number(req.query.page) || 1, 1);

  const count = await Product.countDocuments({});

  const products = await Product.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/* =========================================================
   @desc    Fetch single product
   @route   GET /api/shop/:id
   @access  Public
========================================================= */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

/* =========================================================
   @desc    Create a 3D product
   @route   POST /api/shop
   @access  Private/Admin
========================================================= */
const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, category } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    let imageData = { url: "", public_id: "" };

    const file =
      req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

    if (file) {
      try {
        imageData = await uploadToCloudinary(file.path, "3d-products");
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
      }
    }

    const product = new Product({
      name,
      description: description || "",
      category: category || "General",
      image: imageData,
      status: "active",
    });

    const createdProduct = await product.save();

    res.status(201).json(createdProduct);

  } catch (error) {
    console.error("Product creation error:", error);

    res.status(500).json({
      message: error.message || "Failed to create product",
      error:
        process.env.NODE_ENV === "development"
          ? error.stack
          : undefined,
    });
  }
});

/* =========================================================
   @desc    Update a 3D product
   @route   PUT /api/shop/:id
   @access  Private/Admin
========================================================= */
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.category = category || product.category;
      product.status = status || product.status;

      const file =
        req.file ||
        (req.files && req.files.length > 0
          ? req.files[0]
          : null);

      if (file) {
        try {
          if (product.image && product.image.public_id) {
            await deleteFromCloudinary(product.image.public_id);
          }

          const imageData = await uploadToCloudinary(
            file.path,
            "3d-products"
          );

          product.image = imageData;
        } catch (imgError) {
          console.error("Image update failed:", imgError);
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({
      message: error.message || "Failed to update product",
      error:
        process.env.NODE_ENV === "development"
          ? error.stack
          : undefined,
    });
  }
});

/* =========================================================
   @desc    Delete a 3D product
   @route   DELETE /api/shop/:id
   @access  Private/Admin
========================================================= */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    if (product.image && product.image.public_id) {
      await deleteFromCloudinary(product.image.public_id);
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

export {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};