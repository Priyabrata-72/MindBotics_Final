import { Button } from "@/components/ui/button";
import { ArrowRight, Award, CheckCircle } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-24 bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-foreground/5 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-primary-foreground/30 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-primary-foreground/20 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full mb-8">
            <Award className="w-5 h-5 text-primary-foreground" />
            <span className="text-primary-foreground font-medium">
              Get Certified Today
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Get Your Quality Skills Certificate
          </h2>

          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of successful graduates and earn industry-recognized certifications that will boost your career in IoT and automation.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {["Industry Recognition", "Lifetime Access", "Job Placement Support"].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-primary-foreground">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            variant="hero"
            size="xl"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Button>

          {/* Form */}
          <div className="mt-12 max-w-md mx-auto">
            <p className="text-primary-foreground/70 mb-4">
              Or subscribe to our newsletter for updates
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/50"
              />
              <Button
                variant="hero"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;