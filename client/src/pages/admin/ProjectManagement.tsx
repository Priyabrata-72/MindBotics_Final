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
import { MoreHorizontal, Plus, Trash, ExternalLink, X, Upload } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

// Interface for Project
interface Project {
    _id: string;
    name: string;
    description: string;
    category?: string;
    images?: string[];
    specifications?: { key: string; value: string }[];
    uses?: string[];
    includes?: string[];
    status?: "Draft" | "Published";
    courses: { _id: string; title: string }[];
}

// Interface for Course Selection
interface Course {
    _id: string;
    title: string;
}

const ProjectManagement = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

    // New Project State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [status, setStatus] = useState<"Draft" | "Published">("Draft");
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    // Complex fields
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
    const [uses, setUses] = useState<string[]>([""]);
    const [includes, setIncludes] = useState<string[]>([""]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/projects");
            if (res.status === 200) {
                setProjects(res.data.projects || []);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get("/courses");
            if (res.status === 200) {
                setAllCourses(res.data.courses || []);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchCourses();
    }, []);

    const resetForm = () => {
        setName("");
        setDescription("");
        setCategory("General");
        setStatus("Draft");
        setSelectedCourses([]);
        setImages([]);
        setImagePreviews([]);
        setSpecifications([{ key: "", value: "" }]);
        setUses([""]);
        setIncludes([""]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Dynamic Specifications Handlers
    const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };
    const addSpec = () => setSpecifications([...specifications, { key: "", value: "" }]);
    const removeSpec = (index: number) => setSpecifications(specifications.filter((_, i) => i !== index));

    // Dynamic List Handlers (Uses/Includes)
    const handleListChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number, value: string) => {
        const newList = [...list];
        newList[index] = value;
        setter(newList);
    };
    const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => setter([...list, ""]);
    const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number) => setter(list.filter((_, i) => i !== index));


    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            try {
                await api.delete(`/admin/projects/${id}`);
                setProjects(projects.filter(p => p._id !== id));
                toast.success("Project deleted successfully");
            } catch (error) {
                console.error("Failed to delete project", error);
                toast.error("Failed to delete project");
            }
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("status", status);

            // Clean up empty fields
            const cleanSpecs = specifications.filter(s => s.key && s.value);
            const cleanUses = uses.filter(u => u);
            const cleanIncludes = includes.filter(i => i);

            formData.append("specifications", JSON.stringify(cleanSpecs));
            formData.append("uses", JSON.stringify(cleanUses));
            formData.append("includes", JSON.stringify(cleanIncludes));
            formData.append("selectedCourses", JSON.stringify(selectedCourses));

            images.forEach(image => {
                formData.append("images", image);
            });

            const res = await api.post("/admin/projects", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setProjects([...projects, res.data.project]);
            setIsAddProjectOpen(false);
            resetForm();
            toast.success("Project added successfully");
        } catch (error) {
            console.error("Failed to add project", error);
            toast.error("Failed to add project");
        }
    };

    const toggleCourseSelection = (courseId: string) => {
        setSelectedCourses(prev => {
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            } else {
                return [...prev, courseId];
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage projects, specifications, and assigned courses.</p>
                </div>
                <Dialog open={isAddProjectOpen} onOpenChange={(open) => {
                    setIsAddProjectOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Project</DialogTitle>
                            <DialogDescription>
                                Add a new project details, images, and assignments.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddProject} className="space-y-6">

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Project Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Robotics">Robotics</SelectItem>
                                            <SelectItem value="IoT">IoT</SelectItem>
                                            <SelectItem value="AI">AI</SelectItem>
                                            <SelectItem value="Programming">Programming</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="min-h-[100px]" />
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <Label>Project Images</Label>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center w-32 h-32 transition-colors">
                                        <Upload className="h-6 w-6 text-gray-500 mb-2" />
                                        <span className="text-xs text-gray-500 text-center">Upload Images</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="relative w-32 h-32 border rounded-lg overflow-hidden group">
                                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Specifications</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addSpec}>Add Spec</Button>
                                </div>
                                <div className="space-y-2">
                                    {specifications.map((spec, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input placeholder="Key (e.g. Voltage)" value={spec.key} onChange={(e) => handleSpecChange(index, "key", e.target.value)} />
                                            <Input placeholder="Value (e.g. 5V)" value={spec.value} onChange={(e) => handleSpecChange(index, "value", e.target.value)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)} disabled={specifications.length === 1}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Common Uses & What's Included */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Common Uses</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setUses, uses)}>Add Use</Button>
                                    </div>
                                    {uses.map((use, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input value={use} onChange={(e) => handleListChange(setUses, uses, index, e.target.value)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setUses, uses, index)} disabled={uses.length === 1}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>What's Included</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => addListItem(setIncludes, includes)}>Add Item</Button>
                                    </div>
                                    {includes.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input value={item} onChange={(e) => handleListChange(setIncludes, includes, index, e.target.value)} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(setIncludes, includes, index)} disabled={includes.length === 1}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status & Courses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={status} onValueChange={(val: "Draft" | "Published") => setStatus(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Published">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>


                            <div className="space-y-2">
                                <Label>Assign Courses</Label>
                                <div className="border rounded-md p-4 h-48 overflow-y-auto">
                                    <div className="space-y-2">
                                        {allCourses.map(course => (
                                            <div key={course._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`course-${course._id}`}
                                                    checked={selectedCourses.includes(course._id)}
                                                    onCheckedChange={() => toggleCourseSelection(course._id)}
                                                />
                                                <label
                                                    htmlFor={`course-${course._id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {course.title}
                                                </label>
                                            </div>
                                        ))}
                                        {allCourses.length === 0 && <p className="text-sm text-gray-500">No courses available.</p>}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Project</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Search projects by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Project Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned Courses</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProjects.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProjects.map((project) => (
                                <TableRow key={project._id}>
                                    <TableCell className="font-medium">
                                        {project.name}
                                    </TableCell>
                                    <TableCell>{project.category || "General"}</TableCell>
                                    <TableCell>
                                        <Badge variant={project.status === "Published" ? "default" : "secondary"}>
                                            {project.status || "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {project.courses && project.courses.map((c, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {c.title}
                                                </Badge>
                                            ))}
                                            {(!project.courses || project.courses.length === 0) && <span className="text-muted-foreground text-xs">None</span>}
                                        </div>
                                    </TableCell>
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
                                                <DropdownMenuItem onClick={() => handleDelete(project._id)} className="text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Remove Project
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
        </div>
    );
};

export default ProjectManagement;
