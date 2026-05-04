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

const pendingOrderSchema = new mongoose.Schema(
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

    paymentStatus: {
      type: String,
      default: "created",
    },

    razorpayOrderId: { type: String, index: true },
    receipt: { type: String },

    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    phone: { type: String },

    // Automatic deletion after 2 hours (7200 seconds)
    createdAt: { type: Date, default: Date.now, expires: 7200 }
  }
);

export default mongoose.model("PendingOrder", pendingOrderSchema);
