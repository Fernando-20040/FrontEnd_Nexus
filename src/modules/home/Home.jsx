// src/modules/home/Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();
  const roles = (user?.roles || []).map(r => r.startsWith("ROLE_") ? r.slice(5) : r);
  const isAdmin = roles.includes("ADMIN");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold">¡Bienvenido!</h1>
        <p className="text-gray-600 mt-1">{user?.email}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-2">Tu perfil</h2>
          <p className="text-gray-600">
            Rol: <span className="font-medium">{isAdmin ? "ADMIN" : "USER"}</span>
          </p>
          <p className="text-gray-600">Accede a las funciones básicas de la plataforma.</p>
        </div>

        {isAdmin && (
          <div className="bg-indigo-50 rounded-2xl shadow p-6 border border-indigo-100">
            <h2 className="font-semibold mb-2">Gestión administrativa</h2>
            <p className="text-gray-700 mb-4">
              Como administrador puedes crear, editar y eliminar usuarios.
            </p>
            <Link
              to="/usuarios"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Gestionar usuarios
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
