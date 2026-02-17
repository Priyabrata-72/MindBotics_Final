import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface Course {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category: string;
  duration?: string;
  rating?: number;
  thumbnail?: string;
  image?: string;
}

const CoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");

        if (res.status === 200) {
          setCourses(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getImageUrl = (img?: string) => {
    if (!img)
      return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

    if (img.startsWith("http")) return img;

    const baseUrl =
      import.meta.env.VITE_API_URL || "https://mindbotics-final-1.onrender.com";

    return `${baseUrl}/uploads/${img}`;
  };

  return (
    <section
      id="courses"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-accent rounded-full mb-4">
            <span className="text-accent-foreground text-sm font-semibold">
              Popular Courses
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Explore Our Top Programs
          </h2>

          <p className="text-muted-foreground text-lg">
            Choose from our carefully designed courses to kickstart or advance
            your career.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin h-10 w-10 border-b-2 border-primary mx-auto rounded-full"></div>
          </div>
        )}

        {/* Course Cards */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.length > 0 ? (
              courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getImageUrl(course.thumbnail || course.image)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {course.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        {course.rating || 4.5}
                      </div>
                    </div>

                    <Link to={`/course/${course._id}`}>
                      <Button variant="outline" className="w-full group/btn">
                        Learn More
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-3 text-muted-foreground">
                No courses available.
              </p>
            )}
          </div>
        )}

        {/* View All Button */}
        {!loading && courses.length > 0 && (
          <div className="text-center mt-12">
            <Link to="/courses">
              <Button size="lg">
                View All Courses
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
