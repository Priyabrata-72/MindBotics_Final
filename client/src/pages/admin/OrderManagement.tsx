import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { Eye, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  _id: string;
  user: { _id: string; username: string; email: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  trackingId?: string;
  courierName?: string;
  estimatedDeliveryDate?: string;
  statusHistory?: {
    status: string;
    message: string;
    updatedAt: string;
  }[];
  trackingTimeline?: {
    step: string;
    status: string;
    date: string | null;
    note: string;
  }[];
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({
    trackingId: "",
    courierName: "",
    estimatedDeliveryDate: "",
    trackingTimeline: [] as any[],
  });

  const getLocalDatetime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/orders?page=${page}&limit=10${search ? `&search=${search}` : ''}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search]);

  const handleCancelOrder = async (id: string) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    
    try {
      await api.post(`/admin/orders/${id}/cancel`, { reason });
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (error: any) {
      console.error("Failed to cancel order", error);
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error: any) {
      console.error("Failed to update status", error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleUpdateTracking = async () => {
    if (!selectedOrder) return;
    try {
      await api.put(`/admin/orders/${selectedOrder._id}/tracking`, trackingData);
      toast.success("Tracking details updated successfully");
      setIsTrackingModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error("Failed to update tracking", error);
      toast.error(error?.response?.data?.message || "Failed to update tracking");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and cancellations.
          </p>
        </div>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search by user email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium text-xs">{order._id}</TableCell>
                  <TableCell>
                    {order.user?.username} <br/>
                    <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                  </TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={order.status}
                      onValueChange={(val) => handleUpdateStatus(order._id, val)}
                      disabled={order.status === 'cancelled' || order.status === 'refunded' || order.status === 'cancel_requested'}
                    >
                      <SelectTrigger className={`w-[130px] h-8 text-xs ${order.status === 'cancelled' || order.status === 'refunded' ? 'border-red-500 text-red-500' : ''}`}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Placed">Placed</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Packed">Packed</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        {(order.status === 'Cancelled' || order.status === 'Returned') && (
                          <>
                            <SelectItem value="Cancelled" disabled>Cancelled</SelectItem>
                            <SelectItem value="Returned" disabled>Returned</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.paymentStatus === "captured" ? "default" : "secondary"}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedOrder(order);
                      setTrackingData({
                        trackingId: order.trackingId || "",
                        courierName: order.courierName || "",
                        estimatedDeliveryDate: order.estimatedDeliveryDate ? order.estimatedDeliveryDate.split('T')[0] : "",
                        trackingTimeline: order.trackingTimeline && order.trackingTimeline.length > 0 ? order.trackingTimeline : [
                          { step: "Placed", status: "completed", date: order.createdAt, note: "Order placed successfully" },
                          { step: "Confirmed", status: "pending", date: "", note: "" },
                          { step: "Packed", status: "pending", date: "", note: "" },
                          { step: "Shipped", status: "pending", date: "", note: "" },
                          { step: "Out for Delivery", status: "pending", date: "", note: "" },
                          { step: "Delivered", status: "pending", date: "", note: "" }
                        ]
                      });
                      
                      setIsTrackingModalOpen(true);
                    }}>
                      Tracking
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedOrder(order);
                      setIsViewModalOpen(true);
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      disabled={order.status === 'cancelled' || order.status === 'refunded' || order.status === 'cancel_requested'}
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button 
          variant="outline" 
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page} of {totalPages || 1}</span>
        <Button 
          variant="outline" 
          disabled={page >= totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?._id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Customer</h4>
                  <p>{selectedOrder.user?.username} ({selectedOrder.user?.email})</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Date</h4>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Status</h4>
                  <p className="capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">Payment Status</h4>
                  <p className="capitalize">{selectedOrder.paymentStatus}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                      <span>{item.name} x {item.qty}</span>
                      <span>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2">
                    <span>Total Amount</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Shipping Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Address:</span>
                    {selectedOrder.shippingAddress ? (
                      <p>
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}<br />
                        {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.zipCode}<br />
                        {selectedOrder.shippingAddress.country}
                      </p>
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 block">Phone:</span>
                    <p>{selectedOrder.phone || "N/A"}</p>
                    <span className="text-gray-500 block mt-2">Tracking:</span>
                    <p>
                      {selectedOrder.courierName || "No Courier"} - {selectedOrder.trackingId || "No Tracking ID"}
                      {selectedOrder.estimatedDeliveryDate && <><br />Est. Delivery: {new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString()}</>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Status History</h4>
                <div className="space-y-2 text-sm max-h-[150px] overflow-y-auto pr-2">
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                    selectedOrder.statusHistory.slice().reverse().map((history: any, idx: number) => (
                      <div key={idx} className="flex justify-between border-b pb-1">
                        <div>
                          <span className="font-medium">{history.status}</span>
                          <p className="text-xs text-gray-500">{history.message}</p>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(history.updatedAt).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No status history available.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking Modal */}
      <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Tracking Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Courier Name</label>
              <Input 
                placeholder="e.g., FedEx, BlueDart" 
                value={trackingData.courierName}
                onChange={(e) => setTrackingData(prev => ({...prev, courierName: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking ID</label>
              <Input 
                placeholder="Tracking Number" 
                value={trackingData.trackingId}
                onChange={(e) => setTrackingData(prev => ({...prev, trackingId: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Delivery Date & Time</label>
              <Input 
                type="datetime-local"
                value={trackingData.estimatedDeliveryDate ? getLocalDatetime(trackingData.estimatedDeliveryDate) : ""}
                onChange={(e) => setTrackingData(prev => ({...prev, estimatedDeliveryDate: e.target.value ? new Date(e.target.value).toISOString() : ""}))}
              />
            </div>
            
            <div className="space-y-2 pt-3 border-t mt-3">
              <h3 className="font-semibold text-sm text-blue-600">Manual Timeline Update</h3>
              
              <div className="hidden sm:grid grid-cols-12 gap-1 px-1.5 text-[11px] font-semibold text-gray-500 mb-0.5">
                  <div className="col-span-2">Tracking Step</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-4">Date & Time</div>
                  <div className="col-span-4">Extra Notes</div>
              </div>

              <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                {trackingData.trackingTimeline.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center text-xs border p-1.5 rounded bg-gray-50">
                        <div className="sm:col-span-2 font-semibold text-gray-800 truncate" title={item.step}>{item.step}</div>
                        <div className="sm:col-span-2">
                            <Select 
                                value={item.status} 
                                onValueChange={(val) => {
                                    const newTimeline = [...trackingData.trackingTimeline];
                                    newTimeline[idx].status = val;
                                    if (val === 'completed' && !newTimeline[idx].date) {
                                        newTimeline[idx].date = new Date().toISOString();
                                    }
                                    setTrackingData({...trackingData, trackingTimeline: newTimeline});
                                }}
                            >
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="sm:col-span-4">
                            <Input 
                                type="datetime-local" 
                                className="h-8 text-xs w-full px-2"
                                value={item.date ? getLocalDatetime(item.date) : ""}
                                onChange={(e) => {
                                    const newTimeline = [...trackingData.trackingTimeline];
                                    newTimeline[idx].date = e.target.value ? new Date(e.target.value).toISOString() : "";
                                    setTrackingData({...trackingData, trackingTimeline: newTimeline});
                                }}
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <Input 
                                placeholder="Extra info..." 
                                className="h-8 text-xs w-full px-2"
                                value={item.note || ""}
                                onChange={(e) => {
                                    const newTimeline = [...trackingData.trackingTimeline];
                                    newTimeline[idx].note = e.target.value;
                                    setTrackingData({...trackingData, trackingTimeline: newTimeline});
                                }}
                            />
                        </div>
                    </div>
                ))}
              </div>
            </div>

            <Button className="w-full mt-4" onClick={handleUpdateTracking}>
              Save Tracking Timeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
