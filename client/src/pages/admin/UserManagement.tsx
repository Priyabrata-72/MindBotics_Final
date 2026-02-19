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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Shield, Trash, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

// ✅ Updated Interface According To Your DB
interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar?: string;          // 🔥 matches your database
    avatarPublicId?: string;  // optional (exists in DB)
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        role: "user",
        password: "",
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/users?page=${page}&limit=10`);
            const data = res.data;

            if (res.status === 200) {
                setUsers(data.users);
                setTotalPages(data.pages);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const filteredUsers = users.filter(
        (user) =>
            (user.username || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (user.email || "")
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter((u) => u._id !== id));
                toast.success("User deleted successfully");
            } catch (error) {
                console.error("Failed to delete user", error);
                toast.error("Failed to delete user");
            }
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            await api.put(`/admin/users/${id}`, { role: newRole });
            setUsers(
                users.map((u) =>
                    u._id === id ? { ...u, role: newRole } : u
                )
            );
            toast.success("User role updated");
        } catch (error) {
            console.error("Failed to update user role", error);
            toast.error("Failed to update user role");
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/admin/users", newUser);
            setUsers([...users, res.data.user]);
            setIsAddUserOpen(false);
            setNewUser({
                username: "",
                email: "",
                role: "user",
                password: "",
            });
            toast.success("User added successfully");
        } catch (error) {
            console.error("Failed to add user", error);
            toast.error("Failed to add user");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        User Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage users, roles, and permissions.
                    </p>
                </div>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>
                                Create a new user account.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={newUser.username}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            username: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Temporary Password</Label>
                                <Input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            password: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) =>
                                        setNewUser({
                                            ...newUser,
                                            role: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">
                                            User
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter>
                                <Button type="submit">
                                    Create User
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">
                                User
                            </TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell className="flex items-center gap-3">
                                    
                                    {/* 🔥 NOW USING avatar FIELD */}
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={user.avatar || ""}
                                            alt={user.username}
                                        />
                                        <AvatarFallback>
                                            {(user.username || "U")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <div className="font-medium">
                                            {user.username || "Unknown User"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.email}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant={
                                            user.role === "admin"
                                                ? "destructive"
                                                : "secondary"
                                        }
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>
                                                Actions
                                            </DropdownMenuLabel>

                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleRoleChange(
                                                        user._id,
                                                        user.role === "user"
                                                            ? "admin"
                                                            : "user"
                                                    )
                                                }
                                            >
                                                <Shield className="mr-2 h-4 w-4" />
                                                {user.role === "user"
                                                    ? "Make Admin"
                                                    : "Make User"}
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDelete(user._id)
                                                }
                                                className="text-red-600"
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
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

export default UserManagement;
