import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.MAX_AUTH_ATTEMPTS || 5),
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});


export const otpLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: Number(process.env.MAX_OTP_ATTEMPTS), // max OTP requests per window
  message: 'OTP request limit exceeded. Please wait before requesting again.',
  standardHeaders: true,
  legacyHeaders: false,
});
