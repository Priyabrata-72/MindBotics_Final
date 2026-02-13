import express from "express";
import Product from "../model/product.js";
import upload from "../middleware/upload.js";
import {
  getAllProducts,
  getProductBySlug
} from "../controller/productController.js";

const router = express.Router();

/* 🔍 Test API */
router.get("/test", (req, res) => {
  res.send("Product API working 🚀");
});

/* ➕ ADD DUMMY PRODUCT */
router.get("/add-dummy", async (req, res) => {
  try {
    const product = new Product({
      name: "Robot Car Kit",
      slug: "robot-car-kit",
      category: "Robotics",
      shortDescription: "4WD robot car chassis kit",
      fullDescription:
        "This is a complete 4WD robot car kit suitable for robotics projects.",
      stock: 10,
      image: "robot-car.jpg"
    });

    await product.save();
    res.send("✅ Dummy product added successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* 📦 GET all products */
router.get("/", getAllProducts);

/* 🔗 GET product by slug (ALWAYS LAST) */
router.get("/:slug", getProductBySlug);

/* ➕ POST new product WITH IMAGE */
router.post(
  "/",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.body.slug) {
        return res.status(400).json({ message: "Slug is required" });
      }

      // 🔒 Slug uniqueness check
      const existing = await Product.findOne({ slug: req.body.slug });
      if (existing) {
        return res.status(400).json({ message: "Slug already exists" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      // 🧠 Convert possible string → array
      const toArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          try {
            return JSON.parse(val); // ["a","b"]
          } catch {
            return val.split(",").map(v => v.trim());
          }
        }
        return [];
      };

      const product = new Product({
        slug: req.body.slug,
        name: req.body.name,
        image: req.file.filename,
        shortDescription: req.body.shortDescription,
        fullDescription: req.body.fullDescription,
        category: req.body.category,

        features: toArray(req.body.features),
        uses: toArray(req.body.uses),
        includes: toArray(req.body.includes),

        rating: req.body.rating
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: "✅ Product added successfully",
        product
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
