import express from "express";
import { getAdminOrders, cancelOrder, getAdminRefunds, updateOrderStatus, updateOrderTracking } from "../controller/orderController.js";
import { getPaymentStats } from "../controller/paymentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Routes for Orders
router.get("/orders", protect, admin, getAdminOrders);
router.post("/orders/:id/cancel", protect, admin, cancelOrder);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);
router.put("/orders/:id/tracking", protect, admin, updateOrderTracking);

// Admin Routes for Refunds
router.get("/refunds", protect, admin, getAdminRefunds);

// Admin Routes for Payment Stats
router.get("/payments/stats", protect, admin, getPaymentStats);

export default router;
