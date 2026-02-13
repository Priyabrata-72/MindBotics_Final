import { Link } from "react-router-dom";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";
import seeMore from "@/assets/see-more.png";

const images = [
  { src: gallery1, alt: "Students collaborating on robotics project" },
  { src: gallery2, alt: "IoT sensors and Arduino boards on workshop desk" },
  { src: about1, alt: "Instructor teaching IoT programming" },
  { src: about2, alt: "Hands-on learning with microcontrollers" },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 bg-card relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/50 rounded-full blur-2xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-accent rounded-full mb-4">
            <span className="text-accent-foreground text-sm font-semibold">
              Project Life
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Experience Our Learning Environment
          </h2>
          <p className="text-muted-foreground text-lg">
            Get a glimpse of our state-of-the-art facilities and hands-on learning approach
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl group ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                  index === 0 ? "h-full min-h-[400px]" : "h-48 md:h-56"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-primary-foreground font-medium">
                  {image.alt}
                </p>
              </div>
              {/* Corner decoration */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
          
          {/* See More Card */}
          <Link 
            to="/gallery" 
            className="relative overflow-hidden rounded-2xl group cursor-pointer"
          >
            <img
              src={seeMore}
              alt="See more images"
              className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-primary/20 flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">
                See More
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;