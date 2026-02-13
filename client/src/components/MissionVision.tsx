import { Target, Eye, Heart, Lightbulb } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To democratize technology education by providing accessible, high-quality training in IoT, robotics, and emerging technologies to learners worldwide.",
    color: "bg-primary",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To become the global leader in practical technology education, empowering individuals to build the connected future.",
    color: "bg-primary",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "Innovation, integrity, inclusivity, and excellence guide everything we do. We believe in learning by doing and supporting our community.",
    color: "bg-primary",
  },
  {
    icon: Lightbulb,
    title: "Our Approach",
    description:
      "Hands-on projects, real-world applications, and mentorship from industry experts ensure our students are job-ready from day one.",
    color: "bg-primary",
  },
];

const MissionVision = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold uppercase tracking-wider text-sm">
            Who We Are
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Mission, Vision & Values
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, index) => (
            <div
              key={index}
              className="group bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center border border-border/50"
            >
              <div
                className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
              >
                <item.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVision;