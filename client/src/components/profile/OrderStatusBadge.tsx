import { Badge } from "@/components/ui/badge";

type OrderStatus = "Placed" | "Confirmed" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let customClass = "";

    switch (status?.toLowerCase()) {
        case "placed":
            variant = "secondary";
            customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
            break;
        case "confirmed":
        case "packed":
            variant = "secondary";
            customClass = "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
            break;
        case "shipped":
        case "out for delivery":
            variant = "secondary";
            customClass = "bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80";
            break;
        case "delivered":
            variant = "secondary";
            customClass = "bg-green-100 text-green-800 hover:bg-green-100/80";
            break;
        case "cancelled":
        case "returned":
            variant = "destructive";
            break;
        default:
            variant = "outline";
    }

    return (
        <Badge variant={variant} className={`font-medium ${customClass}`}>
            {status || "Unknown"}
        </Badge>
    );
};

export default OrderStatusBadge;
