import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import User from '../model/user.js';
import { generateOtp, hashOtp } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/email.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimit.js';
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

const router = express.Router();

// ============================
// SIGNUP: Step 1 - Register user + send OTP
// ============================
router.post(
    "/signup",
    otpLimiter,
    [
        body("email")
            .isEmail()
            .withMessage("Invalid email")
            .normalizeEmail(),
        body("username")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters")
            .matches(/^[A-Za-z]+$/)
            .withMessage("Username must contain only letters"),
        body("password")
            .isLength({ min: 6 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        try {
            const { email, password, username } = req.body;

            let user = await User.findOne({ email });

            // Email already verified
            if (user && user.isVerified) {
                return res.status(400).json({ error: "Email already registered" });
            }

            const otp = generateOtp();
            const otpHash = await hashOtp(otp);

            const otpExpiry = new Date(
                Date.now() + Number(process.env.OTP_EXPIRES_MIN) * 60 * 1000
            );

            // 🚨 Safety check (prevents Invalid Date error)
            if (isNaN(otpExpiry.getTime())) {
                return res.status(500).json({ error: "Invalid OTP expiry configuration" });
            }

            if (user) {
                // Update existing unverified user
                user.username = username; // ✅ added
                user.password = password; // in case user re-signs up
                user.otpHash = otpHash;
                user.otpExpiry = otpExpiry;
                user.otpAttempts = 0;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    email,
                    username, // ✅ added
                    password,
                    otpHash,
                    otpExpiry,
                    otpAttempts: 0,
                });
            }

            await sendOtpEmail(user.email, otp, "signup");

            res.status(200).json({
                message: "OTP sent to email. Expires in 5 minutes.",
                email: user.email,
                username: user.username,
            });
        } catch (err) {
            console.error("Signup error:", err);
            res.status(500).json({ error: "Server error during signup" });
        }
    }
);


// ============================
// SIGNUP: Step 2 - Verify OTP
// ============================
router.post(
    '/verify-otp',
    [
        body('email').isEmail().normalizeEmail(),
        body('otp').isLength({ min: 4, max: 4 }).isNumeric(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        try {
            const user = await User.findOne({ email: req.body.email }).select(
                '+otpHash +otpExpiry +otpAttempts'
            );

            if (!user) return res.status(404).json({ error: 'User not found' });
            if (user.isVerified)
                return res.status(400).json({ error: 'Account already verified' });

            if (user.otpAttempts >= Number(process.env.MAX_OTP_ATTEMPTS)) {
                return res
                    .status(403)
                    .json({ error: 'Account locked. Too many OTP attempts.' });
            }

            const { valid, reason } = await user.verifyOtp(
                req.body.otp,
                'signup'
            );

            if (!valid) {
                user.otpAttempts += 1;
                await user.save();

                if (reason === 'OTP_EXPIRED') {
                    return res
                        .status(400)
                        .json({ error: 'OTP expired. Request a new one.' });
                }

                return res.status(400).json({
                    error: `Invalid OTP. ${process.env.MAX_OTP_ATTEMPTS - user.otpAttempts
                        } attempts remaining.`,
                });
            }

            // Success
            user.isVerified = true;
            user.otpHash = undefined;
            user.otpExpiry = undefined;
            user.otpAttempts = 0;
            await user.save();

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                message: 'Account verified successfully',
                user: { email: user.email, verified: true },
            });
        } catch (err) {
            console.error('OTP verification error:', err);
            res.status(500).json({ error: 'Verification failed' });
        }
    }
);



// ============================
// RESEND OTP (Forgot Password Purpose)
// ============================
router.post(
    "/resend-reset-otp",
    otpLimiter,
    [body("email").isEmail().normalizeEmail()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        try {
            const user = await User.findOne({
                email: req.body.email,
                isVerified: true,
            }).select("+resetOtpHash +resetOtpExpiry +resetAttempts");

            if (!user) {
                return res
                    .status(200)
                    .json({ message: "If account exists, OTP sent." });
            }

            // Prevent spam resend if OTP still valid
            if (user.resetOtpExpiry && user.resetOtpExpiry > new Date()) {
                return res.status(429).json({
                    error:
                        "OTP already sent. Please check your email or wait until it expires.",
                });
            }

            const otp = generateOtp();

            user.resetOtpHash = await hashOtp(otp);
            user.resetOtpExpiry = new Date(
                Date.now() + Number(process.env.OTP_EXPIRES_MIN) * 60000
            );
            user.resetAttempts = 0;

            await user.save();

            await sendOtpEmail(user.email, otp, "reset");

            res.status(200).json({
                message: "New password reset OTP sent successfully.",
            });
        } catch (err) {
            console.error("Resend Reset OTP error:", err);
            res.status(500).json({ error: "Failed to resend reset OTP" });
        }
    }
);



/* ============================
   LOGIN USER
============================ */

