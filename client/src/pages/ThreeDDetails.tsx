import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Star, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";

interface ReviewType {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: string;
}

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
  reviews?: ReviewType[];
  rating?: number;
  numReviews?: number;
}

const ThreeDDesign = () => {
  const { productId } = useParams();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const submitReviewHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.post(`/3d/${productId}/reviews`, {
        rating: Number(rating),
        comment,
      });
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
      
      setRating("5");
      setComment("");
      
      // ✅ Reload product logic to see the new review
      const res = await api.get(`/3d/${productId}`);
      const data = res.data?.product || res.data;
      setProduct(data);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

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

              <h1 className="text-3xl font-bold mb-2">
                {product.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        (product.rating || 0) >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  ({product.numReviews || 0} reviews)
                </span>
              </div>

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

          {/* REVIEWS SECTION */}
          <div className="mt-16 bg-white shadow-md rounded-xl p-8 border">
            <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Review List */}
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review._id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600 w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.name}</h4>
                          <div className="flex items-center text-xs text-gray-500 gap-2">
                            <span className="flex">
                               {[1, 2, 3, 4, 5].map((s) => (
                                 <Star key={s} className={`w-3 h-3 ${review.rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                               ))}
                            </span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic mt-2">"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600">No reviews yet. Be the first to review this design!</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                <form onSubmit={submitReviewHandler} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Rating</label>
                    <Select value={rating} onValueChange={setRating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                        <SelectItem value="4">4 - Very Good</SelectItem>
                        <SelectItem value="3">3 - Good</SelectItem>
                        <SelectItem value="2">2 - Fair</SelectItem>
                        <SelectItem value="1">1 - Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Comment</label>
                    <Textarea 
                      placeholder="Share your thoughts about this 3D design..." 
                      className="min-h-[120px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitLoading}>
                    {submitLoading ? "Submitting..." : "Submit Review"}
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    You must be logged in to submit a review. You can only review a product once.
                  </p>
                </form>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ThreeDDesign;