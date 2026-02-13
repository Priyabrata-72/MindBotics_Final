import { Eye, Contact } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface ProductCardProps {
  id?: string;
  image: string;
  name: string;
  description: string;
  category?: string;
  onAddToCart?: () => void;
}

const ProductCard = ({
  id,
  image,
  name,
  description,
  category,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const productSlug = id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border/50">
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

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/product/${productSlug}`}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <Button
            onClick={() => navigate("/contact")}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150"
          >
            <Contact className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Link to={`/product/${productSlug}`}>
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
        
        <Button className="w-full" onClick={() => navigate("/contact")}>
          Contact Us
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