router.post(
    "/login",
    [
        body("email").isEmail().normalizeEmail(),
        body("password").notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            // 1️⃣ Find user + include password
            const user = await User.findOne({ email }).select("+password");

            if (!user)
                return res.status(401).json({ error: "Invalid email or password" });

            // 2️⃣ Check if account is verified
            if (!user.isVerified)
                return res.status(403).json({ error: "Please verify your account first" });

            // 3️⃣ Check if account is locked
            if (user.lockUntil && user.lockUntil > Date.now()) {
                return res.status(423).json({
                    error: `Account locked. Try again after ${new Date(
                        user.lockUntil
                    ).toLocaleTimeString()}`,
                });
            }

            // 4️⃣ Compare password
            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                user.failedLoginAttempts += 1;

                // Lock account after 5 failed attempts
                if (user.failedLoginAttempts >= 5) {
                    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
                    await user.save();
                    return res.status(423).json({
                        error: "Account locked for 15 minutes due to multiple failures",
                    });
                }

                await user.save();
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // 5️⃣ Reset failed attempts on success
            user.failedLoginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();

            // 6️⃣ Generate JWT
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
            );

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ error: "Login failed" });
        }
    }
);

// ============================
// FORGOT PASSWORD: Step 1
// ============================
router.post(
    '/forgot-password',
    otpLimiter,
    [body('email').isEmail().normalizeEmail()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        try {
            const user = await User.findOne({
                email: req.body.email,
                isVerified: true,
            }).select('+resetOtpHash +resetOtpExpiry +resetAttempts');

            if (!user) {
                return res
                    .status(200)
                    .json({ message: 'If account exists, OTP sent.' });
            }

            if (user.resetOtpExpiry && user.resetOtpExpiry > new Date()) {
                return res
                    .status(429)
                    .json({ error: 'OTP already sent. Check email or wait.' });
            }

            const otp = generateOtp();
            user.resetOtpHash = await hashOtp(otp);
            user.resetOtpExpiry = new Date(
                Date.now() + Number(process.env.OTP_EXPIRES_MIN) * 60000
            );
            user.resetAttempts = 0;
            await user.save();

            await sendOtpEmail(user.email, otp, 'reset');

            res
                .status(200)
                .json({ message: 'Password reset OTP sent. Expires in 5 minutes.' });
        } catch (err) {
            console.error('Forgot password error:', err);
            res.status(500).json({ error: 'Request failed' });
        }
    }
);

// ============================
// FORGOT PASSWORD: Step 2
// ============================
router.post(
    '/reset-password',
    [
        body('email').isEmail().normalizeEmail(),
        body('otp').isLength({ min: 4, max: 4 }).isNumeric(),
        body('newPassword')
            .isLength({ min: 8 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        try {
            const user = await User.findOne({
                email: req.body.email,
                isVerified: true,
            }).select('+resetOtpHash +resetOtpExpiry +resetAttempts');

            if (!user || !user.resetOtpHash) {
                return res
                    .status(400)
                    .json({ error: 'Invalid reset request. Start over.' });
            }

            if (user.resetAttempts >= Number(process.env.MAX_OTP_ATTEMPTS)) {
                return res
                    .status(403)
                    .json({ error: 'Reset locked. Too many attempts.' });
            }

            const { valid, reason } = await user.verifyOtp(
                req.body.otp,
                'reset'
            );

            if (!valid) {
                user.resetAttempts += 1;
                await user.save();

                if (reason === 'OTP_EXPIRED') {
                    return res
                        .status(400)
                        .json({ error: 'OTP expired. Request a new reset link.' });
                }

                return res.status(400).json({
                    error: `Invalid OTP. ${process.env.MAX_OTP_ATTEMPTS - user.resetAttempts
                        } attempts remaining.`,
                });
            }

            user.password = req.body.newPassword;
            user.resetOtpHash = undefined;
            user.resetOtpExpiry = undefined;
            user.resetAttempts = 0;
            await user.save();

            res
                .status(200)
                .json({ message: 'Password reset successful. Please log in.' });
        } catch (err) {
            console.error('Reset password error:', err);
            res.status(500).json({ error: 'Reset failed' });
        }
    }
);

router.get("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "username email role avatar"
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        console.error("Fetch profile error:", err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// ============================
// UPDATE PROFILE AVATAR
// ============================
router.put(
    "/profile/avatar",
    protect,
    upload.single("image"),
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if (!req.file) {
                return res.status(400).json({ error: "No image uploaded" });
            }

            // 🔥 Delete old avatar if exists
            if (user.avatarPublicId) {
                await deleteFromCloudinary(user.avatarPublicId);
            }

            // 🔥 Upload new avatar
            const uploadedImage = await uploadToCloudinary(
                req.file.path,
                "profile_pictures"
            );

            // Save to user
            user.avatar = uploadedImage.url;
            user.avatarPublicId = uploadedImage.public_id;

            await user.save();

            res.status(200).json({
                message: "Profile picture updated successfully",
                avatar: user.avatar,
            });
        } catch (error) {
            console.error("Profile avatar upload error:", error);
            res.status(500).json({ error: "Failed to update profile picture" });
        }
    }
);

// ============================
// DELETE PROFILE AVATAR
// ============================
router.delete("/profile/avatar", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || !user.avatarPublicId) {
            return res.status(404).json({ error: "No profile image found" });
        }

        await deleteFromCloudinary(user.avatarPublicId);

        user.avatar = "";
        user.avatarPublicId = "";

        await user.save();

        res.status(200).json({ message: "Profile picture removed successfully" });
    } catch (error) {
        console.error("Delete profile avatar error:", error);
        res.status(500).json({ error: "Failed to delete profile picture" });
    }
});


export default router;
