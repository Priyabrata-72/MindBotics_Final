import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    razorpayRefundId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["created", "processed", "failed", "pending"],
      default: "created",
    },
    reason: { type: String },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin user
    },
    refundedAt: { type: Date },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model("Refund", refundSchema);
