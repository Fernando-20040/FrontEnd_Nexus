// src/modules/users/UsersPage.jsx
import { useEffect, useMemo, useState } from "react";
import { UsersApi } from "./api.js";
import UserForm from "./UserForm.jsx";

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await UsersApi.list(search);
      setItems(Array.isArray(data) ? data : data?.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items, [items]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Usuarios</h2>
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={() => setEditing({})}>
          Nuevo
        </button>
      </div>

      <div className="mb-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load()}
          className="border rounded p-2 w-full"
          placeholder="Buscar por nombre/correo"
        />
      </div>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Correo</th>
              <th className="text-left p-3">Roles</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan="5">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-3" colSpan="5">Sin registros</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.nombre || u.name}</td>
                <td className="p-3">{u.email || u.correo}</td>
                <td className="p-3">{(u.roles || []).map(r => r.name || r.nombre).join(", ")}</td>
                <td className="p-3 space-x-2">
                  <button
                    className="px-2 py-1 rounded bg-blue-600 text-white"
                    onClick={() => setEditing(u)}
                  >
                    Editar
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-red-600 text-white"
                    onClick={async () => {
                      if (confirm("¿Eliminar usuario?")) { await UsersApi.remove(u.id); await load(); }
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <UserForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}
