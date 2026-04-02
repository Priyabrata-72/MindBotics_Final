import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Star, User, Lock, Mail, MessageCircle, AlertCircle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050B14] text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-purple-300 font-medium tracking-wider">Loading System Data...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050B14] text-white">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-80" />
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
            Resource Not Found
          </h1>
          <p className="text-gray-400 mb-8 max-w-md">The 3D design you are looking for has been moved or does not exist in our database.</p>
          <Link to="/3d">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-8">
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
    <div className="min-h-screen bg-[#050914] text-slate-200 selection:bg-blue-500/30">
      <Navbar />

      {/* Main Content */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Breadcrumb replacement */}
          <div className="mb-8 flex items-center text-sm font-medium text-gray-400">
            <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/3d" className="hover:text-blue-400 transition-colors">3D Marketplace</Link>
            <span className="mx-2">/</span>
            <span className="text-blue-300">{product.name}</span>
          </div>

          {/* Product Details Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            
            {/* Image/Viewer placeholder */}
            <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.1)] bg-white/5 backdrop-blur-sm p-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
              <img
                src={
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800"
                }
                alt={product.name}
                className="w-full h-[450px] object-cover rounded-xl shadow-inner relative z-0 transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute top-6 left-6 z-20">
                <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-blue-300 text-xs font-semibold uppercase tracking-wider rounded-full border border-blue-500/30">
                  {product.category || "3D Design"}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
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
                          ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                          : "text-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-sm font-medium">
                  ({product.numReviews || 0} customer reviews)
                </span>
              </div>

              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Features */}
              {product.features?.length ? (
                <div className="space-y-4 mb-8">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                        <Check className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-gray-300 font-medium">
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
              <div className="bg-white/5 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
                <h2 className="text-xl font-bold mb-6 text-white group-hover:text-blue-400 transition-colors">
                  Technical Specs
                </h2>
                <div className="space-y-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex gap-4 border-b border-white/5 pb-3 last:border-0">
                      <span className="font-semibold text-gray-300 min-w-[45%]">
                        {spec.key}:
                      </span>
                      <span className="text-gray-400">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Uses */}
            {product.uses?.length ? (
              <div className="bg-white/5 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
                <h2 className="text-xl font-bold mb-6 text-white group-hover:text-purple-400 transition-colors">
                  Primary Applications
                </h2>
                <ul className="space-y-3">
                  {product.uses.map((use, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Includes */}
            {product.includes?.length ? (
               <div className="bg-white/5 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                <h2 className="text-xl font-bold mb-6 text-white group-hover:text-indigo-400 transition-colors">
                  Package Includes
                </h2>
                <ul className="space-y-3">
                  {product.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-400">
                      <Check className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* REVIEWS SECTION */}
          <div className="bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden">
            {/* Subtle glow inside reviews */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Customer Feedback</span>
            </h2>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* Review List (Takes 7 cols on large screens) */}
              <div className="lg:col-span-7 space-y-6 max-h-[600px] overflow-y-auto pr-2 sm:pr-6 custom-scrollbar">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review._id} className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-full flex items-center justify-center shadow-inner">
                            <User className="text-blue-300 w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-200">{review.name}</h4>
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
                           {[1, 2, 3, 4, 5].map((s) => (
                             <Star key={s} className={`w-3.5 h-3.5 ${review.rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                           ))}
                        </div>
                      </div>
                      <p className="text-gray-400 italic leading-relaxed text-sm md:text-base pl-2 border-l-2 border-blue-500/30">
                        "{review.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-blue-500/5 border border-blue-500/10 p-10 rounded-2xl text-center h-full flex flex-col justify-center items-center">
                    <MessageCircle className="w-12 h-12 text-blue-500/30 mb-4" />
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-500">Be the first to share your thoughts on this futuristic design!</p>
                  </div>
                )}
              </div>

              {/* Review Form / Auth Messages (Takes 5 cols on large screens) */}
              <div className="lg:col-span-5 relative z-10">
                <div className="bg-[#0b101e] rounded-2xl p-6 md:p-8 border border-white/5 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Submit a Review</h3>
                  
                  {!isAuthenticated ? (
                     <div className="bg-orange-950/30 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-red-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
                        <div className="flex flex-col items-center text-center gap-4">
                           <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-2 ring-4 ring-orange-500/5 group-hover:bg-orange-500/20 transition-colors">
                              <Lock className="w-8 h-8 text-orange-400" />
                           </div>
                           <div>
                              <h4 className="text-orange-300 font-bold text-lg mb-2">Authentication Required</h4>
                              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                You must be logged in to submit a review. You can only review a product once.
                              </p>
                              <Link to="/login" className="block w-full">
                                 <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] border-0 h-12 text-base font-semibold group-hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all">
                                    Login to Review
                                 </Button>
                              </Link>
                           </div>
                        </div>
                     </div>
                  ) : hasReviewed ? (
                     <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.6)]"></div>
                        <div className="flex flex-col items-center text-center gap-4">
                           <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 ring-4 ring-blue-500/5">
                              <Check className="w-8 h-8 text-blue-400" />
                           </div>
                           <div>
                              <h4 className="text-blue-300 font-bold text-lg mb-2">Review Submitted</h4>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                You have already submitted a review for this product. Thank you for your valuable feedback!
                              </p>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <form onSubmit={submitReviewHandler} className="space-y-5">
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-gray-300 ml-1">Rating</label>
                           <Select value={rating} onValueChange={setRating}>
                              <SelectTrigger className="bg-black/40 border-white/10 text-white h-12 px-4 focus:ring-blue-500">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#121826] border-white/10 text-white shadow-xl">
                                 <SelectItem value="5" className="hover:bg-white/5 focus:bg-white/5">5 - Excellent (Masterpiece)</SelectItem>
                                 <SelectItem value="4" className="hover:bg-white/5 focus:bg-white/5">4 - Very Good (High Quality)</SelectItem>
                                 <SelectItem value="3" className="hover:bg-white/5 focus:bg-white/5">3 - Good (Standard)</SelectItem>
                                 <SelectItem value="2" className="hover:bg-white/5 focus:bg-white/5">2 - Fair (Needs Work)</SelectItem>
                                 <SelectItem value="1" className="hover:bg-white/5 focus:bg-white/5">1 - Poor (Unusable)</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
  
                        <div className="space-y-2">
                           <label className="text-sm font-semibold text-gray-300 ml-1">Comment</label>
                           <Textarea 
                             placeholder="Share your detailed experience with this design..." 
                             className="min-h-[140px] bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:ring-blue-500 resize-none p-4"
                             value={comment}
                             onChange={(e) => setComment(e.target.value)}
                             required
                           />
                        </div>
  
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-12 text-base font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02]" 
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

          {/* CONTACT SUPPORT CARD CTA */}
          <div className="mt-12 bg-gradient-to-br from-[#0c1222] to-[#160f24] backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-indigo-500/20 relative overflow-hidden group">
             {/* Dynamic background effects */}
             <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-[80px] group-hover:bg-purple-600/30 transition-colors duration-700 pointer-events-none"></div>
             <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-colors duration-700 pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-center md:text-left flex-1">
                   <h2 className="text-3xl font-bold text-white mb-3">
                     Need Help or Have Questions?
                   </h2>
                   <p className="text-indigo-200 text-lg max-w-xl mx-auto md:mx-0">
                     Reach out to our team for dedicated support, request custom 3D designs, or get prompt answers to your product inquiries.
                   </p>
                </div>
                <div className="flex flex-col sm:flex-row shadow-2xl items-stretch gap-4 w-full md:w-auto">
                   <Link to="/contact" className="flex-1 sm:flex-none">
                      <Button size="lg" className="w-full h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] border-0 text-base font-semibold group-hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all">
                         <Mail className="w-5 h-5 mr-2" />
                         Contact Us
                      </Button>
                   </Link>
                   <Button size="lg" className="flex-1 sm:flex-none h-14 px-8 border border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-300 bg-transparent text-base font-semibold transition-all">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp Support
                   </Button>
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
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.4);
        }
      `}</style>
      <Footer />
    </div>
  );
};

export default ThreeDDesign;