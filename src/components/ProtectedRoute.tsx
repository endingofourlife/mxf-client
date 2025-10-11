import {Navigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.tsx";
import type {ReactNode} from "react";

export function ProtectedRoute({element}: {element: ReactNode}) {
    const {isAuthenticated} = useAuth();
    return isAuthenticated ? element : <Navigate to="/auth" />;
}

export function AdminRoute({element}: {element: ReactNode}) {
    const {user, isAuthenticated} = useAuth();
    if (!isAuthenticated) return <Navigate to="/auth" />;
    if (!user?.is_superuser) return <Navigate to="/" />;
    return element;
}
