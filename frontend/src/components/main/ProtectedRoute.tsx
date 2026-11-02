import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/auth.context";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/authentication" replace />;
  }

  return <Outlet />;
}