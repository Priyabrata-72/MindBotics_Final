import { useState, useEffect } from "react";
import { User, Mail, Shield, Camera, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";


const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        avatar: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Fetch user data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await api.get("/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const fetchedUser = res.data.user;

                setUser(fetchedUser);
                setFormData({
                    username: fetchedUser.username || "",
                    avatar: fetchedUser.avatar || "",
                });

                localStorage.setItem("user", JSON.stringify(fetchedUser));
            } catch (error) {
                console.error("Profile fetch error:", error);
            }
        };

        fetchProfile();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");

            const data = new FormData();
            data.append("username", formData.username);

            if (imageFile) {
                data.append("image", imageFile); // 🔥 Must match backend field
            }

            const res = await api.put("/user/profile/avatar", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            const updatedUser = {
                ...user,
                username: formData.username,
                avatar: res.data.avatar || user.avatar,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));

            setUser(updatedUser);
            setIsEditing(false);
            setImageFile(null);
            setPreviewUrl(null);

            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error: any) {
            console.error("Update error:", error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    if (!user) return null; // or a loading spinner

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">My Profile</CardTitle>
                            <CardDescription>Manage your account settings and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                        <AvatarImage src={previewUrl || user.avatar} alt={user.username} />
                                        <AvatarFallback className="text-2xl">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {isEditing && (
                                        <label htmlFor="image-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="text-white h-6 w-6" />
                                        </label>
                                    )}
                                    <input
                                        type="file"
                                        id="image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                                {!isEditing && (
                                    <div className="mt-4 text-center">
                                        <h2 className="text-xl font-bold">{user.username}</h2>
                                        <p className="text-gray-500">{user.email}</p>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                value={user.email}
                                                disabled
                                                className="pl-9 bg-gray-50"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="role"
                                                value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
                                                disabled
                                                className="pl-9 bg-gray-50"
                                            />
                                        </div>
                                    </div>


                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setFormData({
                                                        username: user.username || "",
                                                        avatar: user.avatar || "",                                                    });
                                                    setImageFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                                                {isLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <Check className="h-4 w-4 mr-2" />
                                                )}
                                                Save
                                            </Button>
                                        </>
                                    ) : (
                                        <Button type="button" onClick={() => setIsEditing(true)}>
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
