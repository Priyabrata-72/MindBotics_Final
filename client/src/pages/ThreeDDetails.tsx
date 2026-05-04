import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Star,
  User,
  Lock,
  Mail,
  MessageCircle,
  AlertCircle,
  ChevronDown,
  Package,
  Info,
  Shield,
  Truck,
  Send,
  Box,
  Layers3,
  Sparkles,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Loader from "@/components/Loader";
import PageBanner from "@/components/PageBanner";

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
  fullDescription?: string;
  category?: string;
  images?: { url: string }[];
  projectGallery?: { url: string }[];
  features?: string[];
  keyFeature?: string[];
  // specifications?: { key: string; value: string }[];
  uses?: string[];
  includes?: string[];
  reviews?: ReviewType[];
  rating?: number;
  numReviews?: number;
  price?: number;
}

const TABS = ["Description", "Warranty", "Review", "Other Info"];

const FloatCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: "easeOut" }}
    whileHover={{ y: -3, boxShadow: "0 22px 44px rgba(0,0,0,0.10)" }}
    className={`bg-white/90 backdrop-blur-xl border border-white/70 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </motion.div>
);

const StarRating = ({
  rating,
  interactive = false,
  onRate,
  size = 18,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
  size?: number;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        onClick={() => interactive && onRate?.(s)}
        className={`transition-all duration-200 ${
          s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300"
        } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
      />
    ))}
  </div>
);

