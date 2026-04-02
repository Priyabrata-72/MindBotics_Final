import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllEnrollments,
  getAllContacts,
  createUser,
  deleteContact,
  updateContactStatus,
  updateUserRole,
} from "../controller/adminController.js";

import {
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse
} from "../controller/courseController.js";

import {
  getProjects,
  getProjectById,
  createProject as createProjectAdmin,
  updateProject as updateProjectAdmin,
  deleteProject as deleteProjectAdmin
} from "../controller/projectController.js";

import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductReview,
} from "../controller/shopController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(admin);

// ---------------- DASHBOARD ----------------
router.get("/", getDashboardStats);
router.get("/stats", getDashboardStats);

// ---------------- USERS ----------------
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUserRole);
router.delete("/users/:id", deleteUser);

// ---------------- ENROLLMENTS ----------------
router.get("/enrollments", getAllEnrollments);

// ---------------- CONTACTS ----------------
router.get("/contacts", getAllContacts);
router.delete("/contacts/:id", deleteContact);
router.put("/contacts/:id/status", updateContactStatus);

// ---------------- COURSE MANAGEMENT ----------------
router.get("/courses", getAdminCourses);
router.post("/courses", upload.any(), createCourse);
router.put("/courses/:id", upload.any(), updateCourse);
router.delete("/courses/:id", deleteCourse);

// ---------------- PROJECT MANAGEMENT ----------------
router.get("/projects", getProjects);
router.get("/projects/:id", getProjectById);
router.post("/projects", upload.any(), createProjectAdmin);
router.put("/projects/:id", upload.any(), updateProjectAdmin);
router.delete("/projects/:id", deleteProjectAdmin);

// ---------------- 3D MODEL MANAGEMENT ----------------

router.get("/all", getAdminProducts);
router.post("/add", upload.any(), createProduct);
router.put("/:id", upload.any(), updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/:productId/reviews/:reviewId", deleteProductReview);

export default router;
