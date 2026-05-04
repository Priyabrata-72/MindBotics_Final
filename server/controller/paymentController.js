import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Order from "../model/Order.js";
import PendingOrder from "../model/PendingOrder.js";
import Payment from "../model/Payment.js";
import Refund from "../model/Refund.js";

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return { keyId, keySecret };
};

/* =========================================================
   @desc    Verify payment signature
   @route   POST /api/payments/verify
   @access  Private
========================================================= */
const verifyPayment = asyncHandler(async (req, res) => {
  const { keySecret } = getRazorpayConfig();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Payment verification data is required" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  // Check if it's already an active Order (e.g. webhook processed it first)
  let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

  if (!order) {
    // If not, it must be a PendingOrder
    const pendingOrder = await PendingOrder.findOne({ razorpayOrderId: razorpay_order_id });
    if (!pendingOrder) {
        return res.status(404).json({ message: "Order data not found or expired" });
    }

    // Initialize default timeline
    const defaultTimeline = [
      { step: "Placed", status: "completed", date: new Date(), note: "Order placed successfully" },
      { step: "Confirmed", status: "pending" },
      { step: "Packed", status: "pending" },
      { step: "Shipped", status: "pending" },
      { step: "Out for Delivery", status: "pending" },
      { step: "Delivered", status: "pending" }
    ];

    // Create the OFFICIAL order now that payment succeeded
    order = new Order({
        user: pendingOrder.user,
        items: pendingOrder.items,
        subtotal: pendingOrder.subtotal,
        totalAmount: pendingOrder.totalAmount,
        currency: pendingOrder.currency,
        shippingAddress: pendingOrder.shippingAddress,
        phone: pendingOrder.phone,
        status: "paid",
        paymentStatus: "captured",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        receipt: pendingOrder.receipt,
        paidAt: new Date(),
        trackingTimeline: defaultTimeline,
        statusHistory: [{ status: "Placed", message: "Order placed successfully" }]
    });
    
    await order.save();
    await PendingOrder.findByIdAndDelete(pendingOrder._id);
  } else {
    // If it was already an Order, just update payment details (fallback)
    if (order.paymentStatus !== "captured") {
        order.status = "paid";
        order.paymentStatus = "captured";
        order.razorpayPaymentId = razorpay_payment_id;
        order.paidAt = new Date();
        await order.save();
    }
  }

  // Save payment record
  const payment = new Payment({
    order: order._id,
    user: req.user._id,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    amount: order.totalAmount,
    currency: order.currency,
    status: "captured",
  });
  await payment.save();

  res.json({
    success: true,
    message: "Payment verified successfully",
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });
});

