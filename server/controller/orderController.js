import asyncHandler from "express-async-handler";
import axios from "axios";
import Order from "../model/Order.js";
import PendingOrder from "../model/PendingOrder.js";
import Refund from "../model/Refund.js";
import Project from "../model/project.js";
import ThreeDModel from "../model/ThreeDModel.js";
import User from "../model/user.js";
import crypto from "crypto";

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return { keyId, keySecret };
};

const findPurchasableItem = async (id) => {
  const threeDProduct = await ThreeDModel.findById(id).select("name price");
  if (threeDProduct) {
    return threeDProduct;
  }

  return Project.findById(id).select("name price");
};

const calculateOrder = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Cart items are required");
    error.statusCode = 400;
    throw error;
  }

  const lineItems = [];
  let subtotal = 0;

  for (const item of items) {
    const quantity = Math.max(Number(item.quantity || item.qty) || 0, 0);

    if (!item.id && !item.productId) {
      const error = new Error("Invalid cart item ID");
      error.statusCode = 400;
      throw error;
    }

    const productId = item.id || item.productId;

    if (quantity < 1) {
      const error = new Error("Invalid cart item quantity");
      error.statusCode = 400;
      throw error;
    }

    const product = await findPurchasableItem(productId);

    if (!product) {
      const error = new Error("One or more cart items are no longer available");
      error.statusCode = 404;
      throw error;
    }

    const price = Number(product.price) || 0;
    const lineTotal = price * quantity;

    subtotal += lineTotal;
    lineItems.push({
      productId: product._id,
      name: product.name,
      price,
      qty: quantity,
    });
  }

  const shipping = subtotal > 100 ? 0 : 10;
  const totalAmount = subtotal + shipping;

  return { lineItems, subtotal, shipping, totalAmount };
};

/* =========================================================
   @desc    Create new order
   @route   POST /api/orders/create
   @access  Private
========================================================= */
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, phone } = req.body;
  const { keyId, keySecret } = getRazorpayConfig();

  const { lineItems, subtotal, totalAmount } = await calculateOrder(items);

  const amountInPaise = Math.round(totalAmount * 100);

  if (amountInPaise < 100) {
    return res.status(400).json({ message: "Order amount is too low" });
  }

  // Create local pending order first (prevents cluttering main orders collection if abandoned)
  const pendingOrder = new PendingOrder({
    user: req.user._id,
    items: lineItems,
    subtotal,
    totalAmount,
    currency: "INR",
    shippingAddress,
    phone,
  });

  const createdOrder = await pendingOrder.save();

  // Create Razorpay order
  const receipt = `order_${createdOrder._id}`;
  try {
    const { data: razorpayOrder } = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          orderId: createdOrder._id.toString(),
        },
      },
      {
        auth: {
          username: keyId,
          password: keySecret,
        },
      }
    );

    // Save razorpayOrderId to pending order
    createdOrder.razorpayOrderId = razorpayOrder.id;
    createdOrder.receipt = receipt;
    await createdOrder.save();

    res.status(201).json({
      order: createdOrder,
      razorpayOrder,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation failed", error);
    // If Razorpay fails, simply delete the pending order
    await PendingOrder.findByIdAndDelete(createdOrder._id);
    res.status(500).json({ message: "Payment gateway error. Order failed." });
  }
});

/* =========================================================
   @desc    Get all orders (Admin)
   @route   GET /api/admin/orders
   @access  Private/Admin
========================================================= */
const getAdminOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, page = 1, limit = 10, search } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  // Support for search by user email would require a lookup/aggregate or a populated match.
  // We'll fetch the users matching the email and filter orders by those users.
  if (search) {
      const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
      const userIds = users.map(u => u._id);
      query.user = { $in: userIds };
  }

  const pageSize = Math.max(Number(limit) || 10, 1);
  const currentPage = Math.max(Number(page) || 1, 1);

  const count = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate("user", "username email")
    .limit(pageSize)
    .skip(pageSize * (currentPage - 1))
    .sort({ createdAt: -1 });

  res.json({
    orders,
    page: currentPage,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/* =========================================================
   @desc    Cancel an order
   @route   POST /api/admin/orders/:id/cancel
   @access  Private/Admin
========================================================= */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const { reason } = req.body;

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "Cancelled" || order.status === "Returned") {
    return res.status(400).json({ message: "Order is already cancelled or returned" });
  }

  const { keyId, keySecret } = getRazorpayConfig();

  if (order.paymentStatus === "captured") {
    // Call Razorpay refund API
    try {
      const { data: refundData } = await axios.post(
        `https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}/refund`,
        {
          amount: Math.round(order.totalAmount * 100),
          notes: {
            reason: reason || "Admin requested cancellation",
          },
        },
        {
          auth: {
            username: keyId,
            password: keySecret,
          },
        }
      );

      // Create Refund record
      const refund = new Refund({
        order: order._id,
        razorpayRefundId: refundData.id,
        razorpayPaymentId: order.razorpayPaymentId,
        amount: order.totalAmount,
        status: "processed", // Will be confirmed by webhook
        reason: reason || "Admin requested cancellation",
        initiatedBy: req.user._id,
        rawResponse: refundData,
      });
      await refund.save();

      order.status = "Cancelled";
      order.cancelReason = reason;
      order.statusHistory.push({ status: "Cancelled", message: "Refund initiated and order cancelled", updatedBy: req.user._id });
      await order.save();

      res.json({ message: "Refund initiated and order cancelled", order, refund });
    } catch (error) {
      console.error("Refund failed", error.response?.data || error.message);
      return res.status(500).json({ message: "Failed to process refund via payment gateway" });
    }
  } else {
    // Directly cancel if unpaid
    order.status = "Cancelled";
    order.cancelReason = reason;
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: "Cancelled", message: reason || "Admin requested cancellation", updatedBy: req.user._id });
    await order.save();
    res.json({ message: "Order cancelled successfully", order });
  }
});

