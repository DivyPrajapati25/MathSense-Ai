import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        const redirectPath = user?.role === "STUDENT" ? "/student" : "/";
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
