import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
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

          {loading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No projects available.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.map((project) => (
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
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;
