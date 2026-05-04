import { useState, useEffect } from "react";
import { PackageSearch, AlertCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { OrderCard, OrderProps } from "./OrderCard";
import { OrdersSkeleton } from "./OrdersSkeleton";
import { EmptyOrdersState } from "./EmptyOrdersState";
import { OrderTrackingModal } from "./OrderTrackingModal";

export const TrackProductSection = () => {
    const [orders, setOrders] = useState<OrderProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<OrderProps | null>(null);
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    
    const { toast } = useToast();

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not authenticated");

            const res = await api.get("/orders/my-orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data && res.data.orders) {
                setOrders(res.data.orders);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err: any) {
            console.error("Failed to fetch orders:", err);
            setError(err.response?.data?.message || "Could not load your orders. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleTrackClick = (order: OrderProps) => {
        setSelectedOrder(order);
        setIsTrackModalOpen(true);
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            const token = localStorage.getItem("token");
            
            await api.patch(`/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast({
                title: "Order Cancelled",
                description: "Your order has been cancelled successfully."
            });
            
            // Refresh orders
            fetchOrders();
        } catch (error: any) {
            toast({
                title: "Cancellation Failed",
                description: error.response?.data?.message || "Could not cancel order at this time.",
                variant: "destructive"
            });
        }
    };

    return (
        <section className="mt-4 animate-in fade-in duration-300">
            <Card className="border-none shadow-none bg-transparent">
                {error && (
                    <div className="flex justify-end mb-4">
                        <Button variant="outline" size="sm" onClick={fetchOrders} className="hidden sm:flex">
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                )}
                
                <CardContent className="px-0">
                    {error ? (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                <span>{error}</span>
                                <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-4 h-8">
                                    Try Again
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    {isLoading ? (
                        <OrdersSkeleton />
                    ) : orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <OrderCard 
                                    key={order._id} 
                                    order={order} 
                                    onTrackClick={handleTrackClick} 
                                    onCancelClick={handleCancelOrder}
                                />
                            ))}
                        </div>
                    ) : (
                        !error && <EmptyOrdersState />
                    )}
                </CardContent>
            </Card>

            {selectedOrder && (
                <OrderTrackingModal 
                    isOpen={isTrackModalOpen}
                    onClose={() => setIsTrackModalOpen(false)}
                    orderId={selectedOrder._id}
                    productName={selectedOrder.product?.name}
                    trackingSteps={selectedOrder.trackingSteps || []}
                    currentStatus={selectedOrder.orderStatus}
                    estimatedDelivery={selectedOrder.estimatedDeliveryDate}
                    trackingId={selectedOrder.trackingId}
                    courierName={selectedOrder.courierName}
                />
            )}
        </section>
    );
};

export default TrackProductSection;