/* =========================================================
   @desc    Handle Razorpay Webhooks
   @route   POST /api/payments/webhook
   @access  Public
========================================================= */
const handleWebhook = asyncHandler(async (req, res) => {
  const { keySecret } = getRazorpayConfig();
  
  // Requires raw body string for signature verification
  const webhookSignature = req.headers["x-razorpay-signature"];

  if (!webhookSignature) {
    return res.status(400).json({ message: "No signature found" });
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Signature verification failed" });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  switch (event) {
    case "payment.captured": {
      const paymentEntity = payload.payment.entity;
      let order = await Order.findOne({ razorpayOrderId: paymentEntity.order_id });

      if (!order) {
        // Find in PendingOrder and transfer
        const pendingOrder = await PendingOrder.findOne({ razorpayOrderId: paymentEntity.order_id });
        if (pendingOrder) {
            const defaultTimeline = [
              { step: "Placed", status: "completed", date: new Date(), note: "Order placed successfully via Webhook" },
              { step: "Confirmed", status: "pending" },
              { step: "Packed", status: "pending" },
              { step: "Shipped", status: "pending" },
              { step: "Out for Delivery", status: "pending" },
              { step: "Delivered", status: "pending" }
            ];

            order = new Order({
                user: pendingOrder.user,
                items: pendingOrder.items,
                subtotal: pendingOrder.subtotal,
                totalAmount: pendingOrder.totalAmount,
                currency: pendingOrder.currency,
                shippingAddress: pendingOrder.shippingAddress,
                phone: pendingOrder.phone,
                status: "paid",
                paymentStatus: "captured",
                razorpayOrderId: paymentEntity.order_id,
                razorpayPaymentId: paymentEntity.id,
                receipt: pendingOrder.receipt,
                paidAt: new Date(),
                trackingTimeline: defaultTimeline,
                statusHistory: [{ status: "Placed", message: "Order placed successfully via Webhook" }]
            });
            await order.save();
            await PendingOrder.findByIdAndDelete(pendingOrder._id);
        }
      } else if (order.paymentStatus !== "captured") {
        // Fallback if already an order
        order.status = "paid";
        order.paymentStatus = "captured";
        order.razorpayPaymentId = paymentEntity.id;
        order.paidAt = new Date();
        await order.save();
      }
      break;
    }

    case "payment.failed": {
      const paymentEntity = payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: paymentEntity.order_id });

      if (order) {
        order.status = "failed";
        order.paymentStatus = "failed";
        await order.save();
      }
      break;
    }

    case "refund.processed": {
      const refundEntity = payload.refund.entity;
      const order = await Order.findOne({ razorpayPaymentId: refundEntity.payment_id });

      if (order) {
        order.status = "refunded";
        order.paymentStatus = "refunded";
        order.refundAmount = refundEntity.amount / 100;
        order.refundedAt = new Date();
        await order.save();
      }

      const refund = await Refund.findOne({ razorpayRefundId: refundEntity.id });
      if (refund) {
        refund.status = "processed";
        refund.refundedAt = new Date();
        await refund.save();
      } else if (order) {
        // If refund was not initiated by our admin panel but directly from razorpay dashboard
        const newRefund = new Refund({
          order: order._id,
          razorpayRefundId: refundEntity.id,
          razorpayPaymentId: refundEntity.payment_id,
          amount: refundEntity.amount / 100,
          status: "processed",
          reason: "Processed from Razorpay Dashboard",
          refundedAt: new Date(),
          rawResponse: refundEntity,
        });
        await newRefund.save();
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event}`);
  }

  res.json({ status: "ok" });
});

/* =========================================================
   @desc    Get Payment Stats (Admin)
   @route   GET /api/admin/payments/stats
   @access  Private/Admin
========================================================= */
const getPaymentStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const paidOrders = await Order.countDocuments({ paymentStatus: "captured" });
  const failedPayments = await Order.countDocuments({ paymentStatus: "failed" });
  const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
  const refundedOrders = await Order.countDocuments({ paymentStatus: "refunded" });

  const revenueAggr = await Order.aggregate([
    { $match: { paymentStatus: "captured" } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
  ]);
  const totalRevenue = revenueAggr.length > 0 ? revenueAggr[0].totalRevenue : 0;

  const refundAggr = await Refund.aggregate([
    { $match: { status: "processed" } },
    { $group: { _id: null, totalRefundAmount: { $sum: "$amount" } } }
  ]);
  const totalRefundAmount = refundAggr.length > 0 ? refundAggr[0].totalRefundAmount : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const chartAggr = await Order.aggregate([
    { 
      $match: { 
        paymentStatus: "captured", 
        createdAt: { $gte: thirtyDaysAgo } 
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const chartData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = chartAggr.find(item => item._id === dateStr);
    chartData.push({
      date: dateStr,
      revenue: found ? found.revenue : 0,
      orders: found ? found.orders : 0
    });
  }

  res.json({
    totalOrders,
    paidOrders,
    failedPayments,
    cancelledOrders,
    refundedOrders,
    totalRevenue,
    totalRefundAmount,
    chartData,
  });
});

export { verifyPayment, handleWebhook, getPaymentStats };
