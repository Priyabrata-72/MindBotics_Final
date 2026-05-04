import React from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";

const Wishlist = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <PageBanner
        title="Your Wishlist"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Wishlist" },
        ]}
      />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {wishlist.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <Heart size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Add some items to your wishlist to keep track of projects you're interested in.
                </p>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
                >
                  <ShoppingBag size={18} />
                  Explore Projects
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                layout
              >
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Saved Items ({wishlist.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {wishlist.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <ProductCard
                        id={item.id}
                        name={item.name}
                        description={item.description}
                        image={item.image}
                        category={item.category}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
