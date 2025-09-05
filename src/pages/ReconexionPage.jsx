import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import "../styles/ReconexionPage.css";

function getTodayISO() {
  const now = new Date();
  const utcMinus5 = new Date(now.getTime() - (now.getTimezoneOffset() + 300) * 60000);
  return utcMinus5.toISOString().slice(0, 10);
}
function toDisplayFormat(fecha) {
  if (!fecha) return '';
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

const API_URL = "https://backend-apiemail.up.railway.app/api/reconexiones";

const initialForm = {
  id_cuenta: "",
  id_medidor: "",
  fecha: getTodayISO(),
};

const ReconexionPage = () => {
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState("");
  const [reconexiones, setReconexiones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [pendienteConfirmacion, setPendienteConfirmacion] = useState(false);

  // Fetch reconexiones
  const fetchReconexiones = async () => {
    setLoading(true);
    let url = API_URL;
    if (fechaFiltro) url += `?fecha=${fechaFiltro}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setReconexiones(Array.isArray(data) ? data : []);
    } catch {
      setReconexiones([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReconexiones(); }, []);
  useEffect(() => { if (fechaFiltro) fetchReconexiones(); }, [fechaFiltro]);

  // Buscar por cuenta o medidor
  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) { setReconexiones([]); return; }
    setLoading(true);
    try {
      await fetchReconexiones();
    } finally {
      setLoading(false);
    }
  };

  // Filtrado visual local por cuenta o medidor
  const reconexionesFiltradas = reconexiones.filter(i =>
    busqueda.trim() === ""
      ? true
      : String(i.id_cuenta).toLowerCase().includes(busqueda.toLowerCase()) ||
        String(i.id_medidor).toLowerCase().includes(busqueda.toLowerCase())
  );

  // Guardar nueva reconexión, sin imagen ni localización, y confirmación si ya existe en el mes
  const handleGuardar = async (e, forzar = false) => {
    e.preventDefault();
    setMensaje("");
    if (!form.id_cuenta || !form.id_medidor || !form.fecha) {
      setMensaje("Todos los campos son obligatorios."); return;
    }
    setLoading(true);
    try {
      const data = {
        id_cuenta: form.id_cuenta,
        id_medidor: form.id_medidor,
        fecha: (form.fecha || "").slice(0, 10),
      };
      if (forzar) data.forzar = "1";

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.ok) {
        setMensaje("Reconexión registrada correctamente.");
        setForm({ ...initialForm, fecha: getTodayISO() });
        setPendienteConfirmacion(false);
        fetchReconexiones();
      } else if (json.confirm) {
        setMensaje(json.message || "Ya existe una reconexión ese mes. ¿Desea registrar otra?");
        setPendienteConfirmacion(true);
      } else {
        setMensaje(json.error || "Error al registrar la reconexión.");
        setPendienteConfirmacion(false);
      }
    } catch {
      setMensaje("Error al registrar la reconexión.");
      setPendienteConfirmacion(false);
    }
    setLoading(false);
  };

  // Eliminar reconexión (requiere id_reconexion)
  const handleEliminar = async (id_reconexion) => {
    if (!window.confirm("¿Seguro que desea eliminar la reconexión?")) return;
    setLoading(true); setMensaje("");
    try {
      const res = await fetch(`${API_URL}/${id_reconexion}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        setMensaje("Reconexión eliminada correctamente.");
        fetchReconexiones();
      } else setMensaje(json.error || "Error al eliminar reconexión.");
    } catch { setMensaje("Error de red"); }
    setLoading(false);
  };

  // Abrir modal edición
  const abrirModalEdicion = item => {
    setEditando(item);
    setEditForm({
      id_cuenta: item.id_cuenta,
      id_medidor: item.id_medidor,
      fecha: item.fecha ? item.fecha.slice(0, 10) : "",
      id_reconexion: item.id_reconexion,
    });
  };
  const cerrarModal = () => {
    setEditando(null); setEditForm(initialForm);
  };

  // Editar
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMensaje(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${editando.id_reconexion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_medidor: editForm.id_medidor,
          fecha: editForm.fecha
        })
      });
      const json = await res.json();
      if (json.ok) {
        setMensaje("Reconexión editada correctamente."); fetchReconexiones(); cerrarModal();
      } else setMensaje(json.error || "Error al actualizar reconexión");
    } catch { setMensaje("Error de red"); }
    setLoading(false);
  };

  return (
    <div className="reconexion-main-container">
      <div className="reconexion-card">
        <h1 className="reconexion-title">Registro de Reconexiones</h1>
        <form className="reconexion-form" onSubmit={e => handleGuardar(e, false)}>
          <div className="reconexion-form-box">
            <div className="reconexion-form-row">
              <label>
                Cuenta:
                <input
                  type="text"
                  value={form.id_cuenta}
                  onChange={e => setForm({ ...form, id_cuenta: e.target.value })}
                  required disabled={loading} autoComplete="off"
                  placeholder="Ej: 1234"
                  className="reconexion-input-cuenta"
                />
              </label>
              <label>
                Medidor:
                <input
                  type="text"
                  value={form.id_medidor}
                  onChange={e => setForm({ ...form, id_medidor: e.target.value })}
                  required disabled={loading} autoComplete="off"
                  placeholder="Ej: MD98765"
                  className="reconexion-input-medidor"
                />
              </label>
              <label>
                Fecha:
                <input
                  type="date"
                  value={form.fecha}
                  onChange={e => setForm({ ...form, fecha: e.target.value })}
                  required disabled={loading}
                  className="reconexion-input-fecha"
                />
              </label>
              <button type="submit" className="reconexion-btn" disabled={loading || pendienteConfirmacion}>
                <FaSave /> Guardar
              </button>
            </div>
          </div>
        </form>
        {mensaje && <div className="reconexion-mensaje">{mensaje}</div>}
        {pendienteConfirmacion && (
          <div style={{ margin: "16px 0" }}>
            <button
              className="reconexion-btn"
              style={{ background: "#f6ac3e", marginRight: "10px" }}
              disabled={loading}
              onClick={e => handleGuardar(e, true)}
            >
              Sí, registrar otra reconexión este mes
            </button>
            <button
              className="reconexion-btn"
              style={{ background: "#ccc" }}
              disabled={loading}
              onClick={() => { setPendienteConfirmacion(false); setMensaje(""); }}
            >
              No, cancelar
            </button>
          </div>
        )}
        <div className="reconexion-form-box">
          <div className="reconexion-filter-row">
            <form style={{ display: 'flex', alignItems: 'center' }} onSubmit={handleBuscar} className="reconexion-filter">
              <label style={{ marginRight: '1.5rem' }}>
                <span>Buscar por cuenta o medidor:</span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Número de cuenta o medidor"
                  className="reconexion-search-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </label>
              <button type="submit" className="reconexion-btn" disabled={loading}>
                Buscar
              </button>
            </form>
            <div className="reconexion-filter">
              <label>
                <span>Buscar por fecha:</span>
                <input
                  type="date"
                  value={fechaFiltro}
                  onChange={e => setFechaFiltro(e.target.value)}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>
        <h2 className="reconexion-subtitle">
          {`Reconexiones registradas | Total: ${reconexionesFiltradas.length}`}
        </h2>
        <div className="reconexion-table-wrapper">
          <table className="reconexion-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cuenta</th>
                <th>Medidor</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reconexionesFiltradas.map((item, idx) => (
                <tr key={item.id_reconexion}>
                  <td>{idx + 1}</td>
                  <td>{item.id_cuenta}</td>
                  <td>{item.id_medidor}</td>
                  <td>{item.fecha ? toDisplayFormat(item.fecha.slice(0, 10)) : ""}</td>
                  <td>
                    <button onClick={() => abrirModalEdicion(item)} className="reconexion-btn-edit" title="Editar">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleEliminar(item.id_reconexion)} className="reconexion-btn-delete" title="Eliminar">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {reconexionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="reconexion-table-empty">
                    No hay reconexiones encontradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* MODAL EDICION */}
        {editando && (
          <div className="reconexion-modal-backdrop">
            <div className="reconexion-modal">
              <h3>Editar Reconexión</h3>
              <form onSubmit={handleEditSubmit} className="reconexion-modal-form">
                <label>
                  Cuenta:
                  <input
                    type="text"
                    value={editForm.id_cuenta || ""}
                    disabled
                    required
                    className="modal-cuenta"
                  />
                </label>
                <label>
                  Medidor:
                  <input
                    type="text"
                    value={editForm.id_medidor || ""}
                    onChange={e => setEditForm({ ...editForm, id_medidor: e.target.value })}
                    required className="modal-medidor"
                  />
                </label>
                <label>
                  Fecha:
                  <input
                    type="date"
                    value={editForm.fecha || ""}
                    onChange={e => setEditForm({ ...editForm, fecha: e.target.value })}
                    required className="modal-fecha"
                  />
                </label>
                <div className="reconexion-modal-actions">
                  <button type="submit" className="btn-save" title="Guardar">
                    <FaSave />
                  </button>
                  <button type="button" onClick={cerrarModal} className="btn-cancel" title="Cancelar">
                    <FaTimes />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReconexionPage;