import { useState, useEffect } from "react";
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
import api from "@/lib/api";

interface ContactUser {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "pending" | "completed" | "uncompleted";
}

const ContactUserManagement = () => {
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/contacts?page=${page}&limit=10`);
      const data = res.data;

      if (res.status === 200) {
        setContacts(data.contacts || []);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch contact users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page]);

  // ✅ Update Status Function
  const updateStatus = async (
    id: string,
    status: "pending" | "completed" | "uncompleted"
  ) => {
    try {
      await api.put(`/admin/contacts/${id}/status`, { status });

      // Update UI instantly
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === id ? { ...contact, status } : contact
        )
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Contact Users
          </h1>
          <p className="text-muted-foreground">
            View inquiries from the Contact form.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by name, email or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User Details</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredContacts.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No contact inquiries found.
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((item) => (
                <TableRow key={item._id}>
                  {/* User */}
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {(item.name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {item.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.email}
                      </div>
                    </div>
                  </TableCell>

                  {/* Subject */}
                  <TableCell>
                    <div className="font-medium">{item.subject}</div>
                  </TableCell>

                  {/* Message */}
                  <TableCell className="max-w-[400px]">
                    <div
                      className="text-sm text-muted-foreground truncate"
                      title={item.message}
                    >
                      {item.message}
                    </div>
                  </TableCell>

                  {/* ✅ Status Column */}
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "default"
                            : item.status === "uncompleted"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {item.status}
                      </Badge>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus(item._id, "pending")
                          }
                        >
                          Pending
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus(item._id, "completed")
                          }
                        >
                          Complete
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus(item._id, "uncompleted")
                          }
                        >
                          Uncomplete
                        </Button>
                      </div>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
          onClick={() =>
            setPage((p) => Math.min(totalPages, p + 1))
          }
          disabled={page === totalPages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ContactUserManagement;
