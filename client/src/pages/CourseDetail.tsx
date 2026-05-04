import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Clock, Users, Star, Calendar, BookOpen, Award, ArrowLeft, Code, Brain, Folder, Rocket, Sparkles, IndianRupee } from "lucide-react";
import api from "@/lib/api";

type CourseDuration = "30 Days" | "90 Days" | "180 Days";

const durationOptions: CourseDuration[] = ["30 Days", "90 Days", "180 Days"];

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
  syllabus90?: string[];
  syllabus180?: string[];
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
  const [selectedDuration, setSelectedDuration] = useState<CourseDuration>("30 Days");

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
            syllabus90: safeParseArr(data.syllabus90),
            syllabus180: safeParseArr(data.syllabus180),
            requirements: safeParseArr(data.requirements),
            learningOutcomes: safeParseArr(data.learningOutcomes),
          };

          setCourse(normalized);

          const courseDuration = durationOptions.find((duration) => duration === data.duration);
          if (courseDuration) {
            setSelectedDuration(courseDuration);
          }
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

  const courseIncludes = [
    { icon: Calendar, label: `${selectedDuration} structured curriculum` },
    { icon: Award, label: "Certificate" },
    { icon: Code, label: `Projects aligned with the ${selectedDuration} track` },
    { icon: Brain, label: "Hands-on Training" },
    { icon: Folder, label: "Portfolio Building" },
    { icon: Rocket, label: "Internship opportunities" },
  ];

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
              <div className="bg-card p-8 rounded-2xl border border-border mb-8">
                <div className="flex flex-col mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Course Syllabus ({selectedDuration})</h2>
                </div>

                <div className="relative overflow-hidden">
                  <div 
                    className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" 
                    key={selectedDuration}
                  >
                    {(selectedDuration === "30 Days"
                      ? course.syllabus || []
                      : selectedDuration === "90 Days"
                      ? course.syllabus90 || []
                      : course.syllabus180 || []
                    ).length > 0 ? (
                      (selectedDuration === "30 Days"
                        ? course.syllabus || []
                        : selectedDuration === "90 Days"
                        ? course.syllabus90 || []
                        : course.syllabus180 || []
                      ).map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-accent/50 rounded-lg transition-all duration-300 hover:bg-accent/70">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground text-sm font-bold">{index + 1}</span>
                          </div>
                          <p className="text-foreground">{item}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        No syllabus content available for {selectedDuration}.
                      </p>
                    )}
                  </div>
                </div>
              </div>

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

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-3 font-medium">Select Course Duration</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {durationOptions.map((duration) => (
                        <button
                          key={duration}
                          onClick={() => setSelectedDuration(duration)}
                          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
                            selectedDuration === duration
                              ? "bg-black text-white shadow-md scale-105"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-105"
                          }`}
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Duration: {selectedDuration}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500 fill-current" />
                      <span className="text-foreground">{course.rating} Rating</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <IndianRupee className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-semibold">
                        {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <Button onClick={() => navigate("/contact")} className="w-full" size="lg">
                    Enroll Now
                  </Button>

                  {/* Course Includes Section */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      This {selectedDuration} Course Includes
                    </h3>
                    <ul className="space-y-3">
                      {courseIncludes.map(({ icon: Icon, label }) => (
                        <li key={label} className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                          <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
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
