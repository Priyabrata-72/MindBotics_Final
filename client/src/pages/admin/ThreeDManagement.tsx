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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Trash, X, Upload } from "lucide-react";
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

interface Product {
    _id: string;
    name: string;
    description: string;
    category?: string;
    price?: number;
    stock?: number;
    status?: string;
    image?: {
        url: string;
    };
}

const ShopManagement = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/shop");
            setProducts(res.data.products || []);
        } catch (error) {
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const resetForm = () => {
        setName("");
        setDescription("");
        setCategory("General");
        setPrice(0);
        setStock(0);
        setImage(null);
        setPreview("");
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;

        try {
            await api.delete(`/shop/${id}`);
            setProducts(products.filter((p) => p._id !== id));
            toast.success("Product deleted");
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("price", price.toString());
            formData.append("stock", stock.toString());

            if (image) {
                formData.append("image", image);
            }

            const res = await api.post("/shop", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProducts([res.data, ...products]);
            setIsOpen(false);
            resetForm();
            toast.success("Product created");
        } catch (error) {
            toast.error("Creation failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">3D Products</h1>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Product</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                            </div>

                            <div>
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Kits">Kits</SelectItem>
                                        <SelectItem value="Boards">Boards</SelectItem>
                                        <SelectItem value="Components">Components</SelectItem>
                                        <SelectItem value="Robotics">Robotics</SelectItem>
                                        <SelectItem value="Tools">Tools</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Price</Label>
                                    <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                                </div>
                                <div>
                                    <Label>Stock</Label>
                                    <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
                                </div>
                            </div>

                            <div>
                                <Label>Image</Label>
                                <Input type="file" accept="image/*" onChange={handleImageChange} />
                                {preview && (
                                    <img src={preview} className="mt-2 w-24 h-24 object-cover rounded" />
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product._id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>₹{product.price}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    <Badge>{product.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-600"
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ShopManagement;