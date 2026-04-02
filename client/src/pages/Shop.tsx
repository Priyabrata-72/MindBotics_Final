import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import ThreeDProductCard from "@/components/ThreeDProductCard";
import Loader from "@/components/Loader";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Models",
  "Kits",
  "3D Printing",
  "Components",
  "Robotics",
];

interface RawProduct {
  _id: string;
  name: string;
  description: string;
  category?: string;
  images?: { url: string }[];
}

interface Product {
  id: string;
  image: string;
  name: string;
  description: string;
  category: string;
}

const Printing = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(8);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await api.get("/3d");

        if (res.status === 200) {
          const rawData: RawProduct[] =
            res.data?.products || res.data || [];

          const normalizedProducts: Product[] = rawData.map((p) => ({
            id: p._id,
            image:
              p.images && p.images.length > 0 && p.images[0]?.url
                ? p.images[0].url
                : "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800",
            name: p.name,
            description: p.description,
            category: p.category || "Models",
          }));

          setProducts(normalizedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🔥 Filter Products
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // 🔥 FULL PAGE LOADER
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageBanner
        title="3D"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "3D", href: "/3d" },
        ]}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-12">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">
              Our Products
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Explore Our Latest 3D Products
            </h2>

            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Discover high-quality 3D models, designs, and printing services.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  activeCategory === category ? "default" : "outline"
                }
                onClick={() => {
                  setActiveCategory(category);
                  setVisibleProducts(8);
                }}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No products available.
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts
                  .slice(0, visibleProducts)
                  .map((product) => (
                    <ThreeDProductCard
                      key={product.id}
                      id={product.id}
                      image={product.image}
                      name={product.name}
                      description={product.description}
                      category={product.category}
                    />
                  ))}
              </div>

              {visibleProducts < filteredProducts.length && (
                <div className="text-center mt-10">
                  <Button
                    onClick={() =>
                      setVisibleProducts((prev) => prev + 4)
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

export default Printing;