/* =========================================================
   @desc    Update order status
   @route   PUT /api/admin/orders/:id/status
   @access  Private/Admin
========================================================= */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const invalidStatuses = ["Cancelled", "Returned"];
  if (invalidStatuses.includes(order.status)) {
    return res.status(400).json({ message: "Cannot update a cancelled or returned order" });
  }

  const validStatuses = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status provided" });
  }

  order.status = status;
  if (status === 'Delivered' && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  // Align tracking timeline with the new status
  if (order.trackingTimeline && order.trackingTimeline.length > 0 && !["Cancelled", "Returned"].includes(status)) {
      const flow = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
      const targetIndex = flow.indexOf(status);
      
      if (targetIndex !== -1) {
          order.trackingTimeline.forEach((tStep) => {
              const stepIndex = flow.indexOf(tStep.step);
              if (stepIndex !== -1 && stepIndex <= targetIndex) {
                  if (tStep.status !== "completed") {
                      tStep.status = "completed";
                      tStep.date = new Date();
                      if (stepIndex === targetIndex && message) {
                          tStep.note = message;
                      }
                  }
              } else if (stepIndex > targetIndex) {
                  tStep.status = "pending";
              }
          });
          
          const nextIndex = targetIndex + 1 < flow.length ? targetIndex + 1 : targetIndex;
          order.currentTrackingStep = flow[nextIndex];
      }
  }
  
  order.statusHistory.push({
    status,
    message: message || `Status updated to ${status}`,
    updatedBy: req.user._id,
  });

  const updatedOrder = await order.save();
  res.json({ message: `Order status updated to ${status}`, order: updatedOrder });
});

/* =========================================================
   @desc    Update order tracking details
   @route   PUT /api/admin/orders/:id/tracking
   @access  Private/Admin
========================================================= */
const updateOrderTracking = asyncHandler(async (req, res) => {
  const { trackingId, courierName, estimatedDeliveryDate, trackingTimeline } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (trackingId !== undefined) order.trackingId = trackingId;
  if (courierName !== undefined) order.courierName = courierName;
  if (estimatedDeliveryDate !== undefined) order.estimatedDeliveryDate = estimatedDeliveryDate;

  if (trackingTimeline && Array.isArray(trackingTimeline)) {
    order.trackingTimeline = trackingTimeline;
    
    // Find highest completed step to align order status
    const flow = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
    let highestCompletedStatus = "Placed";
    let highestIndex = -1;
    
    trackingTimeline.forEach(t => {
        if (t.status === "completed") {
            const idx = flow.indexOf(t.step);
            if (idx > highestIndex) {
                highestIndex = idx;
                highestCompletedStatus = t.step;
            }
        }
    });

    // Auto-update main order status to match the furthest completed step in the timeline
    if (highestIndex !== -1 && order.status !== highestCompletedStatus && !["Cancelled", "Returned"].includes(order.status)) {
        order.status = highestCompletedStatus;
        if (highestCompletedStatus === "Delivered" && !order.deliveredAt) {
            order.deliveredAt = new Date();
        }
        order.statusHistory.push({
            status: highestCompletedStatus,
            message: `Status aligned from timeline manual update to ${highestCompletedStatus}`,
            updatedBy: req.user._id
        });
    }

    // Determine the next pending step to set as currentTrackingStep
    let nextStep = "Delivered"; 
    for (const stepName of flow) {
        const found = trackingTimeline.find(t => t.step === stepName);
        if (!found || found.status !== "completed") {
            nextStep = stepName;
            break;
        }
    }
    order.currentTrackingStep = nextStep;
  }

  order.statusHistory.push({
    status: order.status,
    message: "Tracking details updated",
    updatedBy: req.user._id,
  });

  const updatedOrder = await order.save();
  res.json({ message: "Order tracking updated successfully", order: updatedOrder });
});

