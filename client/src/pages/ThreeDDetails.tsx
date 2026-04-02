import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Star, User, Lock, Mail, MessageCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

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
  price?: number;
}

const ThreeDDesign = () => {
  const { productId } = useParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const hasReviewed = product?.reviews?.some((r) => r.user === user?.id);

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
      
      // Reload product logic to see the new review
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
    return <Loader />
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-80" />
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Resource Not Found
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">The 3D design you are looking for has been moved or does not exist in our database.</p>
          <Link to="/3d">
            <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-full px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to 3D Designs
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-100">
      <Navbar />

      {/* Main Content */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Breadcrumb replacement */}
          <div className="mb-8 flex items-center text-sm font-medium text-gray-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/3d" className="hover:text-blue-600 transition-colors">3D Marketplace</Link>
            <span className="mx-2">/</span>
            <span className="text-blue-600">{product.name}</span>
          </div>

          {/* Product Details Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            
            {/* Image/Viewer placeholder */}
            <div className="relative group rounded-2xl overflow-hidden shadow-md bg-white p-4 border border-gray-100">
              <img
                src={
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800"
                }
                alt={product.name}
                className="w-full h-[450px] object-cover rounded-xl shadow-sm relative z-0 transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute top-6 left-6 z-20">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-blue-700 text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm">
                  {product.category || "3D Design"}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                {product.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex space-x-1">
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
                <span className="text-gray-600 text-sm font-medium">
                  ({product.numReviews || 0} customer reviews)
                </span>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Added Contact Us Button right after description */}
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
                <div className="space-y-4 mb-8">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

            </div>
          </div>

          {/* Extra Details Grids */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Specifications */}
            {product.specifications?.length ? (
              <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100 hover:border-blue-200 transition-all duration-300 group">
                <h2 className="text-xl font-bold mb-6 text-gray-900 group-hover:text-blue-600 transition-colors">
                  Technical Specs
                </h2>
                <div className="space-y-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex gap-4 border-b border-gray-100 pb-3 last:border-0">
                      <span className="font-semibold text-gray-800 min-w-[45%]">
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
              <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100 hover:border-purple-200 transition-all duration-300 group">
                <h2 className="text-xl font-bold mb-6 text-gray-900 group-hover:text-purple-600 transition-colors">
                  Primary Applications
                </h2>
                <ul className="space-y-3">
                  {product.uses.map((use, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Includes */}
            {product.includes?.length ? (
               <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 transition-all duration-300 group">
                <h2 className="text-xl font-bold mb-6 text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Package Includes
                </h2>
                <ul className="space-y-3">
                  {product.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600">
                      <Check className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* REVIEWS SECTION */}
          <div className="bg-white shadow-lg rounded-3xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3 text-gray-900">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <span>Customer Feedback</span>
            </h2>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* Review List (Takes 7 cols on large screens) */}
              <div className="lg:col-span-7 space-y-6 max-h-[600px] overflow-y-auto pr-2 sm:pr-6 custom-scrollbar">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review._id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="text-blue-600 w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{review.name}</h4>
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                           {[1, 2, 3, 4, 5].map((s) => (
                             <Star key={s} className={`w-3.5 h-3.5 ${review.rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                           ))}
                        </div>
                      </div>
                      <p className="text-gray-700 italic leading-relaxed text-sm md:text-base pl-2 border-l-2 border-blue-200">
                        "{review.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 border border-gray-100 p-10 rounded-2xl text-center h-full flex flex-col justify-center items-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500">Be the first to share your thoughts on this design!</p>
                  </div>
                )}
              </div>

              {/* Review Form / Auth Messages (Takes 5 cols on large screens) */}
              <div className="lg:col-span-5 relative z-10">
                <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">Submit a Review</h3>
                  
                  {!isAuthenticated ? (
                     <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                        <div className="flex flex-col items-center text-center gap-4">
                           <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                              <Lock className="w-8 h-8 text-orange-500" />
                           </div>
                           <div>
                              <h4 className="text-orange-800 font-bold text-lg mb-2">Authentication Required</h4>
                              <p className="text-orange-600/80 text-sm mb-6 leading-relaxed">
                                You must be logged in to submit a review. You can only review a product once.
                              </p>
                              <Link to="/login" className="block w-full">
                                 <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md border-0 h-12 text-base font-semibold transition-all">
                                    Login to Review
                                 </Button>
                              </Link>
                           </div>
                        </div>
                     </div>
                  ) : hasReviewed ? (
                     <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                        <div className="flex flex-col items-center text-center gap-4">
                           <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                              <Check className="w-8 h-8 text-blue-500" />
                           </div>
                           <div>
                              <h4 className="text-blue-800 font-bold text-lg mb-2">Review Submitted</h4>
                              <p className="text-blue-600/80 text-sm leading-relaxed">
                                You have already submitted a review for this product. Thank you for your valuable feedback!
                              </p>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <form onSubmit={submitReviewHandler} className="space-y-5">
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-gray-700 ml-1">Rating</label>
                           <Select value={rating} onValueChange={setRating}>
                              <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-12 px-4 focus:ring-blue-500">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-200 text-gray-900 shadow-xl">
                                 <SelectItem value="5">5 - Excellent (Masterpiece)</SelectItem>
                                 <SelectItem value="4">4 - Very Good (High Quality)</SelectItem>
                                 <SelectItem value="3">3 - Good (Standard)</SelectItem>
                                 <SelectItem value="2">2 - Fair (Needs Work)</SelectItem>
                                 <SelectItem value="1">1 - Poor (Unusable)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
  
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-gray-700 ml-1">Comment</label>
                           <Textarea 
                             placeholder="Share your detailed experience with this design..." 
                             className="min-h-[140px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500 resize-none p-4"
                             value={comment}
                             onChange={(e) => setComment(e.target.value)}
                             required
                           />
                        </div>
  
                        <Button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 h-12 text-base font-semibold shadow-md transition-all hover:scale-[1.02]" 
                          disabled={submitLoading}
                        >
                           {submitLoading ? (
                             <span className="flex items-center justify-center">
                               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                               Transmitting...
                             </span>
                           ) : "Submit Review"}
                        </Button>
                     </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adding custom scrollbar styling globally for this page scope */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <Footer />
    </div>
  );
};
export default ThreeDDesign;