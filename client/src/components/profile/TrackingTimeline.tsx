import { CheckCircle2, Circle, Package, Truck, Home } from "lucide-react";
import { format } from "date-fns";

export interface TrackingStep {
    status: string;
    completed: boolean;
    date?: string | null;
    description?: string;
    isEstimated?: boolean;
}

interface TrackingTimelineProps {
    steps: TrackingStep[];
    currentStatus?: string;
    estimatedDeliveryDate?: string;
}

export const TrackingTimeline = ({ steps, currentStatus, estimatedDeliveryDate }: TrackingTimelineProps) => {

    // Map status to an icon
    const getIconForStep = (status: string, completed: boolean, isCurrent: boolean) => {
        let iconClass = "text-gray-300";
        if (completed) iconClass = "text-green-500";
        else if (isCurrent) iconClass = "text-blue-500";

        if (completed) {
            return <CheckCircle2 className={`h-6 w-6 ${iconClass} fill-white`} />;
        }

        switch (status?.toLowerCase()) {
            case "packed":
            case "processing":
                return <Package className={`h-6 w-6 ${iconClass}`} />;
            case "shipped":
            case "out for delivery":
                return <Truck className={`h-6 w-6 ${iconClass}`} />;
            case "delivered":
                return <Home className={`h-6 w-6 ${iconClass}`} />;
            case "cancelled":
            case "returned":
                return <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="block h-2 w-2 rounded-full bg-red-500"></span>
                </div>;
            default:
                return <Circle className={`h-6 w-6 ${iconClass}`} />;
        }
    };

    // Use the backend-provided steps directly (Manual Admin Timeline)
    const processedSteps = steps.map((step, index) => {
        // Find the first step that is not completed to mark it as the current active step
        const firstPendingIndex = steps.findIndex(s => !s.completed);
        
        let updatedDate = step.date;
        
        // Fallback to estimatedDeliveryDate for the Delivered step if no date is set
        if (step.status?.toLowerCase() === "delivered" && !step.completed && !step.date && estimatedDeliveryDate) {
            updatedDate = estimatedDeliveryDate;
        }
        
        return {
            ...step,
            date: updatedDate,
            isCurrent: index === firstPendingIndex
        };
    });

    return (
        <div className="relative py-2 pl-8 space-y-8">
            {/* Base gray dashed line spanning the whole timeline */}
            <div className="absolute top-4 bottom-0 left-4 w-[2px] border-l-2 border-dashed border-gray-200 -ml-[1px] z-0"></div>

            {processedSteps.map((step, index) => {
                const isCompleted = step.completed;
                const isCurrent = step.isCurrent;

                return (
                    <div key={index} className="relative z-10 min-h-[2.5rem]">
                        {/* Connecting Line overrides for completed portions */}
                        {index !== steps.length - 1 && isCompleted && (
                            <div className="absolute top-8 -bottom-8 left-[-1rem] w-[2px] bg-green-500 -ml-[1px] z-0"></div>
                        )}
                        {/* If the current step is active, the line connecting FROM the previous to here was green, but from HERE to next is dashed gray, which is already handled by the background line. */}

                        {/* Icon marker */}
                        <div className={`absolute -left-8 top-0 flex h-8 w-8 items-center justify-center bg-white z-10 rounded-full ${isCurrent ? "ring-4 ring-blue-50" : ""}`}>
                            {getIconForStep(step.status, isCompleted, isCurrent)}
                        </div>

                        {/* Step Details */}
                        <div className="pl-4">
                            <h4 className={`text-base font-semibold ${isCompleted ? "text-gray-900" : isCurrent ? "text-blue-600" : "text-gray-400"}`}>
                                {step.status}
                                {isCurrent && <span className="ml-2 text-[10px] uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-bold">In Progress</span>}
                            </h4>

                            {step.description && (
                                <p className={`text-sm mt-1 ${isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"}`}>
                                    {step.description}
                                </p>
                            )}

                            {step.date && (
                                <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    {!isCompleted && <span className="text-xs font-semibold text-gray-500">Expected:</span>}
                                    <span className="text-xs font-medium text-gray-700">{format(new Date(step.date), "dd MMM yyyy")}</span>
                                    {step.date.includes('T') && new Date(step.date).getHours() !== 0 && (
                                        <>
                                            <span className="hidden sm:inline text-gray-300">•</span>
                                            <span className="text-xs text-gray-500">{format(new Date(step.date), "hh:mm a")}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TrackingTimeline;
