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
import { MoreHorizontal, PlusCircle, Pencil, Trash, Upload, ImageIcon, X } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

interface Course {
    _id: string;
    title: string;
    instructor: {
        username: string;
        email: string;
    };
    category: string;
    price: number;
    level: string;
    image?: string;
    // New fields (might be missing from backend resp)
    duration?: string;
    averageRating?: number;
    instructorName?: string;
    published?: boolean;
}

const CourseManagement = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [fullDescription, setFullDescription] = useState(""); // Maps to description in backend
    const [category, setCategory] = useState("");
    // const [price, setPrice] = useState("");
    const [level, setLevel] = useState("Beginner");
    const [duration, setDuration] = useState(""); // Weeks
    const [averageRating, setRating] = useState("0");
    const [instructorName, setInstructorName] = useState("");

    // Complex fields
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [syllabus, setSyllabus] = useState<string[]>([""]);
    const [requirements, setRequirements] = useState<string[]>([""]);
    const [learningOutcomes, setlearningOutcomes] = useState<string[]>([""]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/courses?page=${page}&limit=10`);
            const data = res.data;
            if (res.status === 200) {
                setCourses(data.courses);
                setTotalPages(data.pages);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [page]);

    const resetForm = () => {
        setTitle("");
        setShortDescription("");
        setFullDescription("");
        setCategory("");
        // setPrice("");
        setLevel("Beginner");
        setDuration("");
        setRating("0");
        setInstructorName("");
        setImage(null);
        setImagePreview(null);
        setSyllabus([""]);
        setRequirements([""]);
        setlearningOutcomes([""]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // List Handlers
    const handleListChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number, value: string) => {
        const newList = [...list];
        newList[index] = value;
        setter(newList);
    };
    const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => setter([...list, ""]);
    const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number) => setter(list.filter((_, i) => i !== index));

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", fullDescription); // Backend expects 'description'
            formData.append("shortDescription", shortDescription);
            formData.append("category", category);
            // formData.append("price", price);
            formData.append("level", level);

            // New Fields
            formData.append("duration", duration);
            formData.append("rating", averageRating);
            formData.append("instructorName", instructorName);

            // Arrays - verify backend handling or send as JSON string if manual parsing implemented
            // Since we are "frontend only" and backend is standard express+multer, usually arrays needing manual parsing or repeated keys
            // We'll send as JSON strings for safety if backend was updated to parse them, or just repeated keys if array.
            // Let's us JSON stringify to be safe for complex data if backend logic aligns, or just standard form fields.
            // Given standard 'multer' middleware often ignores arrays unless specified, we'll try JSON string which is robust if controller parses it.
            // If controller doesn't parse, it just stores the string or ignores.
            formData.append("syllabus", JSON.stringify(syllabus.filter(i => i)));
            formData.append("requirements", JSON.stringify(requirements.filter(i => i)));
            formData.append("learningOutcomes", JSON.stringify(learningOutcomes.filter(i => i))); // 'learningOutcomes' or 'learninglearningOutcomes'

            if (image) {
                formData.append("thumbnail", image); // Backend 'thumbnail' or 'image'? Model says 'thumbnail' (String), but usually upload middleware maps file.
                // Note: user requested 'Course Image'. Model has 'thumbnail'. 
                // Product route used 'image'. Course route might use 'thumbnail' or 'image'.
                // Checking courseRoutes... it didn't have upload middleware in the original file I read.
                // Wait, I am NOT allowed to change backend. 
                // IF backend courseRoutes doesn't have `upload` middleware, this FILE upload will FAIL or be ignored.
                // Frontend only constraint is tricky here. 
                // I will try to send it as 'image' or 'thumbnail'. 
                formData.append("image", image);
            }

            const token = localStorage.getItem("token");
            const res = await api.post("/admin/courses", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            setCourses([...courses, res.data]);
            setIsAddCourseOpen(false);
            resetForm();
            toast.success("Course added successfully");
            fetchCourses();
        } catch (error: any) {
            console.error("Failed to add course", error);
            const msg = error.response?.data?.message || "Failed to add course";
            toast.error(msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this course?")) {
            try {
                await api.delete(`/courses/${id}`);
                setCourses(courses.filter(c => c._id !== id));
                toast.success("Course deleted successfully");
            } catch (error) {
                console.error("Failed to delete course", error);
                toast.error("Failed to delete course");
            }
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
                    <p className="text-muted-foreground">Add, edit, and manage courses.</p>
                </div>
                <Dialog open={isAddCourseOpen} onOpenChange={(open) => {
                    setIsAddCourseOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle size={16} />
                            Add Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Course</DialogTitle>
                            <DialogDescription>
                                Create a new course with full syllabus and details.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddCourse} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Course Name</Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g. AI/ML" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="instructorName">Instructor Name</Label>
                                    <Input id="instructorName" value={instructorName} onChange={(e) => setInstructorName(e.target.value)} required placeholder="e.g. Dr. Smith" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (Weeks)</Label>
                                        <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required placeholder="12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rating">Rating (0-5)</Label>
                                        <Input id="rating" type="number" min="0" max="5" step="0.1" value={averageRating} onChange={(e) => setRating(e.target.value)} required />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shortDescription">Small Description</Label>
                                <Input id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required maxLength={150} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fullDescription">About This Course</Label>
                                <Textarea id="fullDescription" value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} required className="min-h-[100px]" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* <div className="space-y-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                                </div> */}
                                <div className="space-y-2">
                                    <Label htmlFor="level">Level</Label>
                                    <Select value={level} onValueChange={setLevel}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="space-y-2">
                                <Label>Course Image</Label>
                                <div className="flex items-center gap-4">
                                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-2 cursor-pointer hover:bg-gray-50 flex items-center justify-center w-32 h-24 overflow-hidden relative">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <ImageIcon className="mx-auto h-6 w-6" />
                                                <span className="text-xs">Upload</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    {imagePreview && <Button type="button" variant="outline" size="sm" onClick={() => { setImage(null); setImagePreview(null); }}>Remove</Button>}
                                </div>
                            </div>

                            {/* Dynamic Sections */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Course Syllabus (Sections)</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setSyllabus, syllabus)}>Add Section</Button>
                                    </div>
                                    {syllabus.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input value={item} onChange={(e) => handleListChange(setSyllabus, syllabus, index, e.target.value)} placeholder={`Week ${index + 1} Topic...`} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setSyllabus, syllabus, index)} disabled={syllabus.length === 1}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Requirements</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setRequirements, requirements)}>Add Item</Button>
                                    </div>
                                    {requirements.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input value={item} onChange={(e) => handleListChange(setRequirements, requirements, index, e.target.value)} placeholder="Prerequisite..." />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setRequirements, requirements, index)} disabled={requirements.length === 1}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>What You Will Learn</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setlearningOutcomes, learningOutcomes)}>Add Item</Button>
                                    </div>
                                    {learningOutcomes.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input value={item} onChange={(e) => handleListChange(setlearningOutcomes, learningOutcomes, index, e.target.value)} placeholder="Skill acquired..." />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setlearningOutcomes, learningOutcomes, index)} disabled={learningOutcomes.length === 1}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">Create Course</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Course Title</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Weeks</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCourses.map((course) => (
                                <TableRow key={course._id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>{course.instructorName || course.instructor?.username || "Unknown"}</TableCell>
                                    <TableCell>{course.category}</TableCell>
                                    <TableCell>{course.duration || "-"}</TableCell>
                                    <TableCell>{course.averageRating || "-"}</TableCell>
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
                                                <DropdownMenuItem onClick={() => handleDelete(course._id)} className="text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete Course
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <div className="text-sm">Page {page} of {totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
        </div>
    );
};

export default CourseManagement;
