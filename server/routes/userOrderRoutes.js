import express from "express";
import { getUserOrders, cancelMyOrder } from "../controller/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected user routes for orders
router.get("/my-orders", protect, getUserOrders);
router.patch("/:id/cancel", protect, cancelMyOrder);

export default router;
