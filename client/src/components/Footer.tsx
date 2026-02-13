import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
} from "lucide-react";
import mindBoticsLogo from "@/assets/mindbotics-logo.png";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-gradient-to-b from-foreground to-[#0b0b0b] text-background">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Brand */}
          <div>
            {/* <img src={mindBoticsLogo} alt="MindBotics" className="h-16 mb-6" /> */}

            <p className="text-background/70 leading-relaxed mb-6 max-w-md">
              MindBotics, a product of{" "}
              <span className="text-background font-medium">
                MindBrain Innovations Pvt. Ltd.
              </span>
              , is building the future of education and innovation through IoT,
              robotics, and intelligent digital solutions.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex gap-3 text-background/70">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  DCB-902, DLF CYBER CITY, Chandaka Industrial Estate, Patia, Bhubaneswar, Odisha 751024
                </span>
              </div>

              <div className="flex gap-3 text-background/70">
                <Mail className="w-5 h-5 text-primary" />
                <a
                  href="mailto:careers@mindbrain.co.in"
                  className="hover:text-primary transition"
                >
                  careers@mindbrain.co.in
                </a>
              </div>

              <div className="flex gap-3 text-background/70">
                <Phone className="w-5 h-5 text-primary" />
                <a
                  href="tel:+919178587486"
                  className="hover:text-primary transition"
                >
                  +91 9178587486
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-12">
            
            {/* Explore */}
            <div>
              <h4 className="text-lg font-semibold mb-5 tracking-wide">
                Explore
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-background/65 hover:text-primary transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="text-background/65 hover:text-primary transition">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="text-background/65 hover:text-primary transition">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-background/65 hover:text-primary transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learning */}
            <div>
              <h4 className="text-lg font-semibold mb-5 tracking-wide">
                Learning
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/courses?category=iot" className="text-background/65 hover:text-primary transition">
                    IoT Bootcamps
                  </Link>
                </li>
                <li>
                  <Link to="/courses?category=robotics" className="text-background/65 hover:text-primary transition">
                    Robotics
                  </Link>
                </li>
                <li>
                  <Link to="/courses?category=web" className="text-background/65 hover:text-primary transition">
                    Web Dev
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="text-background/65 hover:text-primary transition">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Stay Connected</h4>

            <p className="text-background/70 mb-6">
              Get updates on new courses, workshops, and tech events.
            </p>

            <div className="flex gap-2 mb-8">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-foreground/50 focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                onClick={() => navigate("/feedback")}
                className="bg-primary text-primary-foreground px-5 rounded-lg font-medium hover:opacity-90 transition"
              >
                Join
              </button>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
              >
                <Twitter className="w-5 h-5" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-6 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} MindBotics IT_Team , All rights reserved. 
          </p>

          <div className="flex gap-6 text-sm text-background/50">
            <Link to="/privacy-policy" className="hover:text-primary transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
