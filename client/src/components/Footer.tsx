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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Footer = () => {
  const navigate = useNavigate();

  const PrivacyPolicyContent = () => (
    <div className="space-y-4 text-sm text-foreground/80 overflow-y-auto max-h-[60vh] pr-4">
      <p>Your privacy is important to us. This Privacy Policy explains how MindBotics collects, uses, and protects your personal information.</p>
      <h3 className="font-bold text-foreground">Data Collection & Usage</h3>
      <p>We collect information you provide directly to us, such as when you create an account, enroll in a course, or contact us for support. This includes your name, email address, and payment information.</p>
      <h3 className="font-bold text-foreground">User Privacy Protection</h3>
      <p>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.</p>
      <h3 className="font-bold text-foreground">Cookies Usage</h3>
      <p>We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction.</p>
      <h3 className="font-bold text-foreground">Third-party Tools</h3>
      <p>We may use third-party tools to help us provide our services. These third parties have access to your personal information only to perform specific tasks on our behalf.</p>
      <h3 className="font-bold text-foreground">Security Practices</h3>
      <p>We follow industry standards to protect the personal information submitted to us, both during transmission and once we receive it.</p>
    </div>
  );

  const TermsOfServiceContent = () => (
    <div className="space-y-4 text-sm text-foreground/80 overflow-y-auto max-h-[60vh] pr-4">
      <p>Welcome to MindBotics. By using our platform, you agree to the following terms and conditions.</p>
      <h3 className="font-bold text-foreground">Acceptable Platform Usage</h3>
      <p>You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the platform.</p>
      <h3 className="font-bold text-foreground">Account Responsibility</h3>
      <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>
      <h3 className="font-bold text-foreground">Course Access Rules</h3>
      <p>Access to courses is granted upon successful enrollment and payment. Sharing account access with others is strictly prohibited.</p>
      <h3 className="font-bold text-foreground">Refund Conditions</h3>
      <p>Refunds are available within 7 days of purchase if less than 20% of the course content has been accessed.</p>
      <h3 className="font-bold text-foreground">Intellectual Property Rights</h3>
      <p>All content on the platform, including text, graphics, logos, and software, is the property of MindBotics or its content suppliers and is protected by international copyright laws.</p>
    </div>
  );

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
                  <Link to="/3d" className="text-background/65 hover:text-primary transition">
                    3D Design
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
            <Dialog>
              <DialogTrigger className="hover:text-primary transition">
                Privacy Policy
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                </DialogHeader>
                <PrivacyPolicyContent />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger className="hover:text-primary transition">
                Terms of Service
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                </DialogHeader>
                <TermsOfServiceContent />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
