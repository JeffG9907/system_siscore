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

const ReconexionPage = () => {
  const [cuenta, setCuenta] = useState("");
  const [medidor, setMedidor] = useState("");
  const [fechaForm, setFechaForm] = useState(getTodayISO());
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [reconexiones, setReconexiones] = useState([]);
  const [busquedaCuenta, setBusquedaCuenta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editOriginal, setEditOriginal] = useState({});

  useEffect(() => {
    if (!fechaFiltro) {
      setReconexiones([]);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`${API_URL}?fecha=${fechaFiltro}`)
      .then(res => res.json())
      .then(json => setReconexiones(Array.isArray(json) ? json : []))
      .catch(() => {
        setError("No se pudo obtener las reconexiones.");
        setReconexiones([]);
      })
      .finally(() => setLoading(false));
  }, [fechaFiltro]);

  const handleGuardar = async e => {
    e.preventDefault();
    setError("");
    if (cuenta.trim() === "" || medidor.trim() === "" || fechaForm.trim() === "") {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cuenta: cuenta.trim(),
          id_medidor: medidor.trim(),
          fecha: fechaForm,
        }),
      });
      if (res.ok) {
        if (fechaFiltro === fechaForm) {
          const nuevasReconexiones = await fetch(`${API_URL}?fecha=${fechaFiltro}`).then(r => r.json());
          setReconexiones(Array.isArray(nuevasReconexiones) ? nuevasReconexiones : []);
        }
        setCuenta("");
        setMedidor("");
        setFechaForm(getTodayISO());
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar la reconexión.");
      }
    } catch (err) {
      setError("No se pudo guardar la reconexión.");
    }
    setLoading(false);
  };

  const reconexionesFiltradas = reconexiones.filter(reconexion =>
    busquedaCuenta.trim() === ""
      ? true
      : String(reconexion.id_cuenta).toLowerCase().includes(busquedaCuenta.trim().toLowerCase())
  );

  // Eliminar reconexión (solo por cuenta)
  const handleEliminar = async (id_cuenta) => {
    if (!window.confirm("¿Seguro que desea eliminar todas las reconexiones de esta cuenta?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cuenta }),
      });
      if (res.ok) {
        setReconexiones(reconexiones.filter(r => r.id_cuenta !== id_cuenta));
      } else {
        setError("No se pudo eliminar la reconexión.");
      }
    } catch {
      setError("No se pudo eliminar la reconexión.");
    }
    setLoading(false);
  };

  // Abrir modal edición: guarda originales
  const abrirModalEditar = reconexion => {
    setEditando(`${reconexion.id_cuenta}_${reconexion.id_medidor}_${reconexion.fecha.slice(0,10)}`);
    setEditForm({
      id_cuenta: reconexion.id_cuenta,
      id_medidor: reconexion.id_medidor,
      fecha: reconexion.fecha ? reconexion.fecha.slice(0,10) : "",
    });
    setEditOriginal({
      id_cuenta: reconexion.id_cuenta,
      id_medidor: reconexion.id_medidor,
      fecha: reconexion.fecha ? reconexion.fecha.slice(0,10) : ""
    });
  };

  const cerrarModalEditar = () => {
    setEditando(null);
    setEditForm({});
    setEditOriginal({});
  };

  // Editar reconexión
  const handleEditSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_cuenta: editOriginal.id_cuenta,
          original_medidor: editOriginal.id_medidor,
          original_fecha: editOriginal.fecha,
          id_cuenta: editForm.id_cuenta,
          id_medidor: editForm.id_medidor,
          fecha: editForm.fecha
        }),
      });
      if (res.ok) {
        const nuevasReconexiones = await fetch(`${API_URL}?fecha=${fechaFiltro}`).then(r => r.json());
        setReconexiones(Array.isArray(nuevasReconexiones) ? nuevasReconexiones : []);
        cerrarModalEditar();
      } else {
        setError("No se pudo editar la reconexión.");
      }
    } catch {
      setError("No se pudo editar la reconexión.");
    }
    setLoading(false);
  };

  return (
    <div className="reconexion-main-container">
      <div className="reconexion-card">
        <h1 className="reconexion-title">
          Registro de Reconexiones
        </h1>
        <form className="reconexion-form" onSubmit={handleGuardar}>
          <div className="reconexion-form-box">
            <div className="reconexion-form-row">
              <label>
                <span>Cuenta:</span>
                <input
                  type="text"
                  value={cuenta}
                  onChange={e => setCuenta(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="off"
                  placeholder="Ej: 12345"
                  className="reconexion-input-cuenta"
                />
              </label>
              <label>
                <span>Medidor:</span>
                <input
                  type="text"
                  value={medidor}
                  onChange={e => setMedidor(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="off"
                  placeholder="Ej: MD98765"
                  className="reconexion-input-medidor"
                />
              </label>
              <label>
                <span>Fecha:</span>
                <input
                  type="date"
                  value={fechaForm}
                  onChange={e => setFechaForm(e.target.value)}
                  required
                  disabled={loading}
                  className="reconexion-input-fecha"
                />
              </label>
              <button className="reconexion-btn" type="submit" disabled={loading}>
                Guardar
              </button>
            </div>
          </div>
        </form>
        <div className="reconexion-filter-row">
          <div className="reconexion-filter">
            <label>
              <span>Filtrar:</span>
              <input
                type="date"
                value={fechaFiltro}
                onChange={e => setFechaFiltro(e.target.value)}
                disabled={loading}
                className="reconexion-input-fecha"
              />
            </label>
          </div>
          {fechaFiltro && !loading && (
            <div className="reconexion-search-row">
              <label>
                <span>Buscar:</span>
                <input
                  type="text"
                  value={busquedaCuenta}
                  onChange={e => setBusquedaCuenta(e.target.value)}
                  placeholder="Ingrese número de cuenta"
                  className="reconexion-search-input"
                  autoComplete="off"
                />
              </label>
            </div>
          )}
        </div>
        <h2 className="reconexion-subtitle">
          {fechaFiltro
            ? `Reconexiones del ${toDisplayFormat(fechaFiltro)} | Total: ${reconexionesFiltradas.length}`
            : "Seleccione una fecha para verificación de reconexiones"}
        </h2>
        {error && (
          <div className="reconexion-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        {fechaFiltro && (
          loading ? (
            <div className="reconexion-loader">
              <div className="loader" />
              <span>Cargando reconexiones...</span>
            </div>
          ) : (
            <div className="reconexion-table-wrapper">
              <table className="reconexion-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Número de cuenta</th>
                    <th>Medidor</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reconexionesFiltradas.map((reconexion, idx) => (
                    <tr key={`${reconexion.id_cuenta}-${reconexion.id_medidor}-${reconexion.fecha}`}>
                      <td>{idx + 1}</td>
                      <td>{reconexion.id_cuenta}</td>
                      <td>{reconexion.id_medidor}</td>
                      <td>{reconexion.fecha ? reconexion.fecha.slice(0, 10) : ""}</td>
                      <td>
                        <button
                          onClick={() => abrirModalEditar(reconexion)}
                          className="reconexion-btn-edit"
                          title="Editar"
                        ><FaEdit /></button>
                        <button
                          onClick={() => handleEliminar(reconexion.id_cuenta)}
                          className="reconexion-btn-delete"
                          title="Eliminar"
                        ><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                  {reconexionesFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="reconexion-table-empty">
                        No hay reconexiones encontradas con ese número de cuenta.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
        {/* Modal edición */}
        {editando && (
          <div className="reconexion-modal-backdrop">
            <div className="reconexion-modal">
              <h3>Editar Reconexión</h3>
              <form onSubmit={handleEditSubmit}>
                <label>
                  Cuenta:
                  <input
                    type="text"
                    value={editForm.id_cuenta || ""}
                    onChange={e => setEditForm({ ...editForm, id_cuenta: e.target.value })}
                    required
                    className="reconexion-modal-input"
                  />
                </label>
                <label>
                  Medidor:
                  <input
                    type="text"
                    value={editForm.id_medidor || ""}
                    onChange={e => setEditForm({ ...editForm, id_medidor: e.target.value })}
                    required
                    className="reconexion-modal-input"
                  />
                </label>
                <label>
                  Fecha:
                  <input
                    type="date"
                    value={editForm.fecha || ""}
                    onChange={e => setEditForm({ ...editForm, fecha: e.target.value })}
                    required
                    className="reconexion-modal-input"
                  />
                </label>
                <div className="reconexion-modal-actions">
                  <button type="submit" className="btn-save" title="Guardar">
                    <FaSave />
                  </button>
                  <button type="button" onClick={cerrarModalEditar} className="btn-cancel" title="Cancelar">
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