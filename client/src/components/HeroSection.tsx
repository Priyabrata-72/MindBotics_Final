import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
const HeroSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroBg})`
    }}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      </div>

      {/* Decorative Shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" style={{
      animationDelay: "1s"
    }} />
      <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-primary-foreground rounded-full animate-bounce" />
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-accent-foreground rounded-full animate-bounce" style={{
      animationDelay: "0.5s"
    }} />


      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-block px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full mb-6">
            <span className="text-primary-foreground text-sm font-medium">🚀 Welcome to MindBotics </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Welcome to{" "}
            <span className="text-[#c1a2ff] "> MindBotics</span>
          </h1>
 
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-2xl">
            Innovating with Smart IoT Solutions. Learn cutting-edge technology with hands-on projects and expert mentorship.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="xl" onClick={() => scrollToSection("#courses")}>
              Find Courses
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" size="xl" onClick={() => scrollToSection("#about")}>
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats Preview */}
          <div className="mt-16 flex flex-wrap gap-8">
            <div className="text-primary-foreground">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-primary-foreground/70 text-sm">Active Students</div>
            </div>
            <div className="text-primary-foreground">
              <div className="text-3xl font-bold">20+</div>
              <div className="text-primary-foreground/70 text-sm">Expert Courses</div>
            </div>
            <div className="text-primary-foreground">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-primary-foreground/70 text-sm">Certifications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary-foreground/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>;
};
export default HeroSection;