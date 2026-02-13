import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import about1 from "@/assets/about1.jpeg";
import about2 from "@/assets/about-2.jpeg";

const benefits = [
  "Hands-on IoT training with real hardware",
  "Industry-oriented curriculum and projects",
  "Smart systems using sensors and automation",
  "Embedded systems and microcontroller programming",
  "Cloud connectivity and real-time data monitoring",
  "Skill development for future technology careers",
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-accent/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={about1}
                alt="IoT instructor teaching students in a modern classroom"
                className="rounded-2xl shadow-2xl w-full max-w-md"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 z-20 hidden md:block">
              <img
                src={about2}
                alt="Students working on IoT projects with sensors and microcontrollers"
                className="rounded-2xl shadow-2xl w-72 border-4 border-background"
              />
            </div>
            {/* Decorative shape */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary rounded-2xl -z-10" />
            <div className="absolute -bottom-4 right-20 w-16 h-16 bg-accent-foreground rounded-full -z-10" />
          </div>

          {/* Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-accent rounded-full mb-4">
              <span className="text-accent-foreground text-sm font-semibold">
                About Us
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Driving Innovation Through IoT Education
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              We are a technology-focused platform committed to delivering high-quality Internet of Things (IoT) education through practical learning and innovation. Our goal is to equip students and professionals with industry-relevant skills by combining hands-on projects, modern tools, and real-world applications. We believe in learning by building, experimenting, and solving real problems through smart and connected technologies.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <Link to="/about">
              <Button size="lg">
                Learn More About Us
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;