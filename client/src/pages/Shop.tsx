import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import course1 from "@/assets/course-1.jpg";
import course2 from "@/assets/course-2.jpg";
import course3 from "@/assets/course-3.jpg";

const categories = ["All", "Kits", "Boards", "Components", "Robotics", "Tools"];
const sortOptions = ["Default", "Newest"];

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  image: string;
}

const allProducts = [
  { id: "arduino-starter-kit", image: gallery1, name: "Arduino Starter Kit", description: "Complete kit with Arduino Uno and components", category: "Kits" },
  { id: "raspberry-pi-bundle", image: gallery2, name: "Raspberry Pi 4 Bundle", description: "Pi 4 with case, power supply, and accessories", category: "Boards" },
  { id: "sensor-pack", image: course1, name: "Sensor Pack (30 pieces)", description: "30 different sensors for IoT projects", category: "Components" },
  { id: "robot-car-kit", image: course2, name: "Robot Car Chassis Kit", description: "4WD robot platform with motors", category: "Robotics" },
  { id: "esp32-board", image: course3, name: "ESP32 Development Board", description: "WiFi & Bluetooth microcontroller", category: "Boards" },
  { id: "drone-diy-kit", image: gallery1, name: "Drone DIY Kit", description: "Build your own quadcopter", category: "Kits" },
  { id: "servo-motor-set", image: gallery2, name: "Servo Motor Set", description: "10 pcs SG90 micro servos", category: "Components" },
  { id: "smart-home-kit", image: course1, name: "Smart Home Kit", description: "Home automation starter kit", category: "Kits" },
  { id: "soldering-kit", image: course2, name: "Soldering Kit Pro", description: "60W soldering iron with accessories", category: "Tools" },
  { id: "jumper-wire-set", image: course3, name: "Jumper Wire Set", description: "200 pcs male-male, male-female wires", category: "Components" },
  { id: "robot-arm-kit", image: gallery1, name: "Robot Arm Kit", description: "6 DOF robotic arm for education", category: "Robotics" },
  { id: "arduino-mega", image: gallery2, name: "Arduino Mega 2560", description: "54 I/O pins microcontroller board", category: "Boards" },
];

const Shop = () => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Default");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = activeCategory === "All"
      ? [...allProducts]
      : allProducts.filter(p => p.category === activeCategory);

    return filtered;
  }, [activeCategory, sortBy]);

  const addToCart = (product: typeof allProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: product.id, name: product.name, quantity: 1, image: product.image }];
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageBanner
        title="Shop"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop" },
        ]}
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <Button
                variant="outline"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.image}
                name={product.name}
                description={product.description}
                category={product.category}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-xl animate-slide-in-right">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Shopping Cart ({cartCount})</h2>
                <button onClick={() => setIsCartOpen(false)}>
                  <X className="w-6 h-6 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-muted/30 p-4 rounded-xl">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-border">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Shop;
