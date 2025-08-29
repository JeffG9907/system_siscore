import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import "../styles/CortePage.css";

const initialForm = {
  cuenta: "",
  medidor: "",
  fecha: "",
  herramienta: "amarilla",
  localizacion: "",
  imagen: null,
};

const API_URL = "https://backend-apiemail.up.railway.app/api/cortes";

function getTodayISO() {
  const now = new Date();
  const utcMinus5 = new Date(now.getTime() - (now.getTimezoneOffset() + 300) * 60000);
  return utcMinus5.toISOString().slice(0, 10);
}

const CortePage = () => {
  const [form, setForm] = useState({ ...initialForm, fecha: getTodayISO() });
  const [mensaje, setMensaje] = useState("");
  const [cortes, setCortes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editImagen, setEditImagen] = useState(null);

  // Fetch cortes (todo)
  useEffect(() => { fetchCortes(); }, []);

  const fetchCortes = async () => {
    setLoading(true);
    try {
      let url = API_URL;
      if (fechaFiltro) url += `?fecha=${fechaFiltro}`;
      const res = await fetch(url);
      const data = await res.json();
      setCortes(Array.isArray(data) ? data : []);
    } catch { setCortes([]); }
    setLoading(false);
  };

  // Filtro por cuenta
  const handleBuscarCuenta = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) { setCortes([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cuenta/${busqueda.trim()}`);
      const json = await res.json();
      setCortes(Array.isArray(json) ? json : []);
    } catch { setCortes([]); }
    setLoading(false);
  };

  // Filtro por fecha
  useEffect(() => {
    if (!fechaFiltro) return;
    fetchCortes();
  }, [fechaFiltro]);

  // Guardar (crear)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cuenta || !form.medidor || !form.fecha || !form.herramienta) {
      setMensaje("Todos los campos son obligatorios."); return;
    }
    setMensaje(""); setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key]) formData.append(key, form[key]);
      });
      if (form.imagen) formData.append("imagen", form.imagen);
      const res = await fetch(API_URL, {
        method: "POST", body: formData
      });
      const json = await res.json();
      if (json.ok) {
        setMensaje("Corte registrado correctamente.");
        setForm({ ...initialForm, fecha: getTodayISO() });
        fetchCortes();
      } else setMensaje(json.error || "Error al registrar el corte.");
    } catch { setMensaje("Error al registrar el corte."); }
    setLoading(false);
  };

  // Eliminar
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que desea eliminar el corte?")) return;
    setMensaje(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { setMensaje("Corte eliminado correctamente."); fetchCortes(); }
      else setMensaje(json.error || "Error al eliminar corte.");
    } catch { setMensaje("Error de red"); }
    setLoading(false);
  };

  // Abrir modal edición
  const abrirModalEdicion = (item) => {
    setEditando(item);
    setEditForm({
      ...item,
      fecha: item.fecha ? item.fecha.slice(0, 10) : "",
      imagen: item.imagen || null,
    });
    setEditImagen(null);
  };
  const cerrarModal = () => {
    setEditando(null); setEditForm(initialForm); setEditImagen(null);
  };

  // Editar
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMensaje(""); setLoading(true);
    try {
      let res, json;
      if (editImagen) {
        const formData = new FormData();
        Object.keys(editForm).forEach(key => {
          if (key !== "imagen") formData.append(key, editForm[key]);
        });
        formData.append("imagen", editImagen);
        res = await fetch(`${API_URL}/${editando.id_cuenta}`, {
          method: "PUT", body: formData
        });
      } else {
        res = await fetch(`${API_URL}/${editando.id_cuenta}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
        });
      }
      json = await res.json();
      if (json.ok) {
        setMensaje("Corte editado correctamente."); fetchCortes(); cerrarModal();
      } else setMensaje(json.error || "Error al actualizar corte");
    } catch { setMensaje("Error de red"); }
    setLoading(false);
  };

  // Filtro visual local (opcional)
  const cortesFiltrados = cortes.filter(i =>
    busqueda.trim() === ""
      ? true
      : String(i.id_cuenta).toLowerCase().includes(busqueda.toLowerCase()) ||
        String(i.id_medidor).toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="corte-main-container">
      <h1 className="corte-title">Registro de Cortes</h1>
      <form className="corte-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="corte-form-box">
          <div className="corte-form-row">
            <label>
              Cuenta:
              <input
                type="text"
                value={form.cuenta}
                onChange={e => setForm({ ...form, cuenta: e.target.value })}
                required disabled={loading} autoComplete="off"
                placeholder="Ej: 12345"
              />
            </label>
            <label>
              Medidor:
              <input
                type="text"
                value={form.medidor}
                onChange={e => setForm({ ...form, medidor: e.target.value })}
                required disabled={loading} autoComplete="off"
                placeholder="Ej: MD98765"
              />
            </label>
            <label>
              Fecha:
              <input
                type="date"
                value={form.fecha}
                onChange={e => setForm({ ...form, fecha: e.target.value })}
                required disabled={loading}
              />
            </label>
            <label>
              Herramienta:
              <select
                value={form.herramienta}
                onChange={e => setForm({ ...form, herramienta: e.target.value })}
                required disabled={loading}
              >
                <option value="amarilla">Amarilla</option>
                <option value="roja">Roja</option>
                <option value="azul">Azul</option>
                <option value="blanca">Blanca</option>
              </select>
            </label>
          </div>
          <div className="corte-form-row">
            <label>
              Localización:
              <input
                type="text"
                value={form.localizacion}
                onChange={e => setForm({ ...form, localizacion: e.target.value })}
                disabled={loading}
                placeholder="https://maps.app.goo.gl/tTyWbAay9jPe7p36A"
              />
            </label>
            <label>
              Imagen:
              <input
                type="file"
                accept="image/*"
                onChange={e => setForm({ ...form, imagen: e.target.files[0] })}
                disabled={loading}
              />
            </label>
            <button type="submit" className="corte-btn" disabled={loading}>
              <FaSave /> Guardar
            </button>
          </div>
        </div>
      </form>
      {mensaje && <div className="corte-mensaje">{mensaje}</div>}
      {/* BUSQUEDA */}
      <div className="corte-form-box">
        <form style={{ display: 'flex', alignItems: 'center' }} onSubmit={handleBuscarCuenta} className="corte-filter">
          <label style={{ marginRight: '1.5rem' }}>
            <span>Buscar por cuenta o medidor:</span>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Número de cuenta o medidor"
              autoComplete="off"
              disabled={loading}
            />
          </label>
          <button type="submit" className="corte-btn" disabled={loading}>
            Buscar
          </button>
        </form>
        <div className="corte-filter">
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
      <h2 className="corte-subtitle">
        {`Cortes registrados | Total: ${cortesFiltrados.length}`}
      </h2>
      <div className="corte-table-wrapper">
        <table className="corte-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cuenta</th>
              <th>Medidor</th>
              <th>Fecha</th>
              <th>Herramienta</th>
              <th>Localización</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cortesFiltrados.map((item, idx) => (
              <tr key={item.id_cuenta + "-" + idx}>
                <td>{idx + 1}</td>
                <td>{item.id_cuenta}</td>
                <td>{item.id_medidor}</td>
                <td>{item.fecha ? item.fecha.slice(0, 10) : ""}</td>
                <td>{item.herramienta || "-"}</td>
                <td>
                  {item.localizacion ?
                    <a href={item.localizacion} target="_blank" rel="noopener noreferrer">Ver mapa</a>
                    : <span>-</span>
                  }
                </td>
                <td>
                  {item.imagen ?
                    <a href={item.imagen} target="_blank" rel="noopener noreferrer">
                      <img src={item.imagen} alt="Corte" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                    </a>
                    : <span>No imagen</span>
                  }
                </td>
                <td>
                  <button onClick={() => abrirModalEdicion(item)} className="corte-btn-edit" title="Editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleEliminar(item.id_cuenta)} className="corte-btn-delete" title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {cortesFiltrados.length === 0 && (
              <tr>
                <td colSpan={8} className="corte-table-empty">
                  No hay cortes encontrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* MODAL EDICION */}
      {editando && (
        <div className="corte-modal-backdrop">
          <div className="corte-modal">
            <h3>Editar Corte</h3>
            <form onSubmit={handleEditSubmit} encType="multipart/form-data">
              <label>
                Cuenta:
                <input type="text" value={editForm.id_cuenta || ""}
                  disabled required />
              </label>
              <label>
                Medidor:
                <input type="text" value={editForm.id_medidor || ""}
                  onChange={e => setEditForm({ ...editForm, id_medidor: e.target.value })} required />
              </label>
              <label>
                Fecha:
                <input type="date" value={editForm.fecha || ""}
                  onChange={e => setEditForm({ ...editForm, fecha: e.target.value })} required />
              </label>
              <label>
                Herramienta:
                <select value={editForm.herramienta || "amarilla"}
                  onChange={e => setEditForm({ ...editForm, herramienta: e.target.value })} required>
                  <option value="amarilla">Amarilla</option>
                  <option value="roja">Roja</option>
                  <option value="azul">Azul</option>
                  <option value="blanca">Blanca</option>
                </select>
              </label>
              <label>
                Localización:
                <input type="text" value={editForm.localizacion || ""}
                  onChange={e => setEditForm({ ...editForm, localizacion: e.target.value })} />
              </label>
              <label>
                Imagen:
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditImagen(e.target.files[0])}
                />
                {editForm.imagen && !editImagen && (
                  <div>
                    <span>Imagen actual:</span>
                    <a href={editForm.imagen} target="_blank" rel="noopener noreferrer">
                      <img src={editForm.imagen} alt="Corte" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4, marginLeft: 6 }} />
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

export default CortePage;