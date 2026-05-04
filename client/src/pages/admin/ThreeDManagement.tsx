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
import {
  MoreHorizontal,
  Plus,
  Trash,
  X,
  Upload,
  Pencil,
  MessageSquare,
} from "lucide-react";
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

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductImage {
  url: string;
  public_id?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category?: string;
  price?: number;
  status?: "active" | "inactive";
  images?: ProductImage[];
  projectGallery?: ProductImage[];
  specifications?: { key: string; value: string }[];
  keyFeature?: string[];
  uses?: string[];
  includes?: string[];
  reviews?: Review[];
}

const ThreeDManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Basic form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [price, setPrice] = useState<string>("0");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // Image state
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);

  // Complex field state
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [keyFeature, setKeyFeature] = useState<string[]>([""]);
  const [uses, setUses] = useState<string[]>([""]);
  const [includes, setIncludes] = useState<string[]>([""]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/all");
      if (res.status === 200) {
        setProducts(res.data?.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
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
    setPrice("0");
    setStatus("active");
    setImages([]);
    setImagePreviews([]);
    setGalleryImages([]);
    setGalleryImagePreviews([]);
    setSpecifications([{ key: "", value: "" }]);
    setKeyFeature([""]);
    setUses([""]);
    setIncludes([""]);
    setEditingProduct(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (isGallery) {
        setGalleryImages((prev) => [...prev, ...files]);
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setGalleryImagePreviews((prev) => [...prev, ...newPreviews]);
      } else {
        setImages((prev) => [...prev, ...files]);
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
      }
    }
  };

  const removeImage = (index: number, isGallery = false) => {
    if (isGallery) {
      setGalleryImages((prev) => prev.filter((_, i) => i !== index));
      setGalleryImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Specifications handlers
  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };
  const addSpec = () => setSpecifications([...specifications, { key: "", value: "" }]);
  const removeSpec = (index: number) => setSpecifications(specifications.filter((_, i) => i !== index));

  // Dynamic list handlers
  const handleListChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    list: string[],
    index: number,
    value: string
  ) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };
  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) =>
    setter([...list, ""]);
  const removeListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    list: string[],
    index: number
  ) => setter(list.filter((_, i) => i !== index));

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("status", status);

      const cleanSpecs = specifications.filter((s) => s.key && s.value);
      const cleanUses = uses.filter((u) => u);
      const cleanIncludes = includes.filter((i) => i);
      const cleanFeatures = keyFeature.filter((f) => f);

      formData.append("specifications", JSON.stringify(cleanSpecs));
      formData.append("uses", JSON.stringify(cleanUses));
      formData.append("includes", JSON.stringify(cleanIncludes));
      formData.append("keyFeature", JSON.stringify(cleanFeatures));

      images.forEach((img) => formData.append("images", img));
      galleryImages.forEach((img) => formData.append("projectGallery", img));

      const res = await api.post("/admin/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newProduct = res.data?.product || res.data;
      setProducts((prev) => [...prev, newProduct]);
      setIsAddProductOpen(false);
      resetForm();
      toast.success("Product created successfully");
    } catch (error: any) {
      console.error("Failed to create product", error);
      toast.error(error?.response?.data?.message || "Failed to create product");
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setCategory(product.category || "General");
    setPrice(String(product.price ?? 0));
    setStatus((product.status as "active" | "inactive") || "active");
    setSpecifications(product.specifications?.length ? product.specifications : [{ key: "", value: "" }]);
    setKeyFeature(product.keyFeature?.length ? product.keyFeature : [""]);
    setUses(product.uses?.length ? product.uses : [""]);
    setIncludes(product.includes?.length ? product.includes : [""]);
    setImages([]);
    setImagePreviews(product.images?.map((img) => img.url) || []);
    setGalleryImages([]);
    setGalleryImagePreviews(product.projectGallery?.map((img) => img.url) || []);
    setIsEditProductOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("status", status);

      const cleanSpecs = specifications.filter((s) => s.key && s.value);
      const cleanUses = uses.filter((u) => u);
      const cleanIncludes = includes.filter((i) => i);
      const cleanFeatures = keyFeature.filter((f) => f);

      formData.append("specifications", JSON.stringify(cleanSpecs));
      formData.append("uses", JSON.stringify(cleanUses));
      formData.append("includes", JSON.stringify(cleanIncludes));
      formData.append("keyFeature", JSON.stringify(cleanFeatures));

      images.forEach((img) => formData.append("images", img));
      galleryImages.forEach((img) => formData.append("projectGallery", img));

      const res = await api.put(`/admin/${editingProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProduct = res.data?.product || res.data;
      setProducts((prev) =>
        prev.map((product) =>
          product._id === editingProduct._id ? { ...product, ...updatedProduct } : product
        )
      );
      setIsEditProductOpen(false);
      resetForm();
      toast.success("Product updated successfully");
    } catch (error: any) {
      console.error("Failed to update product", error);
      toast.error(error?.response?.data?.message || "Failed to update product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/${id}`);
      setProducts((prev) => prev.filter((product) => product._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error("Failed to delete product");
    }
  };

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/admin/${productId}/reviews/${reviewId}`);
      toast.success("Review deleted successfully");

      setProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, reviews: product.reviews?.filter((review) => review._id !== reviewId) || [] }
            : product
        )
      );
      setSelectedProduct((prev) =>
        prev && prev._id === productId
          ? { ...prev, reviews: prev.reviews?.filter((review) => review._id !== reviewId) || [] }
          : prev
      );
    } catch (error) {
      console.error("Failed to delete review", error);
      toast.error("Failed to delete review");
    }
  };

  // Reusable image upload section
  const ImageUploadSection = ({
    label,
    previews,
    isGallery = false,
  }: {
    label: string;
    previews: string[];
    isGallery?: boolean;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-4 items-center">
        <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center w-32 h-32 transition-colors">
          <Upload className="h-6 w-6 text-gray-500 mb-2" />
          <span className="text-xs text-gray-500 text-center">
            {isGallery ? "Upload Gallery" : "Upload Images"}
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageChange(e, isGallery)}
            className="hidden"
          />
        </label>
        {previews.map((src, index) => (
          <div key={index} className="relative w-32 h-32 border rounded-lg overflow-hidden group">
            <img src={src} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index, isGallery)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Reusable form body shared between Add and Edit
  const ProductFormBody = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-price">Price</Label>
          <Input
            id="product-price"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Models">Models</SelectItem>
              <SelectItem value="Kits">Kits</SelectItem>
              <SelectItem value="3D Printing">3D Printing</SelectItem>
              <SelectItem value="Components">Components</SelectItem>
              <SelectItem value="Robotics">Robotics</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="product-description">Description</Label>
        <Textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="min-h-[100px]"
        />
      </div>

      {/* Images */}
      {ImageUploadSection({ label: "Product Images", previews: imagePreviews, isGallery: false })}

      {/* Gallery */}
      {ImageUploadSection({ label: "Product Gallery", previews: galleryImagePreviews, isGallery: true })}

      {/* Specifications */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Specifications</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSpec}>
            Add Spec
          </Button>
        </div>
        <div className="space-y-2">
          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Key (e.g. Material)"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, "key", e.target.value)}
              />
              <Input
                placeholder="Value (e.g. PLA)"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, "value", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(index)}
                disabled={specifications.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features / Uses / Includes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Key Features */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Key Features</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setKeyFeature, keyFeature)}>
              Add Feature
            </Button>
          </div>
          {keyFeature.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feature}
                onChange={(e) => handleListChange(setKeyFeature, keyFeature, index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeListItem(setKeyFeature, keyFeature, index)}
                disabled={keyFeature.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Common Uses */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Common Uses</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setUses, uses)}>
              Add Use
            </Button>
          </div>
          {uses.map((use, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={use}
                onChange={(e) => handleListChange(setUses, uses, index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeListItem(setUses, uses, index)}
                disabled={uses.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* What's Included */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>What's Included</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setIncludes, includes)}>
              Add Item
            </Button>
          </div>
          {includes.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleListChange(setIncludes, includes, index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeListItem(setIncludes, includes, index)}
                disabled={includes.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(val: "active" | "inactive") => setStatus(val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">3D Products</h1>
          <p className="text-muted-foreground">
            Manage 3D products, images, pricing, and customer reviews.
          </p>
        </div>

        {/* ---- ADD PRODUCT DIALOG ---- */}
        <Dialog
          open={isAddProductOpen}
          onOpenChange={(open) => {
            setIsAddProductOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new 3D product with images, gallery, pricing, and category details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6">
              {ProductFormBody()}
              <DialogFooter>
                <Button type="submit">Create Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ---- EDIT PRODUCT DIALOG ---- */}
        <Dialog
          open={isEditProductOpen}
          onOpenChange={(open) => {
            setIsEditProductOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product details, gallery, pricing, status, and images.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-6">
              {ProductFormBody()}
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search products by name..."
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
              <TableHead className="w-[220px]">Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredProducts.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category || "General"}</TableCell>
                  <TableCell>₹{product.price || 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === "active" ? "default" : "secondary"}
                    >
                      {product.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.reviews?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem onClick={() => openEditProduct(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsReviewsOpen(true);
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          View Reviews
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Remove Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ---- REVIEWS DIALOG ---- */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reviews for {selectedProduct?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {!selectedProduct?.reviews || selectedProduct.reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet.</p>
            ) : (
              selectedProduct.reviews.map((review) => (
                <div
                  key={review._id}
                  className="border rounded-md p-4 flex justify-between items-start gap-4"
                >
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
                    onClick={() =>
                      selectedProduct && handleDeleteReview(selectedProduct._id, review._id)
                    }
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

export default ThreeDManagement;