import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ProductType {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  images?: { url: string }[];
  features?: string[];
  specifications?: { key: string; value: string }[];
  uses?: string[];
  includes?: string[];
}

const ThreeDDesign = () => {
  const { productId } = useParams();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // ✅ FIXED: use shop endpoint
        const res = await api.get(`/3d/${productId}`);

        const data = res.data?.product || res.data;

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Product Not Found
          </h1>

          {/* ✅ FIXED route */}
          <Link to="/shop">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
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
        title={product.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "3D Design", href: "/3d" }, // ✅ FIXED
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
              <span className="inline-block px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg mb-4">
                {product.category || "General"}
              </span>

              <h1 className="text-3xl font-bold mb-4">
                {product.name}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Features */}
              {product.features?.length ? (
                <div className="space-y-3 mb-8">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-gray-800 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Extra Sections */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Specifications */}
            {product.specifications?.length ? (
              <div className="bg-white shadow-md rounded-xl p-6 border">
                <h2 className="text-xl font-semibold mb-4">
                  Specifications
                </h2>

                <div className="space-y-3">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex gap-4 border-b pb-2">
                      <span className="font-medium min-w-[40%]">
                        {spec.key}:
                      </span>
                      <span className="text-gray-600">
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
                <h2 className="text-xl font-semibold mb-4">
                  Uses
                </h2>
                <ul className="space-y-2">
                  {product.uses.map((use, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="w-2 h-2 bg-gray-800 rounded-full mt-2" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Includes */}
            {product.includes?.length ? (
              <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Included
                </h2>
                <ul className="space-y-2">
                  {product.includes.map((item, index) => (
                    <li key={index} className="flex gap-2">
                      <Check className="w-4 h-4 text-gray-800 mt-1" />
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

export default ThreeDDesign;