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
import { MoreHorizontal, Plus, Trash , X , Upload } from "lucide-react";
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
  reviews?: {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

const ShopManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const [isReviewsOpen, setIsReviewsOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  //   const [price, setPrice] = useState<number>(0);
  //   const [stock, setStock] = useState<number>(0);
  const [image, setImage] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

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


   const removeImage = (index: number) => {
        setImage(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("General");

    setImage([]);
    setImagePreview([]);
  };

  /* ================= IMAGE CHANGE ================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImage(prev => [...prev, ...files]);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview(prev => [...prev, ...newPreviews]);
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

      // ✅ SINGLE IMAGE (NO forEach)
      image.forEach(image => {
        formData.append("images", image);
      });

      const res = await api.post("/admin/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const newProduct = res.data?.product || res.data;

      setProducts((prev: any) => [newProduct, ...prev]);

      toast.success("Product created successfully");
      setIsOpen(false);
      resetForm();

    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Creation failed");
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

  /* ================= DELETE REVIEW ================= */
  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.delete(`/admin/${productId}/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      
      // Update local state to remove the review instantly
      setProducts((prevP) =>
        prevP.map((p) => {
          if (p._id === productId && p.reviews) {
            return {
              ...p,
              reviews: p.reviews.filter(r => r._id !== reviewId)
            };
          }
          return p;
        })
      );
      
      if (selectedProduct && selectedProduct._id === productId && selectedProduct.reviews) {
        setSelectedProduct({
          ...selectedProduct,
          reviews: selectedProduct.reviews.filter(r => r._id !== reviewId)
        });
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to delete review");
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
                    <SelectItem value="Models">
                      Models
                    </SelectItem>
                    <SelectItem value="Kits">
                      Kits
                    </SelectItem>
                    <SelectItem value="3D Printing">
                      3D Printing
                    </SelectItem>
                    <SelectItem value="Components">
                      Components
                    </SelectItem>
                    <SelectItem value="Robotics">
                      Robotics
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

              <div className="space-y-2">
                <Label>Project Images</Label>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center w-32 h-32 transition-colors">
                    <Upload className="h-6 w-6 text-gray-500 mb-2" />
                    <span className="text-xs text-gray-500 text-center">Upload Images</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative w-32 h-32 border rounded-lg overflow-hidden group">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
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
              <TableHead>Reviews</TableHead>
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
                <TableCell>
                  {product.reviews?.length || 0}
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
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsReviewsOpen(true);
                        }}
                      >
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        View Reviews
                      </DropdownMenuItem>
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

      {/* Reviews Modal */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reviews for {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!selectedProduct?.reviews || selectedProduct.reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet for this product.</p>
            ) : (
              selectedProduct.reviews.map((review) => (
                <div key={review._id} className="border rounded-md p-4 flex justify-between items-start gap-4">
                   <div className="flex-1">
                      <div className="flex justify-between mb-2">
                         <span className="font-semibold">{review.name}</span>
                         <span className="text-yellow-500 font-medium">{review.rating} ⭐</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">"{review.comment}"</p>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                   </div>
                   <Button 
                      variant="ghost" 
                      onClick={() => selectedProduct && handleDeleteReview(selectedProduct._id, review._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto flex-shrink-0"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopManagement;