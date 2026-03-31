import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import logo from "../assets/mindbotics-logo.svg";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Courses", href: "/courses" },
  { name: "Projects", href: "/projects" },
  { name: "3D Design", href: "/3d" },
  { name: "Contact Us", href: "/contact" },
  { name: "Feedback", href: "/feedback" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth(); // Use AuthContext

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-[rgb(245,245,245)]/95 backdrop-blur-md shadow-lg"
        : "bg-[rgb(245,245,245)]"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="MindBotics"
              className="h-12 w-auto"
            />
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium transition hover:scale-105 ${location.pathname === link.href
                  ? "text-primary"
                  : "text-black"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* DESKTOP RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="bg-black text-white" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-black/10"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="lg:hidden p-2 text-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card rounded-lg shadow-lg p-4 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-3 px-4 hover:bg-accent rounded-md"
              >
                {link.name}
              </Link>
            ))}

            {!isAuthenticated ? (
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" className="flex-1" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="flex-1 bg-black text-white" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 border-t pt-4 space-y-2">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-accent rounded-md"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-accent rounded-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;