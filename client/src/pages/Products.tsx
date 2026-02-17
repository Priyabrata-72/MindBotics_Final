import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Robotics",
  "Home Automation",
  "Agriculture",
  "Surveillance",
  "Healthcare",
];

interface RawProject {
  _id: string;
  name: string;
  description: string;
  category?: string;
  images?: { url: string }[];
}

interface Project {
  id: string;
  image: string;
  name: string;
  description: string;
  category: string;
}

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleProject, setVisibleProject] = useState(6);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get("/projects");

        if (res.status === 200) {
          const rawData: RawProject[] =
            res.data?.projects || res.data || [];

          const normalizedProjects: Project[] = rawData.map((p) => ({
            id: p._id,
            image:
              p.images && p.images.length > 0 && p.images[0]?.url
                ? p.images[0].url
                : "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800",
            name: p.name,
            description: p.description,
            category: p.category || "General",
          }));

          setProjects(normalizedProjects);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 🔥 Filtered Projects
  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  // 🔥 FULL PAGE LOADER
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageBanner
        title="Our Projects"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects" },
        ]}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">
              Quality Projects
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Explore Our Latest Projects
            </h2>

            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Discover innovative IoT, Robotics, and Software development projects.
            </p>
          </div>

          {/* ✅ Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  activeCategory === category ? "default" : "outline"
                }
                onClick={() => {
                  setActiveCategory(category);
                  setVisibleProject(6);
                }}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No projects available.
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProjects
                  .slice(0, visibleProject)
                  .map((project) => (
                    <ProductCard
                      key={project.id}
                      id={project.id}
                      image={project.image}
                      name={project.name}
                      description={project.description}
                      category={project.category}
                    />
                  ))}
              </div>

              {visibleProject < filteredProjects.length && (
                <div className="text-center mt-10">
                  <Button
                    onClick={() =>
                      setVisibleProject((prev) => prev + 4)
                    }
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;
