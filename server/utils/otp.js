import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateOtp = () => {
  return crypto.randomInt(1000, 9999).toString(); // 4-digit OTP
};

export const hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10); // Faster than password hashing
};
