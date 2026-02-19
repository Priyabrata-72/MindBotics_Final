import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
      select: false, // Default to not returning password
    },
    // Signup & Verification
    otpHash: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Login Security
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    // Password Reset
    resetOtpHash: { type: String, select: false },
    resetOtpExpiry: { type: Date, select: false },
    resetAttempts: { type: Number, default: 0, select: false },
    // Profile

    avatar: {
      type: String,
    },

    avatarPublicId: {
      type: String,
    },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
);

/* 🔐 Hash password */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* 🔍 Compare password */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* 🔑 Verify OTP */
userSchema.methods.verifyOtp = async function (otp, purpose = 'signup') {
  const hashField = purpose === 'signup' ? 'otpHash' : 'resetOtpHash';
  const expiryField = purpose === 'signup' ? 'otpExpiry' : 'resetOtpExpiry';

  if (!this[hashField] || !this[expiryField]) {
    return { valid: false, reason: 'NO_OTP_FOUND' };
  }

  if (this[expiryField] < Date.now()) {
    return { valid: false, reason: 'OTP_EXPIRED' };
  }

  const isMatch = await bcrypt.compare(otp, this[hashField]);
  return { valid: isMatch, reason: isMatch ? null : 'INVALID_OTP' };
};

export default mongoose.model("User", userSchema);
