import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import MissionVision from "@/components/MissionVision";
import WhyChooseUs from "@/components/WhyChooseUs";
import TeamSection from "@/components/TeamSection";
import FAQSection from "@/components/FAQSection";
import StatsSection from "@/components/StatsSection";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <PageBanner
        title="About Us"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About Us" },
        ]}
      />

      {/* About Company Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={about1}
                  alt="MindBotics IoT Lab"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                />
                <img
                  src={about2}
                  alt="Students learning robotics"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover mt-8"
                />
              </div>
              {/* Experience Badge */}
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl">
                <span className="text-4xl font-bold">5+</span>
                <p className="text-sm">Years Experience</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">
                About MindBotics
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                Shaping the Future with Smart IoT & Robotics Solutions
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                MindBotics specialize in creating cutting-edge IoT and robotics solutions that transform everyday experiences. By integrating smart devices and automation, we empower businesses and individuals to achieve efficiency, innovation, and a connected future.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our approach combines advanced technology with practical applications, designing intelligent systems that solve real-world problems. From smart automation to IoT-enabled devices, we bring ideas to life, making technology accessible, innovative, and future-ready.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Committed to shaping a smarter tomorrow, we develop solutions that connect people, processes, and machines seamlessly. Our smart IoT and robotics innovations drive progress, enhance productivity, and create sustainable, intelligent environments for a better world.
              </p>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Future-Ready Skills</h4>
                    <p className="text-sm text-muted-foreground">Focused on innovation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Hands-On Learning</h4>
                    <p className="text-sm text-muted-foreground">Practical exposure through real devices</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Industry-Relevant Skills</h4>
                    <p className="text-sm text-muted-foreground">Students gain practical skills</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Project-Based Learning</h4>
                    <p className="text-sm text-muted-foreground">Learning through real projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MissionVision />
      <WhyChooseUs />
      {/* <TeamSection /> */}
      <FAQSection />
      <StatsSection />
      {/* <FaqPage /> */}
      <Footer />
    </div>
  );
};

export default About;
