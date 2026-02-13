import { useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import api from "@/lib/api";

const contactInfo = [
  {
    icon: MapPin,
    title: "Our Location",
    details: [
      "DCB-902, DLF CYBER CITY, Chandaka Industrial Estate, Patia, Bhubaneswar, Odisha 751024 India 🇮🇳",
    ],
  },
  {
    icon: Phone,
    title: "Phone Number",
    details: ["+91 9178587486"],
  },
  {
    icon: Mail,
    title: "Email Address",
    details: ["careers@mindbrain.co.in", "support@mindbotics.com"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Fri: 9:00 AM - 6:00 PM"],
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ Name should not be numeric
    if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      toast({
        title: "Invalid Name",
        description: "Name can only contain letters and spaces. Numbers are not allowed.",
      });
      return;
    }

    // ✅ Phone number must be exactly 10 digits (if provided)
    if (formData.phone) {
      const phone = formData.phone.trim();

      // Must start with 6-9 and be 10 digits
      const validFormat = /^[6-9]\d{9}$/.test(phone);

      // Prevent all digits same like 0000000000, 1111111111
      const notAllSame = !/^(\d)\1{9}$/.test(phone);

      if (!validFormat || !notAllSame) {
        toast({
          title: "Invalid Phone Number",
          description:
            "Enter a valid 10-digit mobile number",
        });
        return;
      }
    }

    try {
      const res = await api.post("/api/contact", formData);
      const data = res.data;

      if (data.success) {
        toast({
          title: "Message Sent!",
          description: "We'll get back to you as soon as possible.",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        title: "Server Error",
        description: "Please try again later",
      });
    }
  };


  return (
    <div className="min-h-screen">
      <Navbar />

      <PageBanner
        title="Contact Us"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">
                MindBotics
              </span>
              <h2 className="text-3xl font-bold text-foreground mt-2 mb-6">
                MindBrain Innovations Pvt. Ltd.
              </h2>
              <p className="text-muted-foreground mb-8">
                We’re a forward-thinking technology company headquartered in
                Bhubaneswar, Odisha, India, specializing in building intelligent
                and connected solutions using emerging technologies, with a
                strong focus on the Internet of Things (IoT).
              </p>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h4>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-muted-foreground text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="bg-card p-8 rounded-2xl shadow-lg border border-border/50"
              >
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Send Us a Message
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter Your Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter Your Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter Your Phone no."
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <Input
                      type="text"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Message
                  </label>
                  <Textarea
                    placeholder="Write your message here..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 bg-muted">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3740.8190918153578!2d85.80517437469663!3d20.34909091077651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909525dd71d6b%3A0xcdfa48116cf16775!2sMindBrain%20Innovations%20Private%20Limited%20(Custom%20Software%20Development%2C%20IT%20Staffing%2C%20AI_IOT_Robotics%20Training%20and%20Research%20Hub)!5e0!3m2!1sen!2sin!4v1768546152040!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="MindBotics Location"
        />
      </section>

      <Footer />
    </div>
  );
};

export default Contact;