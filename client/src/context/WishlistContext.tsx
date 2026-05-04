import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  description: string;
  category?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Load wishlist data when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const savedWishlist = localStorage.getItem(`mindbotics_wishlist_${user.id}`);
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          setWishlist(Array.isArray(parsedWishlist) ? parsedWishlist : []);
        } catch (error) {
          console.error("Error parsing wishlist from localStorage:", error);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
      setIsLoaded(true);
    } else {
      setWishlist([]);
      setIsLoaded(false);
    }
  }, [isAuthenticated, user?.id]);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (isLoaded && isAuthenticated && user?.id) {
      localStorage.setItem(`mindbotics_wishlist_${user.id}`, JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded, isAuthenticated, user?.id]);

  const toggleWishlist = (item: WishlistItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login first to use the wishlist.",
        variant: "destructive",
      });
      return;
    }

    setWishlist((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        toast({
          title: "Removed from Wishlist",
          description: `${item.name} has been removed.`,
        });
        return prev.filter((i) => i.id !== item.id);
      } else {
        toast({
          title: "Added to Wishlist",
          description: `${item.name} has been added.`,
        });
        return [...prev, item];
      }
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id));
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
