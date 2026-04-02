import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import CourseCard from "@/components/CourseCard";
import TutorsSection from "@/components/TutorsSection";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import api from "@/lib/api";

const categories = [
  "All",
  "Online Program",
  "Offline Program",
  "IoT",
  "Robotics",
  "Development",
  "AI/ML",
];

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCourses, setVisibleCourses] = useState(6);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const res = await api.get("/courses");

        if (res.status === 200) {
          const rawData = Array.isArray(res.data)
            ? res.data
            : res.data?.courses || [];

          const normalizedCourses = rawData.map((c: any) => {
            const getImageUrl = (img: string) => {
              if (!img)
                return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60";
              if (img.startsWith("http")) return img;
              const baseUrl =
                import.meta.env.VITE_API_URL ||
                "https://mindbotics-final-1.onrender.com";
              return `${baseUrl}/uploads/${img}`;
            };

            let syllabus = c.syllabus;
            try {
              if (typeof syllabus === "string")
                syllabus = JSON.parse(syllabus);
            } catch {
              syllabus = [];
            }

            return {
              id: c._id,
              image: getImageUrl(c.thumbnail || c.image),
              title: c.title,
              shortDescription: c.shortDescription,
              fullDescription:
                c.shortDescription || c.fulldescription,
              category: c.category || "General",
              duration: c.duration || "Self-paced",
              rating:
                c.averageRating || c.rating || 4.5,
              instructor:
                c.instructorName ||
                (c.instructor &&
                  typeof c.instructor === "object"
                  ? c.instructor.username
                  : null) ||
                "MindBotics Instructor",
              instructorId:
                (c.instructor &&
                  typeof c.instructor === "object"
                  ? c.instructor._id
                  : c.instructor) || "1",
            };
          });

          setCourses(normalizedCourses);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses =
    activeCategory === "All"
      ? courses
      : courses.filter(
        (course) => course.category === activeCategory
      );

  const displayedCourses = filteredCourses.slice(
    0,
    visibleCourses
  );

  const loadMore = () => {
    setVisibleCourses((prev) => prev + 3);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageBanner
        title="Our Courses"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Courses" },
        ]}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  activeCategory === category
                    ? "default"
                    : "outline"
                }
                onClick={() => {
                  setActiveCategory(category);
                  setVisibleCourses(6);
                }}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Loader / Courses */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <Loader />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedCourses.length > 0 ? (
                  displayedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      {...course}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">
                      No courses found in this category.
                    </p>
                  </div>
                )}
              </div>

              {visibleCourses < filteredCourses.length && (
                <div className="text-center mt-12">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={loadMore}
                  >
                    Load More Courses
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* <TutorsSection /> */}
      <Footer />
    </div>
  );
};

export default Courses;
