import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // Order lifecycle
    status: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Placed",
    },

    // Payment lifecycle
    paymentStatus: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded"],
      default: "created",
    },

    // Razorpay identifiers
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true, sparse: true },

    // Receipt — used as idempotency key in Razorpay
    receipt: { type: String },

    // Cancellation / Refund metadata
    cancelReason: { type: String },
    refundAmount: { type: Number, default: 0 },

    // Timestamps for lifecycle events
    paidAt: { type: Date },
    cancelledAt: { type: Date },
    refundedAt: { type: Date },
    
    // Shipping Details
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    phone: { type: String },

    // Tracking Details
    trackingId: { type: String },
    courierName: { type: String },
    estimatedDeliveryDate: { type: Date },
    
    // Manual Tracking Timeline
    trackingTimeline: [
      {
        step: { type: String },
        status: { type: String, enum: ["pending", "completed"], default: "pending" },
        date: { type: Date },
        note: { type: String }
      }
    ],
    currentTrackingStep: { type: String, default: "Placed" },

    // Status History
    statusHistory: [
      {
        status: { type: String },
        message: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
