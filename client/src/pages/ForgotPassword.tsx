import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

import mindBoticsLogo from "@/assets/mindbotics-logo.jpeg";
import forgotPasswordImage from "@/assets/forgot-password.jpeg";

const ForgotPassword: React.FC = () => {
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [timer, setTimer] = useState(60);

  /* OTP TIMER */
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  /* STEP 1 – SEND OTP */
  const handleSendOtp = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.post("/user/forgot-password", { email });
      const data = res.data;

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(data.error || "Failed to send OTP");
      }

      toast({
        title: "OTP Sent",
        description: "Check your email for the OTP",
      });

      setTimer(60);
      setStep(2);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* RESEND OTP */
  const handleResendOtp = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.post("/user/resend-reset-otp", { email });
      const data = res.data;

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email",
      });

      setTimer(60);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* STEP 2 – VERIFY OTP */
  const handleVerifyOtp = () => {
    if (!otp) {
      toast({
        title: "OTP Required",
        description: "Please enter the OTP sent to your email",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "OTP Entered",
      description: "Please reset your password",
    });

    setStep(3);
  };

  /* STEP 3 – RESET PASSWORD */
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/user/reset-password", {
        email,
        otp,
        newPassword,
      });
      const data = res.data;

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(data.error || "Reset failed");
      }

      toast({
        title: "Success",
        description: "Password reset successfully",
      });

      setStep(4);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#f5e9ff] to-[#fff1f2]">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
          
          {/* LEFT IMAGE */}
          <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-[#f3f6ff] to-[#f8f1ff] p-10">
            <img
              src={forgotPasswordImage}
              alt="Forgot Password"
              className="max-w-sm drop-shadow-xl"
            />
          </div>

          {/* RIGHT FORM */}
          <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md border-none shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <img src={mindBoticsLogo} alt="MindBotics" className="h-16" />
                </div>

                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] bg-clip-text text-transparent">
                  Forgot Password
                </CardTitle>

                <CardDescription className="text-gray-600">
                  Secure 4-step password recovery
                </CardDescription>
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="Enter registered email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
                      >
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label>OTP</Label>
                        <Input
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </div>

                      <div className="text-sm text-gray-500 text-center">
                        {timer > 0 ? (
                          <p>Resend OTP in {timer}s</p>
                        ) : (
                          <button
                            onClick={handleResendOtp}
                            disabled={loading}
                            className="text-indigo-600 hover:underline font-medium"
                          >
                            {loading ? "Resending..." : "Resend OTP"}
                          </button>
                        )}
                      </div>

                      <Button
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>
                    </motion.div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Confirm Password</Label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
                      >
                        {loading ? "Updating..." : "Reset Password"}
                      </Button>
                    </motion.div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-4"
                    >
                      <div className="text-green-600 text-lg font-semibold">
                        ✅ Password Reset Completed
                      </div>

                      <Link
                        to="/login"
                        className="text-indigo-600 hover:underline"
                      >
                        Go to Login
                      </Link>
                    </motion.div>
                  )}

                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
