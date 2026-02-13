import express from "express";
import {
    getCourses,
    getAdminCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../controller/courseController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.route("/").get(getCourses);
router.route("/:id").get(getCourseById);

// Admin routes
router.route("/admin").get(protect, admin, getAdminCourses);

router.route("/").post(
    protect,
    admin,
    upload.single("image"),
    createCourse
);

router
    .route("/:id")
    .put(protect, admin, upload.single("image"), updateCourse)
    .delete(protect, admin, deleteCourse);

export default router;
