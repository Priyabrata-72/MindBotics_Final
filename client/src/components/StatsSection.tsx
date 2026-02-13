import { useEffect, useState, useRef } from "react";
import { GraduationCap, BookCheck, ThumbsUp, Users } from "lucide-react";

const stats = [
  {
    icon: GraduationCap,
    target: 500,
    suffix: "+",
    label: "Students Enrolled",
  },
  {
    icon: BookCheck,
    target: 20,
    suffix: "+",
    label: "Classes Completed",
  },
  {
    icon: ThumbsUp,
    target: 98,
    suffix: "%",
    label: "Satisfaction Rate",
  },
  {
    icon: Users,
    target: 15,
    suffix: "+",
    label: "Top Instructors",
  },
];

const StatsSection = () => {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateNumbers();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateNumbers = () => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCounts(
        stats.map((stat) => Math.floor(stat.target * easeOutQuart))
      );

      if (currentStep >= steps) {
        clearInterval(interval);
        setCounts(stats.map((stat) => stat.target));
      }
    }, stepDuration);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-primary relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-primary-foreground rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-primary-foreground rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 border-2 border-primary-foreground rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Our Achievements
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            Join thousands of successful students who have transformed their careers through our programs
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl hover:bg-primary-foreground/20 transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                {counts[index].toLocaleString()}
                {stat.suffix}
              </div>
              <div className="text-primary-foreground/80 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
