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
import { MoreHorizontal, Plus, Trash } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  category?: string;
//   price?: number;
  stock?: number;
  status?: string;
  image?: {
    url: string;
  };
}

const ShopManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
//   const [price, setPrice] = useState<number>(0);
//   const [stock, setStock] = useState<number>(0);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/all");

      // backend returns: { products, page, pages, total }
      const productData = res.data?.products || [];

      setProducts(productData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("General");
    // setPrice(0);
    // setStock(0);
    setImage(null);
    setPreview("");
  };

  /* ================= IMAGE CHANGE ================= */
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  /* ================= CREATE PRODUCT ================= */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
    //   formData.append("price", price.toString());
    //   formData.append("stock", stock.toString());

      if (image) {
        formData.append("image", image);
      }

      const res = await api.post("/admin/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // backend may return { product } OR product directly
      const newProduct =
        res.data?.product || res.data;

      setProducts((prev) => [newProduct, ...prev]);

      toast.success("Product created successfully");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Creation failed");
    }
  };

  /* ================= DELETE PRODUCT ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      await api.delete(`/admin/${id}`);

      setProducts((prev) =>
        prev.filter((p) => p._id !== id)
      );

      toast.success("Product deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

            <form
              onSubmit={handleCreate}
              className="space-y-4"
            >
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kits">
                      Kits
                    </SelectItem>
                    <SelectItem value="Boards">
                      Boards
                    </SelectItem>
                    <SelectItem value="Components">
                      Components
                    </SelectItem>
                    <SelectItem value="Robotics">
                      Robotics
                    </SelectItem>
                    <SelectItem value="Tools">
                      Tools
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) =>
                      setPrice(Number(e.target.value))
                    }
                  />
                </div> */}
                {/* <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={stock}
                    onChange={(e) =>
                      setStock(Number(e.target.value))
                    }
                  />
                </div> */}
              </div>

              <div>
                <Label>Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {preview && (
                  <img
                    src={preview}
                    className="mt-2 w-24 h-24 object-cover rounded"
                  />
                )}
              </div>

              <DialogFooter>
                <Button type="submit">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              {/* <TableHead>Price</TableHead> */}
              {/* <TableHead>Stock</TableHead> */}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6"
                >
                  No products found
                </TableCell>
              </TableRow>
            )}

            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  {product.name}
                </TableCell>
                <TableCell>
                  {product.category || "General"}
                </TableCell>
                {/* <TableCell>
                  ₹{product.price ?? 0}
                </TableCell> */}
                {/* <TableCell>
                  {product.stock ?? 0}
                </TableCell> */}
                <TableCell>
                  <Badge>
                    {product.status || "active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
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
                          handleDelete(product._id)
                        }
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