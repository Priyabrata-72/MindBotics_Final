import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import logo from "../assets/mindbotics-logo.jpg";
import signupImage from "@/assets/signup.svg";

const Signup = () => {
  const [step, setStep] = useState(1);

  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 👁 password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();

  /* STEP 1: SIGNUP */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/user/signup", { username, email, password });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Signup failed");
      }

      toast({
        title: "OTP Sent 📧",
        description: "Check your email to verify your account",
      });

      setStep(2);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Signup failed";

      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* STEP 2: VERIFY OTP */
  const handleVerifyOtp = async () => {
    if (!otp) return;

    setIsLoading(true);

    try {
      const res = await api.post("/user/verify-otp", { email, otp });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Invalid OTP");
      }

      toast({
        title: "Success ✅",
        description: "Account verified successfully",
      });

      setStep(3);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Verification failed";

      toast({
        title: "OTP Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#f5e9ff] to-[#fff1f2]">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden">

          {/* IMAGE */}
          <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-[#f3f6ff] to-[#f8f1ff] p-10">
            <img src={signupImage} className="max-w-sm" />
          </div>

          {/* FORM */}
          <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md bg-transparent border-none">
              <CardHeader className="text-center">
                <img src={logo} className="h-16 mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-indigo-600">
                  {step === 1 && "Create Account"}
                  {step === 2 && "Verify OTP"}
                  {step === 3 && "Account Verified 🎉"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Join MindBotics today"}
                  {step === 2 && "Enter OTP sent to your email"}
                  {step === 3 && "You can now login"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                {step === 1 && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <Input
                      placeholder="Full Name"
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                    />

                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Password */}
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={agreeTerms}
                        onCheckedChange={(v) => setAgreeTerms(v === true)}
                      />
                      <Label className="text-sm text-gray-600">
                        I agree to{" "}
                        <Link
                          to="/terms"
                          className="text-indigo-600 hover:underline"
                        >
                          Terms
                        </Link>{" "}
                        &{" "}
                        <Link
                          to="/privacy"
                          className="text-indigo-600 hover:underline"
                        >
                          Privacy
                        </Link>
                      </Label>
                    </div>

                    <Button className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending OTP..." : "Create Account"}
                    </Button>

                    <p className="text-sm text-center mt-6 text-gray-600">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </form>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button
                      onClick={handleVerifyOtp}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                )}

                {step === 3 && (
                  <div className="text-center space-y-4">
                    <p className="text-green-600 font-semibold">
                      ✅ Your account has been verified And Created Successfully!
                    </p>
                    <Link
                      to="/login"
                      className="text-indigo-600 hover:underline"
                    >
                      Go to Login
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
