import { Eye, Contact, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface ThreeDProductCardProps {
  id?: string;
  image: string;
  name: string;
  description: string;
  category?: string;
  price?: number;
  onAddToCart?: () => void;
}

const ThreeDProductCard = ({
  id,
  image,
  name,
  description,
  category,
  price,
}: ThreeDProductCardProps) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const productSlug = id || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const isWishlisted = id ? isInWishlist(id) : false;
  const normalizedPrice = typeof price === "number" && Number.isFinite(price) ? price : 0;

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) {
      toggleWishlist({ id, name, image, description, category });
    }
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) {
      addToCart({ id, name, image, price: normalizedPrice });
    }
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (id) {
      addToCart({ id, name, image, price: normalizedPrice });
    }

    navigate("/cart");
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border/50 relative">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {category && (
          <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            {category}
          </span>
        )}

        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 ${
            isWishlisted
              ? "bg-white text-red-500 shadow-md"
              : "bg-black/20 text-white hover:bg-white hover:text-red-500"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
        </button>

        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/3d/${productSlug}`}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </Link>

          <Button
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150"
            title="Add to Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
          </Button>

          <Button
            onClick={handleBuyNow}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-200"
            title="Buy Now"
          >
            <Contact className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Link to={`/3d/${productSlug}`}>
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

        {typeof price === "number" && Number.isFinite(price) && (
          <p className="text-primary font-bold text-lg mb-3">₹{price}/-</p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleBuyNow}>
            Buy Now
          </Button>

          <Button className="flex-1" onClick={() => navigate("/contact")}>
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThreeDProductCard;
