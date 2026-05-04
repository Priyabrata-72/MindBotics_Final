import express from "express";
import { createOrder } from "../controller/orderController.js";
import { verifyPayment, handleWebhook } from "../controller/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (Webhook doesn't need auth, uses signature)
router.post("/webhook", handleWebhook);

// Protected user routes
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;
