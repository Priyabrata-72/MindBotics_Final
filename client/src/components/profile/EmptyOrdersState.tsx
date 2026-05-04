import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EmptyOrdersState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 max-w-sm mb-6">
                You haven't placed any orders yet. Browse our products and find something you like!
            </p>
            <Button asChild>
                <Link to="/projects">Browse Products</Link>
            </Button>
        </div>
    );
};

export default EmptyOrdersState;
