import { useState } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

const testimonials = [
  {
    image: testimonial1,
    name: "Rahul Shinha",
    role: "IoT Student",
    quote: "MindBotics helped me understand IoT concepts from scratch. The classes were easy to follow and very practical. I gained confidence in building real IoT projects through hands-on learning.",
    rating: 5,
  },
  {
    image: testimonial2,
    name: "Janvi Mehta",
    role: "Information Technology Student",
    quote: "As a student, this course was very helpful for me. The instructors explained every topic clearly and supported us whenever we faced doubts. The projects improved my technical skills a lot.",
    rating: 4,
  },
  {
    image: testimonial3,
    name: "Ankit Verma",
    role: "Smart Home & IoT Enthusiast",
    quote: "I had no prior technical background, but MindBotics made learning simple and interesting. The practical sessions and guidance helped me build confidence and understand real-world applications.",
    rating: 4,
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <Quote className="absolute top-20 left-20 w-64 h-64 text-primary" />
        <Quote className="absolute bottom-20 right-20 w-48 h-48 text-primary rotate-180" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-accent rounded-full mb-4">
            <span className="text-accent-foreground text-sm font-semibold">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Our Students Say
          </h2>
          <p className="text-muted-foreground text-lg">
            Hear from our successful graduates about their learning experience
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-3xl shadow-xl p-8 md:p-12 border border-border">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/20" />
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                {/* Rating */}
                <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                  ))}
                </div>

                <p className="text-lg md:text-xl text-foreground mb-6 leading-relaxed italic">
                  "{testimonials[currentIndex].quote}"
                </p>

                <div>
                  <h4 className="text-xl font-bold text-foreground">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-primary font-medium">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-8"
                        : "bg-border hover:bg-muted"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* All Testimonials Grid (visible on larger screens) */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mt-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? "bg-accent border-primary shadow-lg"
                  : "bg-card border-border hover:border-primary/50"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h5 className="font-semibold text-foreground">{testimonial.name}</h5>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
