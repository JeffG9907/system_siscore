import React, { useState, useEffect } from "react";
import "../styles/IncidenciasPage.css";
import { generarPDFIncidencia } from "../utils/generarReporteIncidencias";
import { FaEdit, FaFilePdf, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const NOVEDADES = [
  "Usuario agresivo",
  "Medidor manipulado por el usuario",
  "Retiro del sello de corte",
  "Medidor dentro del predio",
  "Fuga de agua antes del corte",
  "Medidor dañado antes del corte",
  "Conexión ilegal",
  "Otro"
];

const OPERADORES = [
  "Cuadrilla Amarilla",
  "Cuadrilla Azul",
  "Cuadrilla Roja",
  "Cuadrilla Blanca",
];

const initialForm = {
  cuenta: "",
  medidor: "",
  fecha: "",
  novedad: "",
  operador: "",
  observaciones: "",
  imagen: null
};

const API_HOST = "https://backend-apiemail.up.railway.app";

const IncidenciaPage = () => {
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState("");
  const [incidencias, setIncidencias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editImagen, setEditImagen] = useState(null);

  // Bloquea el scroll de fondo cuando la modal está abierta
  useEffect(() => {
    if (editando) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [editando]);

  useEffect(() => { fetchIncidencias(); }, []);

  const fetchIncidencias = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/incidencias`);
      const data = await res.json();
      setIncidencias(Array.isArray(data) ? data : data.incidencias || []);
    } catch { setIncidencias([]); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cuenta || !form.medidor || !form.fecha || !form.novedad || !form.operador) {
      setMensaje("Todos los campos son obligatorios."); return;
    }
    setMensaje(""); setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key]) formData.append(key, form[key]);
      });
      const res = await fetch(`${API_HOST}/api/incidencias`, {
        method: "POST", body: formData
      });
      const json = await res.json();
      if (json.ok) {
        setMensaje("Incidencia registrada correctamente.");
        setForm(initialForm); fetchIncidencias();
        generarPDFIncidencia({
          ...form,
          imagenUrl: json.imagenUrl || ""
        }, `incidencia_${form.cuenta}_${form.fecha}.pdf`);
      } else setMensaje(json.error || "Error al registrar la incidencia.");
    } catch { setMensaje("Error al registrar la incidencia."); }
    setLoading(false);
  };

  const abrirModalEdicion = (item) => {
    setEditando(item);
    setEditForm({ ...item, fecha: item.fecha ? item.fecha.slice(0, 10) : "" });
    setEditImagen(null);
  };
  const cerrarModal = () => {
    setEditando(null); setEditForm(initialForm); setEditImagen(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMensaje(""); setLoading(true);
    try {
      let res, json;
      if (editImagen) {
        const formData = new FormData();
        Object.keys(editForm).forEach(key => formData.append(key, editForm[key]));
        formData.append("imagen", editImagen);
        res = await fetch(`${API_HOST}/api/incidencias/${editando.id_incidencia}`, {
          method: "PUT", body: formData
        });
      } else {
        res = await fetch(`${API_HOST}/api/incidencias/${editando.id_incidencia}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
        });
      }
      json = await res.json();
      if (json.ok) {
        setMensaje("Incidencia editada correctamente."); fetchIncidencias(); cerrarModal();
      } else setMensaje(json.error || "Error al actualizar incidencia");
    } catch { setMensaje("Error de red"); }
    setLoading(false);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta incidencia?")) return;
    setMensaje(""); setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/incidencias/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { setMensaje("Incidencia eliminada correctamente."); fetchIncidencias(); }
      else setMensaje(json.error || "Error al eliminar incidencia");
    } catch { setMensaje("Error de red"); }
    setLoading(false);
  };

  const handleGenerarPDF = (item) => {
    const imagenUrl = item.imagenUrl || "";
    generarPDFIncidencia({ ...item, imagenUrl }, `incidencia_${item.cuenta}_${item.fecha}.pdf`);
  };

  const incidenciasFiltradas = incidencias.filter(i =>
    busqueda.trim() === ""
      ? true
      : i.cuenta.toLowerCase().includes(busqueda.toLowerCase()) ||
        i.medidor.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="incidencia-main-container">
      <h1 className="incidencia-title">Registro de Novedades e Incidencias</h1>
      <form className="incidencia-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="corte-form-box">
          <div className="incidencia-form-row">
            <label className="incidencia-label-cuenta">
              Cuenta:
              <input
                className="incidencia-entry-cuenta"
                type="text"
                value={form.cuenta}
                onChange={e => setForm({ ...form, cuenta: e.target.value })}
                required autoComplete="off" disabled={loading}
                placeholder="Ej: 1234"
              />
            </label>
            <label className="incidencia-label-medidor">
              Medidor:
              <input
                className="incidencia-entry-medidor"
                type="text"
                value={form.medidor}
                onChange={e => setForm({ ...form, medidor: e.target.value })}
                required autoComplete="off" disabled={loading}
                placeholder="Ej: MD98765"
              />
            </label>
            <label className="incidencia-label-fecha">
              Fecha:
              <input
                className="incidencia-entry-fecha"
                type="date"
                value={form.fecha}
                onChange={e => setForm({ ...form, fecha: e.target.value })}
                required disabled={loading}
                placeholder="dd/mm/aaaa"
              />
            </label>
            <label className="incidencia-label-novedad">
              Novedad:
              <select
                className="incidencia-entry-novedad"
                value={form.novedad}
                onChange={e => setForm({ ...form, novedad: e.target.value })}
                required disabled={loading}
              >
                <option value="">Seleccione...</option>
                {NOVEDADES.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="incidencia-form-row" style={{marginTop:"18px"}}>
            <label className="incidencia-label-operador">
              Operador:
              <select
                className="incidencia-entry-operador"
                value={form.operador}
                onChange={e => setForm({ ...form, operador: e.target.value })}
                required disabled={loading}
              >
                <option value="">Seleccione...</option>
                {OPERADORES.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </label>
            <label className="incidencia-label-observaciones">
              Observaciones:
              <input
                className="incidencia-entry-observaciones"
                type="text"
                value={form.observaciones}
                onChange={e => setForm({ ...form, observaciones: e.target.value })}
                disabled={loading}
                maxLength={200}
                placeholder="Observaciones adicionales"
              />
            </label>
          </div>
          <div className="incidencia-form-row" style={{marginTop:"18px"}}>
            <label className="incidencia-label-imagen">
              Imagen:
              <input
                className="incidencia-entry-imagen"
                type="file"
                accept="image/*"
                onChange={e => setForm({ ...form, imagen: e.target.files[0] })}
                disabled={loading}
              />
            </label>
            <button type="submit" className="btn-incidencia-guardar" disabled={loading}>
              <FaSave /> Guardar
            </button>
          </div>
        </div>
      </form>
      {mensaje && <div className="incidencia-mensaje">{mensaje}</div>}
      {/* BUSQUEDA */}
      <div className="incidencia-reporte-btn">
        <label className="incidencia-label-buscar">
          <span>Buscar por cuenta o medidor:</span>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Ej: 12345 o MD98765"
           className="incidencia-entry-buscar"
            autoComplete="off"
          />
        </label>
      </div>
      <h2 className="incidencia-title" style={{ fontSize: "1.2rem", marginTop: 16 }}>
        {`Incidencias registradas | Total: ${incidenciasFiltradas.length}`}
      </h2>
      <div className="incidencia-table-wrapper">
        <table className="incidencia-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cuenta</th>
              <th>Medidor</th>
              <th>Fecha</th>
              <th>Novedad</th>
              <th>Operador</th>
              <th>Observaciones</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidenciasFiltradas.map((item, idx) => (
              <tr key={item.id_incidencia}>
                <td>{idx + 1}</td>
                <td>{item.cuenta}</td>
                <td>{item.medidor}</td>
                <td>{item.fecha ? item.fecha.slice(0, 10) : ""}</td>
                <td>{item.novedad}</td>
                <td>{item.operador}</td>
                <td>{item.observaciones || ""}</td>
                <td>
                  {item.imagenUrl ? (
                    <a href={item.imagenUrl} target="_blank" rel="noopener noreferrer">
                      <img src={item.imagenUrl} alt="Incidencia" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                    </a>
                  ) : (
                    <span>No imagen</span>
                  )}
                </td>
                <td>
                  <button onClick={() => abrirModalEdicion(item)} className="btn-edit" title="Editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleGenerarPDF(item)} className="btn-pdf" title="PDF">
                    <FaFilePdf />
                  </button>
                  <button onClick={() => handleEliminar(item.id_incidencia)} className="btn-delete" title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {incidenciasFiltradas.length === 0 && (
              <tr>
                <td colSpan={9} className="incidencia-table-empty">
                  No hay incidencias encontradas con ese número de cuenta o medidor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* MODAL EDICION */}
      {editando && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Editar Incidencia</h3>
            <form onSubmit={handleEditSubmit} encType="multipart/form-data">
              <label>
                Cuenta:
                <input type="text" value={editForm.cuenta}
                  onChange={e => setEditForm({ ...editForm, cuenta: e.target.value })} required />
              </label>
              <label>
                Medidor:
                <input type="text" value={editForm.medidor}
                  onChange={e => setEditForm({ ...editForm, medidor: e.target.value })} required />
              </label>
              <label>
                Fecha:
                <input type="date" value={editForm.fecha}
                  onChange={e => setEditForm({ ...editForm, fecha: e.target.value })} required />
              </label>
              <label>
                Novedad:
                <select value={editForm.novedad}
                  onChange={e => setEditForm({ ...editForm, novedad: e.target.value })} required>
                  <option value="">Seleccione...</option>
                  {NOVEDADES.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Operador:
                <select value={editForm.operador}
                  onChange={e => setEditForm({ ...editForm, operador: e.target.value })} required>
                  <option value="">Seleccione...</option>
                  {OPERADORES.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </label>
              <label>
                Observaciones:
                <input type="text" value={editForm.observaciones}
                  onChange={e => setEditForm({ ...editForm, observaciones: e.target.value })} />
              </label>
              <label>
                Imagen:
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditImagen(e.target.files[0])}
                />
                {editando.imagenUrl && !editImagen && (
                  <div>
                    <span>Imagen actual:</span>
                    <a href={editando.imagenUrl} target="_blank" rel="noopener noreferrer">
                      <img src={editando.imagenUrl} alt="Incidencia" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4, marginLeft: 6 }} />
                    </a>
                  </div>
                )}
                {editImagen && (
                  <div style={{ marginTop: 6 }}>Nueva imagen seleccionada</div>
                )}
              </label>
              <div style={{marginTop:10}}>
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
  );
};

export default IncidenciaPage;