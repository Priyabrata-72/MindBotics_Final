import { Link } from "react-router-dom";
import { Star, BookOpen, Award } from "lucide-react";
import instructor1 from "@/assets/instructor-1.jpeg";
import instructor2 from  "@/assets/instructor-2.jpeg";
import instructor3 from "@/assets/instructor-3.jpeg";


const tutors = [
  {
    id: "iot-fundamentals",
    name: "Rudranarayan Shaoo",
    role: "IoT & Embedded Systems",
    image: instructor1,
    courses: 5,
    rating: 4.9,
    expertise: ["IoT", "Arduino", "Raspberry Pi"],
  },
  {
    id: "smart-home-automation",
    name: "Priya Saha",
    role: "Full Stack Developer",
    image: instructor2,
    courses: 4,
    rating: 4.8,
    expertise: ["Web Dev", "React", "Node.js"],
  },
  {
    id: "industrial-iot",
    name: "Shubham Mohapatra",
    role: "CEO & Founder at MindBrain Innovations pvt ltd",
    image: instructor3,
    courses: 3,
    rating: 4.9,
    expertise: ["IIoT", "SCADA", "Data Analytics"],
  },
];

const TutorsSection = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold uppercase tracking-wider text-sm">
            Our Tutors
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Learn From Industry Experts
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Our instructors bring years of real-world experience to help you master IoT and robotics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tutors.map((tutor) => (
            <Link
              key={tutor.id}
              to={`/instructor/${tutor.id}`}
              className="group bg-background rounded-2xl p-6 border border-border hover:border-primary hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={tutor.image}
                  alt={tutor.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all"
                />
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {tutor.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{tutor.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{tutor.courses} Courses</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{tutor.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {tutor.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-primary text-sm font-medium flex items-center gap-2">
                  View Profile
                  <Award className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TutorsSection;