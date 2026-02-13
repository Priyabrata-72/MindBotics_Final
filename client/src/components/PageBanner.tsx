import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface PageBannerProps {
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  backgroundImage?: string;
}

const PageBanner = ({ title, breadcrumbs, backgroundImage }: PageBannerProps) => {
  return (
    <section
      className="relative min-h-[300px] md:min-h-[400px] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
          {title}
        </h1>
        <nav className="flex items-center justify-center gap-2 text-primary-foreground/80">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-primary-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-primary">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Decorative shapes */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/4 right-10 w-20 h-20 bg-secondary/30 rounded-full" />
    </section>
  );
};

export default PageBanner;
