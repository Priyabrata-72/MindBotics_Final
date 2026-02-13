import { Link } from "react-router-dom";
import { Linkedin, Twitter, Github, Award } from "lucide-react";

import instructor1 from "../assets/instructor-1.jpeg";
import instructor2 from "../assets/instructor-2.jpeg";
import instructor3 from "../assets/instructor-3.jpeg";
const teamMembers = [
  {
    id: "iot-fundamentals",
    name: "Rudranarayan Sahoo",
    role: "IoT & Embedded Systems",
    image: instructor1,
    bio: "3+ years of experience in IoT and embedded systems development",
    achievements: ["20+ IoT Projects", "5+ Papers", "Industry Expert"],
    social: {
      linkedin: "https://www.linkedin.com/in/rudranarayana-sahoo-245255345/",
      github: "https://github.com/Rudra-narayana22",
      twitter: "https://x.com/Rudranaray78536",
    },
  },
  {
    id: "smart-home-automation",
    name: "Priya Saha",
    role: "Full Stack Developer",
    image: instructor2,
    bio: "4+ years of experience building scalable web applications",
    achievements: [
      "IT/Coder Award-2024",
      "Team Leader Award - 2023",
      "Trained 200+ Students",
    ],
    social: {
      linkedin: "https://www.linkedin.com/in/priya-saha-88831b277/",
      github: "https://github.com/dev-priya-coder",
      twitter: "https://x.com/@Priya_Saha6948",
    },
  },
  {
    id: "industrial-iot",
    name: "Shubham Mohapatra",
    role: "Founder & CEO at MindBrain",
    image: instructor3,
    bio: "10+ years leading tech startups and innovation",
    achievements: [
      "20+ IoT Projects",
      "10+ Industry Projects",
      "5+ Papers",
      "Industry Expert",
    ],
    social: {
      linkedin: "https://www.linkedin.com/in/shubhambytes/",
      github: "https://github.com/shubham",
      twitter: "https://x.com/shubham",
    },
  },
];

/* ===============================
   COMPONENT
================================ */
const TeamSection = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold uppercase tracking-wider text-sm">
            Our Team
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Meet Our Expert Instructors
          </h2>
          <p className="text-muted-foreground text-lg">
            Learn from industry professionals with years of real-world experience.
            Click on any instructor to view their full profile.
          </p>
        </div>

        {/* TEAM GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            
            <Link
              key={member.id}
              to={`/instructor/${member.id}`}
              className="group bg-background rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
            >

              {/* IMAGE */}
              <div className="relative overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* SOCIAL ICONS */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}

                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}

                  {member.social.github && (
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {member.name}
                </h3>

                <p className="text-primary font-medium text-sm mb-2">
                  {member.role}
                </p>

                <p className="text-muted-foreground text-sm mb-4">
                  {member.bio}
                </p>

                {/* ACHIEVEMENTS */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {member.achievements.map((achievement, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs"
                    >
                      <Award className="w-3 h-3" />
                      {achievement}
                    </span>
                  ))}
                </div>

                <span className="text-primary text-sm font-medium">
                  View Full Profile →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;