// src/App.jsx
/* eslint react-refresh/only-export-components: "off" */
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./modules/auth/Login.jsx";
import UsersPage from "./modules/users/UsersPage.jsx";
import ProtectedRoute from "./modules/auth/ProtectedRoute.jsx";
import { useAuth } from "./modules/auth/AuthContext.jsx";
import Home from "./modules/home/Home.jsx"; // <- crea este componente (la página común)

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();

  // normaliza roles a ["ADMIN", "USER", ...]
  const roles = (user?.roles || []).map((r) => {
    if (typeof r === "string") return r.replace(/^ROLE_/, "");
    const v = r?.authority || r?.nombre || r?.name || "";
    return String(v).replace(/^ROLE_/, "");
  });
  const isAdmin = roles.includes("ADMIN");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-3 bg-white border-b">
        <Link to="/" className="font-semibold">NexuSempai</Link>

        <div className="flex gap-3 items-center">
          {/* Botón de gestión SOLO para ADMIN */}
          {isAuthenticated && isAdmin && (
            <Link
              to="/usuarios"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Gestionar
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={logout}
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white"
              to="/login"
            >
              Ingresar
            </Link>
          )}
        </div>
      </nav>

      {/* RUTAS */}
      <main className="p-6">
        <Routes>
          {/* Si ya está logueado y va a /login, lo mandamos a Home */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />

          {/* Home visible para cualquier usuario autenticado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* CRUD de usuarios SOLO ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>

          {/* fallback */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
