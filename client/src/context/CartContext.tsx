import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, change: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Load cart data when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const savedCart = localStorage.getItem(`mindbotics_cart_${user.id}`);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setIsLoaded(true);
    } else {
      setCartItems([]);
      setIsLoaded(false);
    }
  }, [isAuthenticated, user?.id]);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded && isAuthenticated && user?.id) {
      localStorage.setItem(`mindbotics_cart_${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded, isAuthenticated, user?.id]);

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login first to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        toast({
          title: "Updated Quantity",
          description: `${product.name} quantity increased in your cart.`,
        });
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(i => i.id === id);
      if (itemToRemove) {
        toast({
          title: "Removed from Cart",
          description: `${itemToRemove.name} has been removed.`,
        });
      }
      return prevItems.filter((item) => item.id !== id);
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (user?.id) {
      localStorage.removeItem(`mindbotics_cart_${user.id}`);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
