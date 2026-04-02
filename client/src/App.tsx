import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loader from "./components/Loader";
import Index from "./pages/Index";
import About from "./pages/About";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import InstructorDetail from "./pages/InstructorDetail";
import Projects from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Printing from "./pages/Shop";
import ThreeDDetails from "./pages/ThreeDDetails";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import FeedbackForm from "./components/feedback";
import ScrollToTop from "./components/ScrollToTop";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import ProjectManagement from "./pages/admin/ProjectManagement";
import ContactUserManagement from "./pages/admin/ContactUserManagement";
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import ThreeDManagement from "./pages/admin/ThreeDManagement";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loader after a short delay for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isLoading && <Loader />}
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Routes>
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="projects" element={<ProjectManagement />} />
                <Route path="contacts" element={<ContactUserManagement />} />
                <Route path="shop" element={<ThreeDManagement />} />
              </Route>

              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/instructor/:instructorId" element={<InstructorDetail />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/3d" element={<Printing />} />
              <Route path="/3d/:productId" element={<ThreeDDetails />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/feedback" element={<FeedbackForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* User Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;