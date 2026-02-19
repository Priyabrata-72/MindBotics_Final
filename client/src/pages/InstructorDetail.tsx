import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Award, BookOpen, Users, Star, ArrowLeft, Linkedin, Twitter } from "lucide-react";
import instructor1 from "../assets/instructor-1.jpeg";
import instructor2 from "../assets/instructor-2.jpeg";
import instructor3 from "../assets/instructor-3.jpeg";
import course1 from "@/assets/about-1.jpg";
import course5 from "@/assets/gallery-2.jpg";
import course3 from "@/assets/gallery4.jpeg";

const instructorsData: Record<string, {
  name: string;
  role: string;
  image: string;
  bio: string;
  fullBio: string;
  expertise: string[];
  achievements: string[];
  education: string[];
  courses: { id: string; title: string; image: string }[];
  socialLinks: { linkedin?: string; twitter?: string };
}> = {
  "iot-fundamentals": {
    name: "Rudranarayan Sahoo",
    role: "IoT & Embedded Systems Expert",
    image: instructor1,
    bio: "4+ years of experience in IoT and embedded systems.",
    fullBio: "Rudranarayan Sahoo is an experienced IoT and embedded systems expert with over 4 years in the industry. He has worked on numerous projects involving sensor integration, microcontroller programming, and IoT architecture design. Rudranarayan is passionate about sharing his knowledge and helping students build practical skills in IoT development.",
    expertise: ["IoT", "Embedded Systems", "Arduino", "Raspberry Pi", "Sensor Integration"],
    achievements: [
      "Developed 20+ IoT Projects",
      "Published 5 Research Papers",
      "Speaker at IoT Conferences",
      "Mentored 100+ Students"
    ],
    education: [
      "B.Tech Electrical Engineering - ABIT Cuttack.",
      "Auto CAD Certified Professional - CTTC Cuttack",
      "TPCODL certified Professional - TPCODL Odisha"
      
    ],
    courses: [
      { id: "iot-fundamentals", title: "IoT Fundamentals & Sensor Integration", image: course1 },
      { id: "drone-development", title: "Autonomous Drone Development", image: course5 }
    ],
    socialLinks: { linkedin: "https://www.linkedin.com/in/rudranarayana-sahoo-245255345/", twitter: "https://x.com/Rudranaray78536" }
  },
  "smart-home-automation": {
    name: "Priya Saha",
    role: "Full Stack Developer",
    image: instructor2,
    bio: "4+ years of experience building scalable web applications.",
    fullBio: "Priya Saha is a skilled full stack developer with over 4 years of experience in building scalable web applications. She has a strong background in both front-end and back-end technologies, specializing in React, Node.js, and database management. Priya has contributed to several high-profile projects and is passionate about teaching others how to create efficient and user-friendly applications.",
    expertise: ["Web Development", "React", "Node.js", "Database Management", "UI/UX Design" ,"Full Stack Development"],
    achievements: [
      "IT/Coder Award-2024",
      "Team Leader Award - 2023",
      "Trained 200+ Students",
      "Developed 10+ Full Stack Applications"
    ],
    education: [
      "B.Tech Computer Science - Rajhdhani college bhubneswar",
      "Certified Full Stack Developer - IBM",
      "AWS Certified Developer - AWS",

    ],
    courses: [
      { id: "industrial-iot", title: "Master in Web Development", image: course3 },
    ],
    socialLinks: { linkedin: "https://www.linkedin.com/in/priya-saha-88831b277/", twitter: "https://x.com/@Priya_Saha6948" }
  },
  "industrial-iot": {
    name: "Shubham Mohapatra",
    role: "Founder & CEO at MindBrain",
    image: instructor3,
    bio: "Industrial automation specialist with experience at Tesla and Siemens.",
    fullBio: "A technology-driven entrepreneur and software professional with a strong background in computer science. Founder and CEO of MindBrain, focused on delivering innovative digital and tech-enabled solutions. Passionate about building scalable applications, bridging academic knowledge with real-world implementation, and leading teams to create impactful, future-ready products.",
    expertise: ["Web & App Development", "Mobile Application Development", "Cloud & SaaS Solutions", "IT Consulting", "Project Management" , "IT Consulting" ,"Project Management"],
    achievements: [
      "Founder & CEO",
      "Startup Leadership",
      "Strategic Planning",
      "Team & Project Management",
      "Business Growth"
    ],
    education: [
      "MS Industrial Engineering - Georgia Tech",
      "BS Mechanical Engineering - Michigan",
      "Siemens Certified Professional"
    ],
    courses: [
      { id: "industrial-iot", title: "Industrial IoT & Data Analytics", image: course3 },
      { id: "iot-fundamentals", title: "Edge AI & TinyML", image: course1 }
    ],
    socialLinks: { linkedin: "https://www.linkedin.com/in/shubhambytes/", twitter: "#" }
  }
};

const InstructorDetail = () => {
  const { instructorId } = useParams();
  const instructor = instructorsData[instructorId || "iot-fundamentals"];

  if (!instructor) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Instructor Not Found</h1>
          <Link to="/about">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to About
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageBanner
        title={instructor.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: instructor.name },
        ]}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card p-6 rounded-2xl border border-border text-center">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-40 h-40 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/20"
                  />
                  <h2 className="text-2xl font-bold text-foreground">{instructor.name}</h2>
                  <p className="text-primary font-medium">{instructor.role}</p>
                  
                  <div className="flex justify-center gap-3 mt-4">
                    {instructor.socialLinks.linkedin && (
                      <a href={instructor.socialLinks.linkedin} className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {instructor.socialLinks.twitter && (
                      <a href={instructor.socialLinks.twitter} className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="bg-card p-6 rounded-2xl border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Education
                  </h3>
                  <ul className="space-y-3">
                    {instructor.education.map((edu, index) => (
                      <li key={index} className="text-muted-foreground text-sm flex items-start gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-card p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{instructor.fullBio}</p>
              </div>

              {/* Expertise */}
              <div className="bg-card p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-primary" />
                  Areas of Expertise
                </h2>
                <div className="flex flex-wrap gap-3">
                  {instructor.expertise.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-card p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Achievements
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {instructor.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-foreground">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courses
              <div className="bg-card p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Courses by {instructor.name.split(' ')[0]}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {instructor.courses.map((course, index) => (
                    <Link key={index} to={`/course/${course.id}`} className="group">
                      <div className="bg-accent/50 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                        <img src={course.image} alt={course.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                        <div className="p-4">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{course.title}</h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InstructorDetail;