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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface FeedbackItem {
  _id: string;
  name: string;
  email: string;
  rating: "Excellent" | "Good" | "Average" | "Poor";
  feedback: string;
  createdAt: string;
}

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/feedback?page=${page}&limit=10`);
      const data = res.data;

      if (res.status === 200) {
        setFeedback(data.feedback || []);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch feedback", error);
      toast.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      try {
        await api.delete(`/admin/feedback/${id}`);
        setFeedback((prev) => prev.filter((item) => item._id !== id));
        toast.success("Feedback deleted successfully");
      } catch (error) {
        console.error("Failed to delete feedback", error);
        toast.error("Failed to delete feedback");
      }
    }
  };

  const filteredFeedback = feedback.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.email?.toLowerCase().includes(search.toLowerCase()) ||
    item.rating?.toLowerCase().includes(search.toLowerCase()) ||
    item.feedback?.toLowerCase().includes(search.toLowerCase())
  );

  const getRatingVariant = (rating: FeedbackItem["rating"]) => {
    if (rating === "Excellent" || rating === "Good") return "default";
    if (rating === "Poor") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground">
            View and manage student feedback submissions.
          </p>
        </div>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search by name, email, rating or feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User Details</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead className="text-right">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredFeedback.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No feedback found.
                </TableCell>
              </TableRow>
            ) : (
              filteredFeedback.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {(item.name || "F").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{item.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.email}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getRatingVariant(item.rating)}>
                      {item.rating}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-[500px]">
                    <div
                      className="text-sm text-muted-foreground truncate"
                      title={item.feedback}
                    >
                      {item.feedback}
                    </div>
                  </TableCell>

                  <TableCell className="text-right text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>

        <div className="text-sm font-medium">
          Page {page} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default FeedbackManagement;
