import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import "../styles/UsuarioPage.css";

const initialForm = {
  username: "",
  password: "",
  name: "",
  role: "",
  status: 1
};

export default function UsuarioPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch usuarios
  const fetchUsuarios = () => {
    fetch("https://backend-apiemail.up.railway.app/api/users")
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.users) ? data.users
          : [];
        setUsuarios(arr);
      })
      .catch(() => setUsuarios([]));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Guardar o editar usuario
  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje(""); setLoading(true);

    if (!form.username || (!editId && !form.password) || !form.name || !form.role) {
      setMensaje("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (editId) {
        res = await fetch(`https://backend-apiemail.up.railway.app/api/users/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      } else {
        res = await fetch("https://backend-apiemail.up.railway.app/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      }
      const json = await res.json();
      if (json.ok) {
        setMensaje(editId ? "Usuario editado correctamente." : "Usuario creado correctamente.");
        setForm(initialForm); setEditId(null); fetchUsuarios();
      } else {
        setMensaje(json.error || "Error en la operación.");
      }
    } catch {
      setMensaje("Error de red.");
    }
    setLoading(false);
  };

  // Eliminar usuario
  const handleEliminar = async id => {
    if (!window.confirm("¿Seguro que desea eliminar este usuario?")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        setMensaje("Usuario eliminado correctamente.");
        setUsuarios(usuarios.filter(u => u.id !== id));
      } else {
        setMensaje(json.error || "Error al eliminar.");
      }
    } catch {
      setMensaje("Error de red.");
    }
    setLoading(false);
  };

  // Editar usuario
  const handleEditar = usuario => {
    setEditId(usuario.id);
    setForm({
      username: usuario.username,
      password: "",
      name: usuario.name,
      role: usuario.role,
      status: usuario.status
    });
    setMensaje("");
  };

  // Cancelar edición
  const handleCancelar = () => {
    setEditId(null);
    setForm(initialForm);
    setMensaje("");
  };

  return (
    <div className="usuario-main-container">
      <h2 className="usuario-title">Gestión de Usuarios</h2>
      <form className="usuario-form" onSubmit={handleSubmit}>
        <label>
          Usuario:
          <input
            type="text"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
            disabled={loading || !!editId}
            placeholder="Nombre de usuario"
          />
        </label>
        <label>
          {editId ? "Nueva contraseña:" : "Contraseña:"}
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required={!editId}
            disabled={loading}
            placeholder={editId ? "Dejar vacío para no cambiar" : "Contraseña"}
          />
        </label>
        <label>
          Nombre:
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            disabled={loading}
            placeholder="Nombre completo"
          />
        </label>
        <label>
          Rol:
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            required
            disabled={loading}
          >
            <option value="">Seleccione...</option>
            <option value="admin">Administrador</option>
            <option value="secretaria">Secretaria</option>
            <option value="operador">Operador</option>
          </select>
        </label>
        <label>
          Estado:
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: Number(e.target.value) })}
            disabled={loading}
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </label>
        <div className="usuario-form-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {editId ? "Guardar Cambios" : "Crear Usuario"}
          </button>
          {editId && (
            <button type="button" className="btn-cancel" onClick={handleCancelar} disabled={loading}>
              Cancelar
            </button>
          )}
        </div>
      </form>
      {mensaje && <div className="usuario-mensaje">{mensaje}</div>}
      <div className="usuario-table-wrapper">
        <table className="usuario-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{u.status ? "Activo" : "Inactivo"}</td>
                <td>
                  <button onClick={() => handleEditar(u)} className="corte-btn-edit" title="Editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleEliminar(u.id)} className="corte-btn-delete" title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={6} className="usuario-table-empty">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}