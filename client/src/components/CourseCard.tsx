import { Clock, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id?: string;
  image: string;
  title: string;
  shortDescription: string; // ✅ changed
  category: string;
  duration: string;
  rating: number;
  instructor?: string;
  instructorId?: string;
}

const CourseCard = ({
  id,
  image,
  title,
  shortDescription, // ✅ changed
  category,
  duration,
  rating,
  instructor,
}: CourseCardProps) => {

  const courseSlug =
    id ||
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border/50">

      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <Link to={`/course/${courseSlug}`}>
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* ✅ Fixed here */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {shortDescription}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration} weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Instructor */}
        {instructor && (
          <p className="text-sm text-muted-foreground mb-4">
            <span className="text-foreground font-medium">
              Instructor:
            </span>{" "}
            {instructor}
          </p>
        )}

        {/* CTA */}
        <Link to={`/course/${courseSlug}`}>
          <Button className="w-full group/btn">
            Explore Course
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
