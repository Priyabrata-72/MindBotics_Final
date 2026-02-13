import { Users, BookOpen, Code, Award, Headphones, Zap } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Experienced Mentors",
    description: "Learn from industry professionals with years of hands-on experience",
  },
  {
    icon: BookOpen,
    title: "Training Professionals",
    description: "Comprehensive curriculum designed by education experts",
  },
  {
    icon: Code,
    title: "Docs & Source Code",
    description: "Access to complete documentation and real project source codes",
  },
  {
    icon: Award,
    title: "Certified Courses",
    description: "Industry-recognized certifications upon course completion",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock assistance for all your learning needs",
  },
  {
    icon: Zap,
    title: "Hands-on Projects",
    description: "Build real IoT projects with practical applications",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent-foreground to-primary" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-background rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;