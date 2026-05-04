import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "sonner";

interface Refund {
  _id: string;
  order: { _id: string; razorpayOrderId: string; totalAmount: number; status: string };
  razorpayRefundId: string;
  razorpayPaymentId: string;
  amount: number;
  status: string;
  reason: string;
  createdAt: string;
}

const RefundManagement = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/refunds");
      setRefunds(res.data);
    } catch (error) {
      console.error("Failed to fetch refunds", error);
      toast.error("Failed to fetch refunds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refunds</h1>
          <p className="text-muted-foreground">
            Monitor and track processed refunds.
          </p>
        </div>
      </div>

      <div className="border rounded-md mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Refund ID</TableHead>
              <TableHead>Order Info</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {refunds.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No refunds found.
                </TableCell>
              </TableRow>
            ) : (
              refunds.map((refund) => (
                <TableRow key={refund._id}>
                  <TableCell className="font-medium text-xs">
                    {refund.razorpayRefundId}
                    <br />
                    <span className="text-muted-foreground">
                      Pay: {refund.razorpayPaymentId}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    Ord: {refund.order?._id}
                    <br />
                    {refund.order?.razorpayOrderId}
                  </TableCell>
                  <TableCell>₹{refund.amount}</TableCell>
                  <TableCell>
                    <Badge variant={refund.status === "processed" || refund.status === "completed" ? "default" : "secondary"}>
                      {refund.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={refund.reason}>
                    {refund.reason}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(refund.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RefundManagement;
