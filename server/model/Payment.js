import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true, unique: true },
    razorpaySignature: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String }, // e.g. card, netbanking, upi, wallet
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded"],
      default: "captured",
    },
    rawResponse: { type: mongoose.Schema.Types.Mixed }, // to store complete razorpay response if needed
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
