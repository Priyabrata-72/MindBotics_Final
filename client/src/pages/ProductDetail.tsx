import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useParams } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Check,
  Heart,
  Star,
  Truck,
  Shield,
  Wallet,
  Zap,
  Cpu,
  Activity,
  Globe,
  Lock,
  BarChart3,
  Send,
  ChevronDown,
  Building2,
  MapPin,
  Phone,
  Mail,
  Package,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import PageBanner from "@/components/PageBanner";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProductType {
  _id: string;
  name: string;
  description?: string;
  fullDescription?: string;
  category?: string;
  price?: number;
  images?: { url: string; public_id?: string }[];
  projectGallery?: { url: string; public_id?: string }[];
  keyFeature?: string[];
  specifications?: { key: string; value: string }[];
  uses?: string[];
  includes?: string[];
}

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

interface QnA {
  id: number;
  question: string;
  answer: string;
  author: string;
}

// ─── Static Mock Data ─────────────────────────────────────────────────────────
const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Aryan Mehta",
    rating: 5,
    comment:
      "Absolutely outstanding project. The build quality and documentation exceeded my expectations. Highly recommend!",
    date: "12 Apr 2026",
    avatar: "AM",
  },
  {
    id: 2,
    name: "Priya Sharma",
    rating: 4,
    comment:
      "Very well engineered. The real-time monitoring features are impressive. Minor docs improvements would be perfect.",
    date: "08 Apr 2026",
    avatar: "PS",
  },
  {
    id: 3,
    name: "Rahul Nair",
    rating: 5,
    comment:
      "Clean code, great architecture. The sensor accuracy is top-notch. Will definitely order again.",
    date: "01 Apr 2026",
    avatar: "RN",
  },
];

const MOCK_QNA: QnA[] = [
  {
    id: 1,
    question: "Is this compatible with Raspberry Pi 4?",
    answer:
      "Yes, it is fully compatible with Raspberry Pi 4 (2GB/4GB/8GB RAM variants). Check the specification tab for full compatibility details.",
    author: "MindBotics Team",
  },
  {
    id: 2,
    question: "What communication protocols does it support?",
    answer:
      "It supports MQTT, HTTP REST, WebSocket, and BLE 5.0 for flexible IoT deployments.",
    author: "MindBotics Team",
  },
];

const ICON_STRIP_ITEMS = [
  { icon: Truck, label: "Free Delivery", sub: "Orders above ₹999" },
  { icon: Shield, label: "1 Year Warranty", sub: "Manufacturer warranty" },
  { icon: Wallet, label: "Cash on Delivery", sub: "Available nationwide" },
];

const FEATURE_ICONS = [Zap, Cpu, Activity, Globe, Lock];

const TABS = [
  "Description",
  "Specification",
  "Warranty",
  "Review",
  "QnA",
  "Other Info",
];

// ─── Star Rating Component ────────────────────────────────────────────────────
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
        className={`transition-all duration-200 ${s <= rating
          ? "fill-yellow-400 text-yellow-400"
          : "fill-transparent text-gray-400"
          } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
      />
    ))}
  </div>
);

// ─── Floating Card Wrapper ────────────────────────────────────────────────────
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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    whileHover={{ y: -4, boxShadow: "0 24px 48px rgba(0,0,0,0.14)" }}
    className={`bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </motion.div>
);

