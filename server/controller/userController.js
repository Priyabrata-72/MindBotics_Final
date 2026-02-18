import User from "../model/user.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import { OAuth2Client } from "google-auth-library";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/email.js";
import { uploadToCloudinary } from "../utils/cloudinaryHelper.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

/**
 * @desc    Register user & Send OTP (Step 1)
 * @route   POST /mindbotics/user/signup
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });

    // If user exists and is already verified
    if (user && user.isVerified) {
        res.status(400);
        throw new Error("Email already registered");
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const otpExpiry = new Date(Date.now() + Number(process.env.OTP_EXPIRES_MIN || 5) * 60 * 1000);

    if (user) {
        // Update unverified user
        user.username = username;
        user.password = password; // pre-save hook will hash it
        user.otpHash = otpHash;
        user.otpExpiry = otpExpiry;
        user.otpAttempts = 0;
        await user.save();
    } else {
        // Create new unverified user
        user = await User.create({
            username,
            email,
            password,
            otpHash,
            otpExpiry,
            otpAttempts: 0,
        });
    }

    await sendOtpEmail(user.email, otp, "signup");

    res.status(200).json({
        success: true,
        message: "OTP sent to email. Expires in 5 minutes.",
        email: user.email,
    });
});

/**
 * @desc    Verify OTP for Signup (Step 2)
 * @route   POST /mindbotics/user/verify-otp
 */
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select("+otpHash +otpExpiry +otpAttempts");

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error("Account already verified");
    }

    const maxAttempts = Number(process.env.MAX_OTP_ATTEMPTS || 5);
    if (user.otpAttempts >= maxAttempts) {
        res.status(403);
        throw new Error("Account locked. Too many OTP attempts.");
    }

    const verification = await user.verifyOtp(otp, "signup");

    if (!verification.valid) {
        user.otpAttempts += 1;
        await user.save();

        if (verification.reason === "OTP_EXPIRED") {
            res.status(400);
            throw new Error("OTP expired. Please request a new one.");
        }

        res.status(400);
        throw new Error(`Invalid OTP. ${maxAttempts - user.otpAttempts} attempts remaining.`);
    }

    // Success
    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Account verified successfully. You can now login.",
        user: {
            email: user.email,
            username: user.username,
        },
    });
});

/**
 * @desc    Login user (with account locking)
 * @route   POST /mindbotics/user/login
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Find user (include security fields)
    const user = await User.findOne({ email }).select("+password +failedLoginAttempts +lockUntil");

    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    // 2. Check if verified
    if (!user.isVerified) {
        res.status(403);
        throw new Error("Please verify your account first");
    }

    // 3. Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        res.status(423);
        throw new Error(`Account locked. Try again after ${remainingTime} minutes.`);
    }

    // 4. Compare password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
            await user.save();
            res.status(423);
            throw new Error("Account locked for 15 minutes due to multiple failures");
        }

        await user.save();
        res.status(401);
        throw new Error("Invalid email or password");
    }

    // 5. Success -> generate and return token
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = generateToken(user._id);

    // Set cookie (optional, depending on frontend preference)
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        }
    });
});

/**
 * @desc    Forgot Password - Send OTP (Step 1)
 * @route   POST /mindbotics/user/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email, isVerified: true }).select("+resetOtpHash +resetOtpExpiry +resetAttempts");

    if (!user) {
        // For security, don't reveal user doesn't exist
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a reset OTP has been sent.",
        });
    }

    // Prevent OTP spamming
    if (user.resetOtpExpiry && user.resetOtpExpiry > new Date()) {
        res.status(429);
        throw new Error("OTP already sent. Please check your email or wait.");
    }

    const otp = generateOtp();
    user.resetOtpHash = await hashOtp(otp);
    user.resetOtpExpiry = new Date(Date.now() + Number(process.env.OTP_EXPIRES_MIN || 5) * 60 * 1000);
    user.resetAttempts = 0;
    await user.save();

    await sendOtpEmail(user.email, otp, "reset");

    res.status(200).json({
        success: true,
        message: "Password reset OTP sent to your email.",
    });
});

/**
 * @desc    Reset Password (Step 2)
 * @route   POST /mindbotics/user/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email, isVerified: true }).select("+resetOtpHash +resetOtpExpiry +resetAttempts");

    if (!user || !user.resetOtpHash) {
        res.status(400);
        throw new Error("Invalid reset request. Please start over.");
    }

    const maxAttempts = Number(process.env.MAX_OTP_ATTEMPTS || 5);
    if (user.resetAttempts >= maxAttempts) {
        res.status(403);
        throw new Error("Reset locked. Too many attempts.");
    }

    const verification = await user.verifyOtp(otp, "reset");

    if (!verification.valid) {
        user.resetAttempts += 1;
        await user.save();

        if (verification.reason === "OTP_EXPIRED") {
            res.status(400);
            throw new Error("OTP expired. Please request a new reset.");
        }

        res.status(400);
        throw new Error(`Invalid OTP. ${maxAttempts - user.resetAttempts} attempts remaining.`);
    }

    // Success
    user.password = newPassword; // pre-save hook will hash it
    user.resetOtpHash = undefined;
    user.resetOtpExpiry = undefined;
    user.resetAttempts = 0;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successful. Please login with your new password.",
    });
});

/**
 * @desc    Update Profile
 * @route   PUT /mindbotics/user/profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.username = req.body.username || user.username;

        if (req.file) {
            try {
                const imageData = await uploadToCloudinary(req.file.path, 'avatars');
                user.avatar = imageData.url;
            } catch (error) {
                console.error("Avatar upload failed:", error);
            }
        } else if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                authProvider: updatedUser.authProvider
            },
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

/**
 * @desc    Google Login
 * @route   POST /mindbotics/user/google-login
 */
export const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error("Google Token is required");
    }

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
        if (!user.googleId) {
            user.googleId = googleId;
            if (!user.avatar) user.avatar = picture;
            await user.save();
        }
    } else {
        user = await User.create({
            username: name,
            email,
            googleId,
            avatar: picture,
            authProvider: "google",
            isVerified: true,
            password: crypto.randomBytes(20).toString('hex') + "Aa1!", // dummy password for google users
        });
    }

    const jwtToken = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: "Google Login successful",
        token: jwtToken,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider
        },
    });
});
