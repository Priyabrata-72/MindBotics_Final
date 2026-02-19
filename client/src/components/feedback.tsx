import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import feedbackImage from "@/assets/feedback.svg";
import logo from "../assets/mindbotics-logo.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  rating: "",
  feedback: "",
};

const Feedback = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/api/feedback", formData);

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "Thank you 🙌",
          description: "Your feedback has been submitted successfully!",
        });

        setFormData(INITIAL_FORM_DATA);
      } else {
        throw new Error("Submission failed");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.response?.data?.error ||
          err.message ||
          "Failed to submit feedback",
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

          {/* IMAGE SECTION */}
          <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-[#f3f6ff] to-[#f8f1ff] p-10">
            <img src={feedbackImage} className="max-w-sm" />
          </div>

          {/* FORM SECTION */}
          <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md bg-transparent border-none">
              <CardHeader className="text-center">
                <img src={logo} className="h-16 mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-indigo-600">
                  Student Feedback
                </CardTitle>
                <CardDescription>
                  Your feedback helps us improve your learning experience
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Name */}
                  <div>
                    <Label>Name</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <Label>Overall Rating</Label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      required
                      className="w-full border rounded-md p-2 bg-background focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="">Select rating</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label>Feedback</Label>
                    <textarea
                      name="feedback"
                      value={formData.feedback}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Share your experience..."
                    />
                  </div>

                  <Button className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Feedback"}
                  </Button>

                  {/* <p className="text-sm text-center text-gray-600">
                    Go to{" "}
                    <Link
                      to="/"
                      className="text-indigo-600 font-medium hover:underline"
                    >
                      Home
                    </Link>
                  </p> */}

                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;
