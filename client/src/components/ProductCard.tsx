import { Eye, Contact, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id?: string;
  image: string;
  name: string;
  description: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  onAddToCart?: () => void;
}

const ProductCard = ({
  id,
  image,
  name,
  description,
  category,
  price = 9199,
  originalPrice = 13000,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const productSlug = id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const isWishlisted = id ? isInWishlist(id) : false;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) {
      toggleWishlist({ id, name, image, description, category });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) {
      addToCart({ id, name, image, price });
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) {
      addToCart({ id, name, image, price });
      navigate("/cart");
    }
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border/50 relative">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        {category && (
          <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            {category}
          </span>
        )}

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 ${
            isWishlisted 
              ? "bg-white text-red-500 shadow-md" 
              : "bg-black/20 text-white hover:bg-white hover:text-red-500"
          }`}
        >
          <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
        </button>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/product/${productSlug}`}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <Button
            onClick={() => navigate("/contact")}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-200"
          >
            <Contact className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2 group">
          <Link to={`/product/${productSlug}`} className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors hover:underline">
              {name}
            </h3>
          </Link>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
        
        {/* Pricing Section */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl font-bold text-primary">₹{price.toLocaleString()}/-</span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
              ₹{originalPrice.toLocaleString()}/-
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" 
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
            onClick={() => navigate("/contact")}
          >
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
