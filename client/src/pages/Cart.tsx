import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
    };
  }
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
}

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const shipping = subtotal > 100 || cartItems.length === 0 ? 0 : 10;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      return;
    }

    if (!phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details and your phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCheckingOut(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast({
          title: "Payment unavailable",
          description: "Unable to load Razorpay checkout. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { data } = await api.post("/payments/create-order", {
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        shippingAddress,
        phone,
      });

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "MindBotics",
        description: "Cart Checkout",
        order_id: data.order.id,
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response) => {
          try {
            await api.post("/payments/verify", response);
            clearCart();
            toast({
              title: "Payment successful",
              description: "Your payment has been verified successfully.",
            });
          } catch (error) {
            console.error("Payment verification failed", error);
            toast({
              title: "Payment verification failed",
              description: "Please contact support if money was deducted.",
              variant: "destructive",
            });
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        toast({
          title: "Payment failed",
          description: response.error?.description || "Please try again.",
          variant: "destructive",
        });
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Failed to start checkout", error);
      toast({
        title: "Checkout failed",
        description: error.response?.data?.message || "Unable to start payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <PageBanner 
        title="Shopping Cart" 
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} 
      />

       <section className="py-16">
        <div className="container mx-auto px-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button asChild>
                <Link to="/projects">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items and Shipping */}
              <div className="lg:col-span-2 space-y-8">
                {/* Cart Items */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Cart Items ({cartItems.length})</h2>
                  {cartItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{item.name}</h3>
                            <p className="text-primary font-bold">₹{item.price.toLocaleString()}/-</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}/-</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Shipping Details */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2 mt-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          placeholder="Enter your phone number" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Street Address</label>
                        <Input 
                          value={shippingAddress.street} 
                          onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})} 
                          placeholder="Enter street address" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">City</label>
                          <Input 
                            value={shippingAddress.city} 
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} 
                            placeholder="City" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">State</label>
                          <Input 
                            value={shippingAddress.state} 
                            onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} 
                            placeholder="State" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">ZIP Code</label>
                          <Input 
                            value={shippingAddress.zipCode} 
                            onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})} 
                            placeholder="ZIP Code" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Country</label>
                          <Input 
                            value={shippingAddress.country} 
                            onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})} 
                            placeholder="Country" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}/-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString()}/-`}</span>
                    </div>
                    {shipping > 0 && subtotal > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Free shipping on orders over ₹10,000/-
                      </p>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}/-</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? "Starting Payment..." : "Proceed to Checkout"}
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/projects">Continue Shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
