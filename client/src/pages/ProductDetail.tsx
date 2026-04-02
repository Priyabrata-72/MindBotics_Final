import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import Loader from "@/components/Loader";

interface ProductType {
  _id: string;
  name: string;
  description?: string;
  fullDescription?: string;
  category?: string;
  images?: { url: string }[];
  features?: string[];
  specifications?: { key: string; value: string }[];
  uses?: string[];
  includes?: string[];
}

const ProductDetail = () => {
  const { productId } = useParams();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // IMPORTANT: match this with Products page
        const res = await api.get(`/projects/${productId}`);

        const data = res.data?.project || res.data;

        setProduct(data);
      } catch (error) {
        console.error("Product fetch error:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return <Loader />
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Project Not Found
          </h1>
          <Link to="/projects">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageBanner
        title={product.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: product.name },
        ]}
      />

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 mb-12">

            {/* Image */}
            <div>
              <img
                src={
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800"
                }
                alt={product.name}
                className="w-full h-[400px] object-cover rounded-xl shadow-md"
              />
            </div>

            {/* Info */}
            <div>
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg mb-4">
                {product.category || "General"}
              </span>

              <h1 className="text-3xl font-bold mb-4">
                {product.name}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.fullDescription || product.description}
              </p>

              <div className="mb-8">
                <Link to="/contact">
                   <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md border-0 text-base font-semibold transition-all">
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Us
                   </Button>
                </Link>
              </div>

              {/* Features */}
              {product.features?.length ? (
                <div className="space-y-3 mb-8">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* <Button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button> */}
            </div>
          </div>

          {/* Extra Sections */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Specifications */}
            {product.specifications?.length ? (
              <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">

                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Specifications
                </h2>

                <div className="space-y-3">
                  {product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-start border-b border-gray-200 pb-3 last:border-0"
                    >
                      <span className="font-medium text-gray-700 min-w-[40%]">
                        {spec.key}:
                      </span>

                      <span className="text-gray-600 break-words flex-1">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            ) : null}

            {/* Uses */}
            {product.uses?.length ? (
              <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Common Uses
                </h2>
                <ul className="space-y-2">
                  {product.uses.map((use, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Includes */}
            {product.includes?.length ? (
              <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  What's Included
                </h2>
                <ul className="space-y-2">
                  {product.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
