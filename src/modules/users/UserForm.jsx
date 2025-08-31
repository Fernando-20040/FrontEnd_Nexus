// src/modules/users/UserForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsersApi } from "./api.js";

const baseSchema = z.object({
  nombre: z.string().min(2, "Requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().optional().or(z.literal("")),
  rolId: z.string().min(1, "Selecciona un rol"),
});

export default function UserForm({ initial = {}, onClose, onSaved }) {
  const isEdit = !!initial?.id;

  // Password mínimo 6 sólo al crear
  const schema = useMemo(
    () =>
      baseSchema.superRefine((val, ctx) => {
        if (!isEdit && (!val.password || val.password.length < 6)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["password"],
            message: "Mínimo 6 caracteres",
          });
        }
      }),
    [isEdit]
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await UsersApi.roles();
      // Normaliza a {id, nombre}
      const norm = (Array.isArray(data) ? data : []).map((r) => ({
        id: r.id,
        nombre: r.nombre ?? r.name,
      }));
      setRoles(norm);
    })();
  }, []);

  useEffect(() => {
    reset({
      nombre: initial.nombre || "",
      email: initial.email || "",
      password: "",
      rolId: initial?.roles?.[0]?.id ? String(initial.roles[0].id) : "",
    });
  }, [initial, reset]);

  const onSubmit = async (values) => {
    const payload = {
      nombre: values.nombre.trim(),
      email: values.email.trim(),
      roles: [{ id: Number(values.rolId) }], // un solo rol por id
    };
    if (!isEdit) payload.password = values.password;
    if (isEdit && values.password) payload.password = values.password;

    try {
      if (isEdit) await UsersApi.update(initial.id, payload);
      else await UsersApi.create(payload);
      onSaved?.();
    } catch (e) {
      const status = e?.response?.status;
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Error al guardar";

      // Correos duplicados (409) o mensaje con 'duplicate'
      if (status === 409 || /duplicate/i.test(message)) {
        setError("email", {
          type: "server",
          message: "El correo ya está registrado",
        });
        return;
      }

      // Errores de rol o validación
      if (status === 400 && /rol/i.test(message)) {
        setError("rolId", { type: "server", message });
        return;
      }

      alert(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Editar usuario" : "Nuevo usuario"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm">Nombre</label>
            <input className="w-full border rounded p-2" {...register("nombre")} />
            {errors.nombre && (
              <p className="text-red-600 text-sm">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm">Correo</label>
            <input type="email" className="w-full border rounded p-2" {...register("email")} />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm">Contraseña</label>
              <input type="password" className="w-full border rounded p-2" {...register("password")} />
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Rol</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm border rounded p-2">
                  <input type="radio" value={String(r.id)} {...register("rolId")} />
                  <span>{r.nombre}</span>
                </label>
              ))}
            </div>
            {errors.rolId && (
              <p className="text-red-600 text-sm">{errors.rolId.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-3 py-2 rounded bg-gray-200" onClick={onClose}>
              Cancelar
            </button>
            <button disabled={isSubmitting} className="px-3 py-2 rounded bg-indigo-600 text-white">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
