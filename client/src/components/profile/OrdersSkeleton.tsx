import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const OrdersSkeleton = () => {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((item) => (
                <Card key={item} className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row border-l-4 border-transparent">
                            {/* Image Skeleton */}
                            <div className="w-full sm:w-48 h-32 bg-gray-100 flex-shrink-0">
                                <Skeleton className="w-full h-full rounded-none" />
                            </div>

                            {/* Content Skeleton */}
                            <div className="flex-1 p-4 flex flex-col sm:flex-row justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex gap-4 mt-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:items-end justify-between gap-3">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default OrdersSkeleton;
