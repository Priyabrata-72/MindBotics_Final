import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check for role
    if (user?.role !== "admin") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You do not have administrative permissions to view this page.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