const ThreeDDetails = () => {
  const { productId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isAuthenticated = !!user;

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Description");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const hasReviewed = useMemo(
    () => product?.reviews?.some((r) => r.user === user?._id),
    [product?.reviews, user?._id]
  );

  const avgRating = useMemo(() => {
    if (product?.reviews?.length) {
      return Number(
        (
          product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        ).toFixed(1)
      );
    }
    return product?.rating || 0;
  }, [product]);

  const features =
    product?.keyFeature?.length
      ? product.keyFeature.slice(0, 5)
      : product?.features?.length
      ? product.features.slice(0, 5)
      : [
          "High-quality 3D design structure",
          "Optimized for visual presentation",
          "Ready for prototyping and showcase",
          "Scalable design architecture",
          "Suitable for commercial and industrial use",
        ];

  const imageList =
    product?.projectGallery?.length
      ? product.projectGallery
      : product?.images?.length
      ? product.images
      : [{ url: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800" }];

  const imageUrl = imageList[activeImageIndex]?.url || imageList[0]?.url;

  const faqItems = [
    {
      id: 1,
      question: "Is this 3D design ready for customization?",
      answer:
        "Yes, the design can be adapted further based on project requirements, dimensions, and use cases.",
    },
    {
      id: 2,
      question: "Can I request implementation or prototype support?",
      answer:
        "Yes, you can contact the team for consultation, implementation support, or project-specific customization.",
    },
  ];

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

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  const submitReviewHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please add your review comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post(`/3d/${productId}/reviews`, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      toast({
        title: "Review submitted",
        description: "Thank you for sharing your feedback.",
      });

      setRating("5");
      setComment("");
      await fetchProduct();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-80 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">3D Design Not Found</h1>
            <p className="text-gray-600 mb-8">
              This 3D design doesn't exist or has been removed from the catalog.
            </p>
            <Link
              to="/3d"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
            >
              <ArrowLeft size={16} />
              Back to 3D Designs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      <PageBanner
        title={product.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "3D Marketplace", href: "/3d" },
          { label: product.name },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <FloatCard className="overflow-hidden p-0 group" delay={0}>
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-[380px] md:h-[440px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {product.category || "3D Design"}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Available
                  </span>
                </div>
              </div>

              {imageList.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {imageList.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`thumb-${i}`}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all flex-shrink-0 ${
                        activeImageIndex === i
                          ? "border-gray-800"
                          : "border-gray-200 hover:border-gray-700"
                      }`}
                    />
                  ))}
                </div>
              )}
            </FloatCard>
          </div>

          <div className="flex flex-col gap-5">
            <FloatCard className="p-6" delay={0.1}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    3D Marketplace Design
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">
                    {product.name}
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">Ready</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={Math.round(avgRating)} size={16} />
                <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
                <span className="text-sm text-gray-400">
                  ({product.reviews?.length || product.numReviews || 0} reviews)
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-6">
                {product.description || "A high-quality 3D design crafted for presentation, prototyping, and project showcase use cases."}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary">₹{product.price || 0}/-</span>
                  </div>
                </div>
                <div className="ml-auto bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Premium Design</span>
                </div>
              </div>
            </FloatCard>

            <FloatCard className="p-5" delay={0.15}>
              <div className="flex flex-wrap gap-3">
                {/* Buy Now */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const canBuy = typeof product.price === "number" && product.price > 0;
                    if (canBuy) {
                      addToCart({
                        id: product._id,
                        name: product.name,
                        image: imageUrl,
                        price: product.price!,
                      });
                      navigate("/cart");
                    } else {
                      navigate("/contact");
                    }
                  }}
                  className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 text-sm"
                >
                  <ShoppingCart size={18} />
                  {typeof product.price === "number" && product.price > 0 ? "Buy Now" : "Contact Us"}
                </motion.button>

                {/* Wishlist Toggle */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    toggleWishlist({
                      id: product._id,
                      name: product.name,
                      image: imageUrl,
                      description: product.description || "",
                      category: product.category,
                    })
                  }
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${
                    isInWishlist(product._id)
                      ? "bg-red-50 border-red-400 text-red-500 hover:bg-red-100"
                      : "bg-white border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500"
                  }`}
                  aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    size={18}
                    className={isInWishlist(product._id) ? "fill-red-500 text-red-500" : ""}
                  />
                  {isInWishlist(product._id) ? "Wishlisted" : "Wishlist"}
                </motion.button>

                {/* Back to Designs */}
                <Link to="/3d" className="flex-1 min-w-[140px]">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-primary text-primary font-semibold rounded-xl text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </motion.button>
                </Link>
              </div>
            </FloatCard>

            <FloatCard className="p-6" delay={0.2}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
                Key Highlights
              </h3>
              <div className="space-y-2.5">
                {features.map((feat, i) => {
                  const icons = [Box, Layers3, Sparkles, Package, Info];
                  const Icon = icons[i % icons.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        <span className="text-gray-400 mr-2 font-bold text-xs">0{i + 1}</span>
                        {feat}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </FloatCard>
          </div>
        </div>

        <FloatCard className="overflow-hidden" delay={0.35}>
          <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-shrink-0 px-5 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tabline-3d"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "Description" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">About This Design</h2>
                      <p className="text-gray-600 leading-relaxed">
                        {product.fullDescription ||
                          product.description ||
                          "This 3D design is created for practical presentation, model visualization, and scalable implementation workflows. It is structured to support both conceptual showcase and technical communication."}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-gray-800 mb-3">Design Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {imageList.slice(0, 6).map((img, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="overflow-hidden rounded-xl aspect-video bg-gray-100"
                          >
                            <img
                              src={img.url}
                              alt={`gallery-${i}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {product.uses?.length ? (
                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-3">Applications</h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {product.uses.map((use, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                              <Info size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{use}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {product.includes?.length ? (
                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-3">What’s Included</h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {product.includes.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                              <Package size={15} className="text-gray-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {activeTab === "Specification" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Technical Specifications</h2>
                    {product.specifications?.length ? (
                      <div className="overflow-hidden rounded-2xl border border-gray-100">
                        {product.specifications.map((spec, i) => (
                          <div
                            key={i}
                            className={`flex gap-4 px-5 py-4 ${
                              i % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } ${i !== 0 ? "border-t border-gray-100" : ""}`}
                          >
                            <span className="font-semibold text-gray-700 min-w-[40%] text-sm">
                              {spec.key}
                            </span>
                            <span className="text-gray-600 text-sm break-words flex-1">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No specifications added for this design yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "Warranty" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Warranty & Support</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        {
                          icon: Shield,
                          title: "Design Assurance",
                          desc: "Support is available for clarification, usage guidance, and delivery-related concerns.",
                        },
                        {
                          icon: Truck,
                          title: "Fast Assistance",
                          desc: "Our team responds quickly to questions related to deliverables and implementation support.",
                        },
                        {
                          icon: Package,
                          title: "Project Guidance",
                          desc: "Need customization or deployment help? Contact the team for project-specific assistance.",
                        },
                        {
                          icon: Info,
                          title: "Support Scope",
                          desc: "Covers technical clarification and review support, subject to the project package terms.",
                        },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={i}
                            className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-3">
                              <Icon size={18} className="text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "Review" && (
                  <div className="space-y-8">
                    <div className="grid lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-7 space-y-5">
                        <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl">
                          <div className="text-center">
                            <p className="text-5xl font-black text-gray-900">{avgRating}</p>
                            <StarRating rating={Math.round(avgRating)} size={16} />
                            <p className="text-xs text-gray-400 mt-1">
                              {product.reviews?.length || 0} reviews
                            </p>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = product.reviews?.filter((r) => r.rating === star).length || 0;
                              const pct = product.reviews?.length ? (count / product.reviews.length) * 100 : 0;
                              return (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                  <span className="w-4 text-gray-500">{star}</span>
                                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.8, delay: star * 0.08 }}
                                      className="h-full bg-yellow-400 rounded-full"
                                    />
                                  </div>
                                  <span className="w-4 text-gray-400">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                          {product.reviews?.length ? (
                            product.reviews.map((review) => (
                              <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    <User size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <StarRating rating={review.rating} size={13} />
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                              </motion.div>
                            ))
                          ) : (
                            <div className="bg-gray-50 border border-gray-100 p-10 rounded-2xl text-center">
                              <MessageCircle className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
                              <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
                              <p className="text-gray-500">Be the first to review this 3D design.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-5">
                        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                          <h3 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">
                            Submit a Review
                          </h3>

                          {!isAuthenticated ? (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />
                              <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                                  <Lock className="w-8 h-8 text-orange-500" />
                                </div>
                                <div>
                                  <h4 className="text-orange-800 font-bold text-lg mb-2">
                                    Authentication Required
                                  </h4>
                                  <p className="text-orange-600/80 text-sm mb-6 leading-relaxed">
                                    You must be logged in to submit a review. You can only review a design once.
                                  </p>
                                  <Link to="/login" className="block w-full">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md border-0 h-12 text-base font-semibold rounded-xl">
                                      Login to Review
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ) : hasReviewed ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                              <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                  <Check className="w-8 h-8 text-blue-500" />
                                </div>
                                <div>
                                  <h4 className="text-blue-800 font-bold text-lg mb-2">
                                    Review Submitted
                                  </h4>
                                  <p className="text-blue-600/80 text-sm leading-relaxed">
                                    You have already submitted a review for this design.
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
                                    <SelectItem value="5">5 - Excellent</SelectItem>
                                    <SelectItem value="4">4 - Very Good</SelectItem>
                                    <SelectItem value="3">3 - Good</SelectItem>
                                    <SelectItem value="2">2 - Fair</SelectItem>
                                    <SelectItem value="1">1 - Poor</SelectItem>
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

                              <button
                                type="submit"
                                disabled={submitLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 h-12 text-base font-semibold shadow-md transition-all hover:scale-[1.02] rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
                              >
                                {submitLoading ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Send size={16} />
                                    Submit Review
                                  </>
                                )}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Other Info" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>

                    <div className="space-y-3">
                      {faqItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl border border-gray-100 overflow-hidden"
                        >
                          <button
                            onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                            className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-blue-500 font-bold text-sm flex-shrink-0">Q</span>
                              <span className="text-sm font-semibold text-gray-800">{item.question}</span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                                openFaq === item.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {openFaq === item.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                                  <div className="flex items-start gap-3 pt-3">
                                    <span className="text-emerald-500 font-bold text-sm flex-shrink-0">A</span>
                                    <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </FloatCard>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          to="/3d"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Back to 3D Marketplace
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default ThreeDDetails;