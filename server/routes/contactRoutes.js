import express from "express";
import { createContact } from "../controller/contactController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/contact", protect, createContact);

export default router;
