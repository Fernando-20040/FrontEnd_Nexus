// src/modules/users/api.js
import api from "../../shared/api.js";

export const UsersApi = {
  list: (q = "") => api.get(`/usuarios${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  create: (payload) => api.post("/usuarios", payload),
  update: (id, payload) => api.put(`/usuarios/${id}`, payload),
  remove: (id) => api.delete(`/usuarios/${id}`),
  roles: () => api.get("/roles"),
};