/* =========================================================
   @desc    Get all refunds (Admin)
   @route   GET /api/admin/refunds
   @access  Private/Admin
========================================================= */
const getAdminRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find({})
    .populate("order", "razorpayOrderId totalAmount status")
    .sort({ createdAt: -1 });

  res.json(refunds);
});

/* =========================================================
   @desc    Get logged in user orders
   @route   GET /api/orders/my-orders
   @access  Private
========================================================= */
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  const formattedOrders = await Promise.all(orders.map(async (order) => {
      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
      const productRecord = firstItem?.productId
        ? await findPurchasableItem(firstItem.productId)
        : null;
      const productImage =
        productRecord?.images?.[0]
          ? {
              url: productRecord.images[0].url,
              public_id: productRecord.images[0].public_id,
            }
          : undefined;
      
      const getFallbackTimeline = () => {
          return [
              { step: "Placed", status: "completed", date: order.createdAt },
              { step: "Confirmed", status: "pending" },
              { step: "Packed", status: "pending" },
              { step: "Shipped", status: "pending" },
              { step: "Out for Delivery", status: "pending" },
              { step: "Delivered", status: "pending" }
          ];
      };

      const finalTimeline = (order.trackingTimeline && order.trackingTimeline.length > 0) 
          ? order.trackingTimeline 
          : getFallbackTimeline();

      const mappedSteps = finalTimeline.map(t => ({
          status: t.step,
          completed: t.status === "completed",
          date: t.date || null,
          description: t.note || ""
      }));
      
      // Override for cancelled/returned orders visually
      if (order.status === "Cancelled" || order.status === "Returned") {
          return {
              ...order.toObject(),
              product: firstItem ? { name: firstItem.name, image: productImage } : { name: "Unknown Product" },
              price: order.totalAmount,
              quantity: firstItem ? firstItem.qty : 1,
              trackingSteps: [
                 { status: "Placed", completed: true, date: order.createdAt },
                 { status: order.status, completed: true, date: order.cancelledAt || order.updatedAt }
              ]
          };
      }

      return {
          _id: order._id,
          product: firstItem ? {
              name: firstItem.name,
              image: productImage,
          } : { name: "Unknown Product" },
          price: order.totalAmount,
          quantity: firstItem ? firstItem.qty : 1,
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          createdAt: order.createdAt,
          trackingId: order.trackingId,
          courierName: order.courierName,
          estimatedDeliveryDate: order.estimatedDeliveryDate,
          shippingAddress: order.shippingAddress,
          statusHistory: order.statusHistory,
          trackingSteps: mappedSteps
      };
  }));

  res.json({ orders: formattedOrders });
});

/* =========================================================
   @desc    Cancel user's own order
   @route   PATCH /api/orders/:id/cancel
   @access  Private
========================================================= */
const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Ensure it's their own order
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to cancel this order" });
  }

  if (order.status === "Cancelled" || order.status === "Returned") {
    return res.status(400).json({ message: "Order is already cancelled or returned" });
  }

  const { keyId, keySecret } = getRazorpayConfig();

  if (order.paymentStatus === "captured" && order.razorpayPaymentId) {
    try {
      const { data: refundData } = await axios.post(
        `https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}/refund`,
        {
          amount: Math.round(order.totalAmount * 100),
          notes: {
            reason: "User requested cancellation",
          },
        },
        {
          auth: {
            username: keyId,
            password: keySecret,
          },
        }
      );

      const refund = new Refund({
        order: order._id,
        razorpayRefundId: refundData.id,
        razorpayPaymentId: order.razorpayPaymentId,
        amount: order.totalAmount,
        status: "processed",
        reason: "User requested cancellation",
        initiatedBy: req.user._id,
        rawResponse: refundData,
      });
      await refund.save();

      order.status = "Cancelled";
      order.cancelReason = "User requested cancellation";
      order.statusHistory.push({ status: "Cancelled", message: "User requested cancellation", updatedBy: req.user._id });
      await order.save();

      res.json({ message: "Refund initiated and order cancelled", order });
    } catch (error) {
      console.error("Refund failed", error.response?.data || error.message);
      return res.status(500).json({ message: "Failed to process refund via payment gateway" });
    }
  } else {
    order.status = "Cancelled";
    order.cancelReason = "User requested cancellation";
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: "Cancelled", message: "User requested cancellation", updatedBy: req.user._id });
    await order.save();
    res.json({ message: "Order cancelled successfully", order });
  }
});

export { createOrder, getAdminOrders, cancelOrder, getAdminRefunds, updateOrderStatus, getUserOrders, cancelMyOrder, updateOrderTracking };
