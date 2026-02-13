import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";
import dev4 from "@/assets/dev4.jpg";
import dev3 from "@/assets/dev3.jpg";
import dev1 from "@/assets/dev1.jpg";
import dev2 from "@/assets/dev2.png";
// improt gallery3 from "@/assets/gallery3.png";
import gallery4 from "@/assets/gallery4.jpeg";
import gallery5 from "@/assets/gallery5.png";
import gallery6 from "@/assets/gallery6.jpeg";
import gallery7 from "@/assets/gallery7.jpeg";


const allImages = [
  { src: gallery5, alt: "Annual tech fest", category: "Events" },
  { src: gallery1, alt: "Students collaborating on robotics project", category: "Lab" },
  { src: gallery2, alt: "IoT sensors and Arduino boards on workshop desk", category: "Workshop" },
  { src: about1, alt: "Instructor teaching IoT programming", category: "Classroom" },
  { src: about2, alt: "Hands-on learning with microcontrollers", category: "Lab" },
  // { src: course1, alt: "Students building smart home devices", category: "Projects" },
  // { src: course2, alt: "Robotics competition preparation", category: "Events" },
  // { src: dev4, alt: "Industrial IoT demonstration", category: "Lab" },
  // { src: dev3, alt: "Student presentation day", category: "Events" },
  // { src: dev1, alt: "Workshop on embedded systems", category: "Workshop" },
  // { src: dev2, alt: "Graduation ceremony", category: "Events" },
  { src: gallery1, alt: "Advanced robotics lab", category: "Lab" },
  { src: gallery2, alt: "Sensor integration workshop", category: "Workshop" },
  // { src: gallery3, alt: "Students programming microcontrollers", category: "Classroom" },
  { src: gallery4, alt: "Building IoT prototypes", category: "Projects" },
  { src: gallery6, alt: "Tech symposium event", category: "Events" },
  { src: gallery7, alt: "Collaborative learning environment", category: "Classroom" },

  
];

const Gallery = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageBanner
        title="Gallery"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery" },
        ]}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">
              Our Moments
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Experience Our Learning Environment
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Take a visual tour of our state-of-the-art facilities, workshops, and memorable moments from our learning community.
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
                  index === 0 || index === 5 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    index === 0 || index === 5 ? "h-full min-h-[300px] md:min-h-[400px]" : "h-48 md:h-56"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-primary-foreground/80 text-xs uppercase tracking-wider mb-1">
                    {image.category}
                  </span>
                  <p className="text-primary-foreground font-medium text-sm md:text-base">
                    {image.alt}
                  </p>
                </div>
                {/* Corner decoration */}
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
