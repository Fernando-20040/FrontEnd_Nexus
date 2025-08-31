// ProtectedRoute.jsx (ajuste pequeño)
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length === 0) return <Outlet />;

  const roles = (user?.roles || []).map(a => a.startsWith("ROLE_") ? a.slice(5) : a);
  const hasRole = roles.some(r => allowedRoles.includes(r));
  return hasRole ? <Outlet /> : <div className="text-red-600">No tienes permisos.</div>;
}
