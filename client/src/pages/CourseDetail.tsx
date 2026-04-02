import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Clock, Users, Star, Calendar, BookOpen, Award, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

interface CourseDetailData {
  _id: string;
  title: string;
  description: string; // Small description
  fullDescription?: string; // Mapped from backend 'description'
  category: string;
  duration?: string;
  rating?: number;
  instructor?: {
    username: string;
    email: string;
    _id: string;
  };
  instructorName?: string; // If passed separately
  image?: string;
  thumbnail?: string;
  syllabus?: string[];
  requirements?: string[];
  learningOutcomes?: string[]; // learningOutcomes
  price: number;
}

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        // courseId can be ID or slug. Backend supports ID. 
        // If courseId is not an ID, we might need a search or slug endpoint.
        // Existing backend: getCourseById uses findById.
        // If I click from CourseCard, I passed ID or Slug.
        // Let's assume ID for now. 
        const res = await api.get(`/courses/${courseId}`);

        if (res.status === 200) {
          const data = res.data;
          // Helper for image URL
          const getImageUrl = (img: string) => {
            if (!img) return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60";
            if (img.startsWith("http")) return img;
            const baseUrl = import.meta.env.VITE_API_URL || 'https://mindbotics-final-1.onrender.com';
            return `${baseUrl}/uploads/${img}`;
          };

          // Safe parsing of arrays
          const safeParseArr = (arr: any) => {
            if (Array.isArray(arr)) return arr;
            if (typeof arr === 'string') {
              try { return JSON.parse(arr); } catch (e) { return []; }
            }
            return [];
          };

          // Normalize
          const normalized: CourseDetailData = {
            _id: data._id,
            title: data.title,
            description: data.shortDescription || data.description,
            fullDescription: data.fullDescription || data.description,
            category: data.category,
            duration: data.duration || "Self-paced",
            rating: data.rating || data.averageRating || 4.5,
            instructor: typeof data.instructor === "object" ? data.instructor : null,
            instructorName:
              data.instructorName ||
              (data.instructor && typeof data.instructor === "object"
                ? data.instructor.username
                : null) ||
              "MindBotics Instructor",
            image: getImageUrl(data.thumbnail || data.image),
            price: data.price,
            syllabus: safeParseArr(data.syllabus),
            requirements: safeParseArr(data.requirements),
            learningOutcomes: safeParseArr(data.learningOutcomes),
          };

          setCourse(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch course", err);
        setError("Course not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">{error || "Course Not Found"}</h1>
          <Link to="/courses">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
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
        title={course.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: course.title },
        ]}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-80 object-cover rounded-2xl mb-8"
              />

              <div className="bg-card p-8 rounded-2xl border border-border mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Course</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line break-words overflow-hidden">
                  {course.fullDescription}
                </p>

              </div>

              {/* Syllabus */}
              {course.syllabus && course.syllabus.length > 0 && (
                <div className="bg-card p-8 rounded-2xl border border-border mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Course Syllabus</h2>
                  <div className="space-y-4">
                    {course.syllabus.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-accent/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-foreground text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements & Outcomes */}
              <div className="grid md:grid-cols-2 gap-8">
                {course.requirements && course.requirements.length > 0 && (
                  <div className="bg-card p-6 rounded-2xl border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Requirements
                    </h3>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="text-muted-foreground flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {course.learningOutcomes?.length > 0 && (
                  <div className="bg-card p-6 rounded-2xl border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      What You'll Learn
                    </h3>
                    <ul className="space-y-3">
                      {course.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="text-muted-foreground flex items-start gap-3">
                          <div className="mt-1 w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Course Info Card */}
                <div className="bg-card p-6 rounded-2xl border border-border">
                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full mb-4">
                    {course.category}
                  </span>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{course.duration} weeks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500 fill-current" />
                      <span className="text-foreground">{course.rating} Rating</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Price: ${course.price}</span>
                    </div>
                  </div>

                  <Button onClick={() => navigate("/contact")} className="w-full" size="lg">
                    Enroll Now
                  </Button>
                </div>

                {/* Instructor Card */}
                <div className="bg-card p-6 rounded-2xl border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">Instructor</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {/* Placeholder or user image if available */}
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-foreground">{course.instructorName}</h4>
                      {/* <p className="text-sm text-muted-foreground mt-1">
                        {course.instructor?.email}
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;