// ─── Average Rating Calculation ───────────────────────────────────────────────
const avgRating = (reviews: Review[]) =>
  reviews.length
    ? parseFloat(
      (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    )
    : 0;

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { productId } = useParams();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Description");
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [qna, setQna] = useState<QnA[]>(MOCK_QNA);
  const [newQuestion, setNewQuestion] = useState("");
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 0,
    comment: "",
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<ProductType[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/projects/${productId}`);
        const data = res.data?.project || res.data;
        setProduct(data);

        // Fetch related projects
        const allRes = await api.get("/projects");
        const allProjects = allRes.data?.projects || [];
        const filtered = allProjects
          .filter((p: ProductType) => p.category === data.category && p._id !== data._id)
          .slice(0, 3);
        setRelatedProjects(filtered);
      } catch (error) {
        console.error("Product fetch error:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Project Not Found
            </h1>
            <p className="text-gray-500 mb-8">
              This project doesn't exist or has been removed.
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price || 0,
        image: imageUrl
      });
    }
  };

  const handleSubmitReview = () => {
    if (!newReview.name || !newReview.comment || !newReview.rating) {
      toast({ title: "⚠️ Incomplete", description: "Fill all review fields." });
      return;
    }
    const r: Review = {
      id: Date.now(),
      name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      avatar: newReview.name.slice(0, 2).toUpperCase(),
    };
    setReviews((prev) => [r, ...prev]);
    setNewReview({ name: "", rating: 0, comment: "" });
    toast({ title: "🌟 Review Submitted!", description: "Thank you!" });
  };

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) return;
    const q: QnA = {
      id: Date.now(),
      question: newQuestion,
      answer: "Our team will respond shortly. Thank you for your inquiry!",
      author: "You",
    };
    setQna((prev) => [q, ...prev]);
    setNewQuestion("");
    toast({
      title: "📨 Question Submitted",
      description: "We'll answer soon!",
    });
  };

  const avg = avgRating(reviews);
  const imageUrl =
    product.images?.[activeImageIndex]?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800";

  const features =
    product.keyFeature?.length
      ? product.keyFeature.slice(0, 5)
      : [
        "Real-time sensor data acquisition",
        "Cloud-connected via MQTT protocol",
        "Energy-efficient low-power design",
        "OTA firmware update support",
        "Modular & expandable architecture",
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      {/* ── Breadcrumb Banner ── */}
      {/* <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 pt-20 pb-10">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-gray-400 mb-3"
          >
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[200px]">{product.name}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            {product.name}
          </motion.h1>
        </div>
      </div> */}
      <PageBanner
        title={product.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: product.name },
        ]}
      />

      {/* ── MAIN BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ══════════════════════════════════════════
            SECTION 1 — TWO COLUMN HERO
        ══════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">

          {/* Left: Sticky Image Card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <FloatCard className="overflow-hidden p-0 group" delay={0}>
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-[380px] md:h-[440px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay Strip */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {product.category || "IoT Project"}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    In Stock
                  </span>
                </div>
              </div>

              {/* Thumbnail Row (other images) */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`thumb-${i}`}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all flex-shrink-0 ${activeImageIndex === i ? 'border-gray-800' : 'border-gray-200 hover:border-gray-700'}`}
                    />
                  ))}
                </div>
              )}
            </FloatCard>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-5">

            {/* ── Project Header ── */}
            <FloatCard className="p-6" delay={0.1}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    MindBotics Project
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">
                    {product.name}
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">In Stock</span>
                </div>
              </div>

              {/* Rating Row */}
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={Math.round(avg)} size={16} />
                <span className="text-sm font-semibold text-gray-700">{avg}</span>
                <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
              </div>

              <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-6">
                {product.description ||
                  "An advanced IoT engineering project built with cutting-edge sensors, real-time cloud connectivity, and a modular architecture designed for scalable industrial deployments."}
              </p>

              {/* Pricing Section */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Best Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary">₹{product.price || 0}/-</span>
                    <span className="text-base text-gray-400 line-through decoration-destructive/40 font-medium">
                      ₹{Math.round((product.price || 0) * 1.3)}/-
                    </span>
                  </div>
                </div>
                <div className="ml-auto bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <Zap size={14} />
                  <span>SAVE 30%</span>
                </div>
              </div>
            </FloatCard>

            {/* ── Action Buttons ── */}
            <FloatCard className="p-5" delay={0.15}>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 text-sm"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => product && toggleWishlist({
                    id: product._id,
                    name: product.name,
                    image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800",
                    description: product.description || "",
                    category: product.category
                  })}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${product && isInWishlist(product._id)
                    ? "bg-red-50 border-red-300 text-red-600 shadow-md shadow-red-200"
                    : "bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                    }`}
                >
                  <Heart
                    size={18}
                    className={product && isInWishlist(product._id) ? "fill-red-500 text-red-500" : ""}
                  />
                  {product && isInWishlist(product._id) ? "Wishlisted" : "Wishlist"}
                </motion.button>

                <Link to="/contact" className="flex-1 min-w-[120px]">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-primary text-primary font-semibold rounded-xl text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <Mail size={18} />
                    Contact Us
                  </motion.button>
                </Link>
              </div>
            </FloatCard>

            {/* ── Features (5 floating mini-cards) ── */}
            <FloatCard className="p-6" delay={0.2}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
                Key Features
              </h3>
              <div className="space-y-2.5">
                {features.map((feat, i) => {
                  const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all group cursor-default"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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

            {/* ── Icon Strip ── */}
            <div className="grid grid-cols-3 gap-3">
              {ICON_STRIP_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <FloatCard key={i} className="p-4 text-center" delay={0.3 + i * 0.05}>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2 hover:bg-gray-900 hover:text-white transition-all group">
                      <Icon size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs font-bold text-gray-800">{item.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                  </FloatCard>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 2 — TABS
        ══════════════════════════════════════════ */}
        <FloatCard className="overflow-hidden" delay={0.4}>

          {/* Tab Bar */}
          <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-shrink-0 px-5 py-4 text-sm font-semibold transition-all duration-300 ${activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-700"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tabline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >

                {/* ── DESCRIPTION ── */}
                {activeTab === "Description" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        About This Project
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {product.fullDescription ||
                          product.description ||
                          "This project represents the pinnacle of IoT engineering — combining precision sensor arrays with cloud-native architecture to deliver real-time insights across industrial environments. Built with scalability and reliability at its core, it serves as a complete monitoring and automation platform. The system leverages edge computing to minimize latency while the cloud dashboard provides comprehensive analytics."}
                      </p>
                    </div>

                    {/* Image Grid */}
                    <div>
                      <h3 className="text-base font-bold text-gray-800 mb-3">Project Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(product.projectGallery?.length ? product.projectGallery : (product.images?.length ? product.images : [{ url: imageUrl }]))
                          .slice(0, 6)
                          .map((img, i) => (
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

                    {/* Uses (if any) */}
                    {product.uses?.length ? (
                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-3">Common Applications</h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {product.uses.map((use, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                              <BarChart3 size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{use}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Includes */}
                    {product.includes?.length ? (
                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-3">Package Contents</h3>
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

                {/* ── SPECIFICATION ── */}
                {activeTab === "Specification" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Technical Specifications</h2>
                    {product.specifications?.length ? (
                      <div className="overflow-hidden rounded-2xl border border-gray-100">
                        {product.specifications.map((spec, i) => (
                          <div
                            key={i}
                            className={`flex gap-4 px-5 py-4 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
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
                      <div className="overflow-hidden rounded-2xl border border-gray-100">
                        {[
                          ["Model", "MB-IOT-PRO-2026"],
                          ["Microcontroller", "ESP32-S3 Dual Core 240MHz"],
                          ["Connectivity", "WiFi 2.4/5GHz, BLE 5.0, MQTT"],
                          ["Power Supply", "5V DC / 2A"],
                          ["Operating Temp", "-20°C to +85°C"],
                          ["Sensor Accuracy", "±0.1°C / ±1% RH"],
                          ["Data Rate", "Up to 10kHz sampling"],
                          ["Compatibility", "Raspberry Pi, Arduino, Python, MQTT"],
                          ["Dimensions", "85mm × 56mm × 22mm"],
                          ["Weight", "94g (without enclosure)"],
                        ].map(([k, v], i) => (
                          <div
                            key={i}
                            className={`flex gap-4 px-5 py-4 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } ${i !== 0 ? "border-t border-gray-100" : ""}`}
                          >
                            <span className="font-semibold text-gray-700 min-w-[40%] text-sm">{k}</span>
                            <span className="text-gray-600 text-sm flex-1">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── WARRANTY ── */}
                {activeTab === "Warranty" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Warranty Information</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        {
                          icon: Shield,
                          title: "1 Year Manufacturer Warranty",
                          desc: "Full coverage against manufacturing defects and component failures under normal operating conditions.",
                        },
                        {
                          icon: Truck,
                          title: "Free Return Shipping",
                          desc: "If your product is defective, we cover all return shipping costs within the warranty period.",
                        },
                        {
                          icon: Zap,
                          title: "Replacement Guarantee",
                          desc: "Faulty units are replaced within 5-7 business days after verification. No questions asked.",
                        },
                        {
                          icon: Info,
                          title: "What's Not Covered",
                          desc: "Physical damage, water damage, unauthorized modifications, or misuse are not covered under warranty.",
                        },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={i}
                            whileHover={{ y: -2 }}
                            className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-3">
                              <Icon size={18} className="text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="p-5 rounded-2xl bg-gray-900 text-white">
                      <h4 className="font-bold mb-2">📞 How to Claim Warranty</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Email us at{" "}
                        <span className="font-semibold text-white underline">
                          careers@mindbrain.co.in
                        </span>{" "}
                        with your order ID, purchase proof, and a description of the issue. Our team will respond within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── REVIEW ── */}
                {activeTab === "Review" && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">

                      {/* Reviews List */}
                      <div className="space-y-5">
                        {/* Summary */}
                        <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl">
                          <div className="text-center">
                            <p className="text-5xl font-black text-gray-900">{avg}</p>
                            <StarRating rating={Math.round(avg)} size={16} />
                            <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = reviews.filter((r) => r.rating === star).length;
                              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                              return (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                  <span className="w-4 text-gray-500">{star}</span>
                                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.8, delay: star * 0.1 }}
                                      className="h-full bg-yellow-400 rounded-full"
                                    />
                                  </div>
                                  <span className="w-4 text-gray-400">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Review Cards */}
                        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                          {reviews.map((review) => (
                            <motion.div
                              key={review.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-3 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {review.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                                    <p className="text-xs text-gray-400">{review.date}</p>
                                  </div>
                                  <StarRating rating={review.rating} size={13} />
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Review Form */}
                      <div>
                        <h3 className="font-bold text-gray-900 text-base mb-4">Write a Review</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                              Your Name
                            </label>
                            <input
                              type="text"
                              value={newReview.name}
                              onChange={(e) => setNewReview((r) => ({ ...r, name: e.target.value }))}
                              placeholder="Enter your name"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                              Your Rating
                            </label>
                            <div className="flex items-center gap-1 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              <StarRating
                                rating={newReview.rating}
                                interactive
                                onRate={(r) => setNewReview((prev) => ({ ...prev, rating: r }))}
                                size={22}
                              />
                              {newReview.rating > 0 && (
                                <span className="ml-2 text-sm text-gray-600">
                                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][newReview.rating]}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                              Your Review
                            </label>
                            <textarea
                              rows={4}
                              value={newReview.comment}
                              onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value }))}
                              placeholder="Share your experience with this project..."
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                            />
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmitReview}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white font-semibold rounded-xl text-sm shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 transition-all"
                          >
                            <Send size={16} />
                            Submit Review
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── QnA ── */}
                {activeTab === "QnA" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Questions & Answers</h2>

                    {/* Ask Question */}
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <h3 className="font-semibold text-gray-800 text-sm mb-3">Ask a Question</h3>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                          placeholder="Type your question here..."
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAskQuestion}
                          className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Send size={15} />
                          Ask
                        </motion.button>
                      </div>
                    </div>

                    {/* QnA List */}
                    <div className="space-y-3">
                      {qna.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
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
                              className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === item.id ? "rotate-180" : ""
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
                                    <div>
                                      <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                                      <p className="text-xs text-gray-400 mt-1">— {item.author}</p>
                                    </div>
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

                {/* ── OTHER INFO ── */}
                {activeTab === "Other Info" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        {
                          icon: Building2,
                          label: "Company Name",
                          value: "MindBrain Innovations Pvt. Ltd.",
                        },
                        {
                          icon: MapPin,
                          label: "Address",
                          value: "DCB-902, DLF CYBER CITY, Chandaka Industrial Estate, Patia, Bhubaneswar, Odisha 751024",
                        },
                        {
                          icon: Phone,
                          label: "Mobile Number",
                          value: "+91 9178587486",
                        },
                        {
                          icon: Mail,
                          label: "Email ID",
                          value: "careers@mindbrain.co.in",
                        },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ y: -2 }}
                            className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                              <Icon size={18} className="text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                                {item.label}
                              </p>
                              <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Map placeholder */}
                    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <div>
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3740.8250126035728!2d85.80780899999999!3d20.348846399999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909525dd71d6b%3A0xcdfa48116cf16775!2sMindBrain%20Innovations%20Private%20Limited%20(Custom%20Software%20Development%2C%20IT%20Staffing%2C%20AI_IOT_Robotics%20Training%20and%20Research%20Hub)!5e0!3m2!1sen!2sin!4v1777008384654!5m2!1sen!2sin" style={{ width: "100%", height: "100%", border: 0 }}></iframe>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </FloatCard>

        {/* ══════════════════════════════════════════
            SECTION 3 — RELATED PROJECTS
        ══════════════════════════════════════════ */}
        {relatedProjects.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Projects</h2>
                <div className="h-1 w-20 bg-gray-900 rounded-full" />
              </div>
              <Link
                to="/projects"
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
              >
                View All Projects
                <ArrowLeft size={16} className="rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProjects.map((proj, idx) => (
                <motion.div
                  key={proj._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductCard
                    id={proj._id}
                    name={proj.name}
                    description={proj.description || ""}
                    image={proj.images?.[0]?.url || "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800"}
                    category={proj.category}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Back Navigation ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Back to All Projects
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
