import express from "express";
import authRout from "./auth.js";
import adminRoutes from "./adminRoutes.js";
import courseRoutes from "./courseRoutes.js";
import projectRoutes from "./projectRoutes.js";
import contactRoutes from "./contactRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";
import { getProducts, getProductById, createProductReview } from "../controller/shopController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth routes (mounted at /user)
router.use("/user", authRout);

// GET /api/shop
router.get("/3d", getProducts);
router.get("/3d/:id", getProductById);
router.post("/3d/:id/reviews", protect, createProductReview);

// Admin specific routes
router.use("/admin", adminRoutes);

// Entity routes
router.use("/courses", courseRoutes);
router.use("/projects", projectRoutes); 
router.use("/admin/projects", projectRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/contact", contactRoutes);

// Compatibility alias for the old prefix if needed
// router.use("/mindbotics/user", authRout);

export default router;
