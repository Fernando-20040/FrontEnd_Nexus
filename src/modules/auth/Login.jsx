import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";


const schema = z.object({
email: z.string().email("Correo inválido"),
password: z.string().min(6, "Mínimo 6 caracteres"),
});


export default function Login() {
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
const { login } = useAuth();
const navigate = useNavigate();


const onSubmit = async (values) => {
try {
await login(values.email, values.password);
navigate("/usuarios");
} catch (e) {
alert(e?.response?.data?.message || e.message || "Error al iniciar sesión");
}
};


return (
<div className="max-w-md mx-auto mt-16 bg-white p-6 rounded-2xl shadow">
<h1 className="text-xl font-semibold mb-4">Ingreso</h1>
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
<div>
<label className="block text-sm">Correo</label>
<input className="w-full border rounded p-2" type="email" {...register("email")} />
{errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
</div>
<div>
<label className="block text-sm">Contraseña</label>
<input className="w-full border rounded p-2" type="password" {...register("password")} />
{errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
</div>
<button disabled={isSubmitting} className="w-full bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700">
{isSubmitting ? "Ingresando..." : "Ingresar"}
</button>
</form>
</div>
);
}