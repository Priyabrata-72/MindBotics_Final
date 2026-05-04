import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { MapPin, Calendar, CreditCard, Box, Ban } from "lucide-react";
import { format } from "date-fns";

export interface OrderProps {
    _id: string;
    product: {
        name: string;
        image: string;
    };
    price: number;
    quantity: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    estimatedDeliveryDate?: string;
    shippingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
    trackingId?: string;
    courierName?: string;
    trackingSteps: any[];
}

interface OrderCardProps {
    order: OrderProps;
    onTrackClick: (order: OrderProps) => void;
    onCancelClick?: (orderId: string) => void;
}

export const OrderCard = ({ order, onTrackClick, onCancelClick }: OrderCardProps) => {
    const isCancelable = ["placed", "confirmed", "packed"].includes(order.orderStatus?.toLowerCase());

    const formatAddress = (address: any) => {
        if (!address) return "No shipping address provided";
        const parts = [address.street, address.city, address.state, address.zipCode].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "No shipping address provided";
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-gray-200 bg-white">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row border-l-4 border-indigo-500">
                    {/* Product Image */}
                    <div className="w-full sm:w-48 h-40 bg-gray-50 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 flex items-center justify-center overflow-hidden">
                        {order.product?.image ? (
                            <img 
                                src={order.product.image} 
                                alt={order.product.name || "Product"} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Box className="h-12 w-12 text-gray-300" />
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 p-5 flex flex-col sm:flex-row justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                                    {order.product?.name || "Unknown Product"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Order ID: #{order._id?.slice(-8).toUpperCase()}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {order.estimatedDeliveryDate ? (
                                        <span>Est. Delivery: {format(new Date(order.estimatedDeliveryDate), "MMM dd, yyyy")}</span>
                                    ) : (
                                        <span>Placed on {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "N/A"}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-gray-400" />
                                    <span>Payment: {order.paymentStatus || "N/A"}</span>
                                </div>
                                <div className="flex items-start gap-2 sm:col-span-2">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-1">{formatAddress(order.shippingAddress)}</span>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-4">
                                <p className="font-semibold text-gray-900">
                                    ₹{order.price?.toLocaleString() || "0"} 
                                    <span className="text-sm font-normal text-gray-500 ml-1">x {order.quantity || 1}</span>
                                </p>
                            </div>
                        </div>

                        {/* Actions & Status */}
                        <div className="flex flex-col sm:items-end justify-between gap-4 border-t sm:border-t-0 pt-4 sm:pt-0">
                            <OrderStatusBadge status={order.orderStatus as any} />
                            
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <Button 
                                    variant="default" 
                                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white"
                                    onClick={() => onTrackClick(order)}
                                >
                                    Track Order
                                </Button>
                                
                                {isCancelable && onCancelClick && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => onCancelClick(order._id)}
                                    >
                                        <Ban className="h-4 w-4 mr-2" />
                                        Cancel Order
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderCard;
