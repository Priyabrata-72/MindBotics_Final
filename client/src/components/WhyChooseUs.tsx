import { CheckCircle, Award, Users, BookOpen, Headphones, Zap } from "lucide-react";

const reasons = [
  {
    icon: CheckCircle,
    title: "Industry-Recognized Certifications",
    description: "Earn certificates valued by top tech companies worldwide",
  },
  {
    icon: Award,
    title: "Expert-Led Training",
    description: "Learn from professionals with real-world experience",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Join a network of 500+ learners and professionals",
  },
  {
    icon: BookOpen,
    title: "Comprehensive Curriculum",
    description: "From basics to advanced topics in IoT and robotics",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Get help whenever you need it from our support team",
  },
  {
    icon: Zap,
    title: "Hands-On Projects",
    description: "Build real projects that you can add to your portfolio",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
              The Best Platform for Learning IoT & Robotics
            </h2>
            <p className="text-muted-foreground mb-8">
              We provide comprehensive training programs designed to help you master the skills needed in today's tech-driven world. Our courses combine theory with practical applications.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <reason.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{reason.title}</h4>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="group bg-card p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <reason.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h4 className="font-bold text-foreground mb-2">{reason.title}</h4>
                <p className="text-sm text-muted-foreground">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;