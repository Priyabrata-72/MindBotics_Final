import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import logo from "../assets/mindbotics-logo.jpg";
import login1 from "@/assets/login_1.png";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 👁 password visibility
  const [showPassword, setShowPassword] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/user/login", { email, password });
      const data = response.data;

      const userData = {
        id: data.user?.id || data.user?._id,
        username: data.user?.username || data.user?.name || "User",
        email: data.user?.email || email,
        role: data.user?.role || "user",
        photoUrl:
          data.user?.photoUrl ||
          data.user?.avatar ||
          "https://placehold.co/120x120?text=User",
        avatar: data.user?.avatar,
      };

      login(userData, data.token);

      toast({
        title: "Login Successful",
        description: "Welcome back to MindBotics!",
      });

      setTimeout(() => {
        setIsLoading(false);
        navigate("/");
      }, 1200);
    } catch (error: any) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to connect to server";

      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });

      setIsLoading(false);
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
              src={login1}
              alt="Login"
              className="max-w-sm drop-shadow-xl"
            />
          </div>

          {/* RIGHT FORM */}
          <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md border-none shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <img src={logo} alt="MindBotics" className="h-16" />
                </div>

                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>

                <CardDescription className="text-gray-600">
                  Login to your MindBotics account
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Password with Eye */}
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="pr-10 focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </Link>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 transition-all shadow-md"
                  >
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                </form>

                <p className="text-sm text-center mt-6 text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </p>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
