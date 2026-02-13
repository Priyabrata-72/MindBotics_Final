import express from "express";
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
} from "../controller/projectController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.route("/")
    .get(getProjects)
router.route("/:id")
    .get(getProjectById)


router.route("/")
    .get(protect, admin, getProjects)
    .post(protect, admin, upload.array("images"), createProject);

router.route("/:id")
    .get(protect, admin, getProjectById)
    .put(protect, admin, upload.array("images"), updateProject)
    .delete(protect, admin, deleteProject);

export default router;
