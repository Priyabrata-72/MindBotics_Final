import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { TrackingTimeline, TrackingStep } from "./TrackingTimeline";

interface OrderTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    productName: string;
    trackingSteps: TrackingStep[];
    currentStatus: string;
    estimatedDelivery?: string;
    trackingId?: string;
    courierName?: string;
}

export const OrderTrackingModal = ({
    isOpen,
    onClose,
    orderId,
    productName,
    trackingSteps,
    currentStatus,
    estimatedDelivery,
    trackingId,
    courierName,
}: OrderTrackingModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Track Order</DialogTitle>
                    <DialogDescription>
                        Order ID: <span className="font-medium text-gray-900">{orderId}</span>
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="font-medium text-gray-900 line-clamp-1">{productName}</p>
                        
                        {(trackingId || courierName) && (
                            <div className="mt-2 text-sm">
                                {courierName && <p className="text-gray-600">Courier: <span className="font-medium text-gray-900">{courierName}</span></p>}
                                {trackingId && <p className="text-gray-600">Tracking ID: <span className="font-medium text-gray-900">{trackingId}</span></p>}
                            </div>
                        )}

                        {estimatedDelivery && (
                            <p className="text-sm text-gray-600 mt-2">
                                Estimated Delivery: <span className="font-medium">{new Date(estimatedDelivery).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </p>
                        )}
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        <TrackingTimeline steps={trackingSteps} currentStatus={currentStatus} estimatedDeliveryDate={estimatedDelivery} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OrderTrackingModal;
