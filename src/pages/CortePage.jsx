import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaTimes, FaSave } from "react-icons/fa";
import "../styles/CortePage.css";

function getTodayISO() {
  const now = new Date();
  const utcMinus5 = new Date(now.getTime() - (now.getTimezoneOffset() + 300) * 60000);
  return utcMinus5.toISOString().slice(0, 10);
}

const API_URL = "https://backend-apiemail.up.railway.app/api/cortes";

const CortePage = () => {
  const [cuenta, setCuenta] = useState("");
  const [medidor, setMedidor] = useState("");
  const [fechaForm, setFechaForm] = useState(getTodayISO());
  const [herramienta, setHerramienta] = useState("amarilla");
  const [localizacion, setLocalizacion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [cuentaBusqueda, setCuentaBusqueda] = useState("");
  const [cortes, setCortes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editHerramienta, setEditHerramienta] = useState("amarilla");
  const [editImagen, setEditImagen] = useState(null);

  // Bloquear scroll fondo al abrir modal
  useEffect(() => {
    if (editando) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [editando]);

  // Buscar por cuenta solo al presionar Enter
  const handleBuscarCuenta = async (e) => {
    e.preventDefault();
    setFechaFiltro("");
    if (!cuentaBusqueda.trim()) {
      setCortes([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/cuenta/${cuentaBusqueda.trim()}`);
      const json = await res.json();
      setCortes(Array.isArray(json) ? json : []);
      setCuentaBusqueda("");
    } catch {
      setError("No se pudo buscar por cuenta.");
      setCortes([]);
    }
    setLoading(false);
  };

  // Filtrar por fecha automáticamente al cambiar y limpiar el campo de búsqueda de cuenta
  useEffect(() => {
    if (!fechaFiltro) return;
    setCuentaBusqueda("");
    setLoading(true);
    setError("");
    fetch(`${API_URL}?fecha=${fechaFiltro}`)
      .then(res => res.json())
      .then(json => setCortes(Array.isArray(json) ? json : []))
      .catch(() => {
        setError("No se pudo obtener los cortes.");
        setCortes([]);
      })
      .finally(() => setLoading(false));
  }, [fechaFiltro]);

  const handleGuardar = async e => {
    e.preventDefault();
    setError("");
    if (!cuenta.trim() || !medidor.trim() || !fechaForm.trim() || !herramienta.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("cuenta", cuenta.trim());
      formData.append("medidor", medidor.trim());
      formData.append("fecha", fechaForm);
      formData.append("herramienta", herramienta);
      formData.append("localizacion", localizacion);
      if (imagen) formData.append("imagen", imagen);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        let url = cortes.length && cortes[0]?.id_cuenta
          ? `${API_URL}/cuenta/${cortes[0].id_cuenta}`
          : fechaFiltro
          ? `${API_URL}?fecha=${fechaFiltro}`
          : API_URL;
        const nuevosCortes = await fetch(url).then(r => r.json());
        setCortes(Array.isArray(nuevosCortes) ? nuevosCortes : []);
        setCuenta("");
        setMedidor("");
        setFechaForm(getTodayISO());
        setHerramienta("amarilla");
        setLocalizacion("");
        setImagen(null);
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar el corte.");
      }
    } catch (err) {
      setError("No se pudo guardar el corte.");
    }
    setLoading(false);
  };

  const handleEliminar = async (id_cuenta) => {
    if (!window.confirm("¿Seguro que desea eliminar el corte?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id_cuenta}`, { method: "DELETE" });
      if (res.ok) {
        setCortes(cortes.filter(c => c.id_cuenta !== id_cuenta));
      } else {
        setError("No se pudo eliminar el corte.");
      }
    } catch {
      setError("No se pudo eliminar el corte.");
    }
    setLoading(false);
  };

  const abrirModalEditar = corte => {
    setEditando(corte.id_cuenta);
    setEditForm({ ...corte });
    setEditHerramienta(corte.herramienta || "amarilla");
    setEditImagen(null);
  };

  const cerrarModalEditar = () => {
    setEditando(null);
    setEditForm({});
    setEditHerramienta("amarilla");
    setEditImagen(null);
  };

  const handleEditSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    let res;
    const fechaFormatoDate = editForm.fecha?.slice(0, 10); // <-- clave aquí
    if (editImagen) {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (key === "fecha") {
          formData.append("fecha", fechaFormatoDate);
        } else {
          formData.append(key, editForm[key]);
        }
      });
      formData.append("herramienta", editHerramienta);
      formData.append("imagen", editImagen);
      res = await fetch(`${API_URL}/${editando}`, {
        method: "PUT",
        body: formData,
      });
    } else {
      res = await fetch(`${API_URL}/${editando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          herramienta: editHerramienta,
          imagen: editForm.imagen || null,
          fecha: fechaFormatoDate // <-- solo YYYY-MM-DD
        }),
      });
    }
    if (res.ok) {
      let url = cortes.length && cortes[0]?.id_cuenta
        ? `${API_URL}/cuenta/${cortes[0].id_cuenta}`
        : fechaFiltro
        ? `${API_URL}?fecha=${fechaFiltro}`
        : API_URL;
      const nuevosCortes = await fetch(url).then(r => r.json());
      setCortes(Array.isArray(nuevosCortes) ? nuevosCortes : []);
      cerrarModalEditar();
    } else {
      setError("No se pudo editar el corte.");
    }
  } catch {
    setError("No se pudo editar el corte.");
  }
  setLoading(false);
};

  return (
    <div className="corte-main-container">
      <div className="corte-card">
        <h1 className="corte-title">Registro de Cortes</h1>
        <form className="corte-form" onSubmit={handleGuardar} encType="multipart/form-data">
          <div className="corte-form-box">
            <div className="corte-form-row">
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
                  className="corte-input-cuenta"
                />
              </label>
              <label>
                Medidor:
                <input
                  type="text"
                  value={medidor}
                  onChange={e => setMedidor(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="off"
                  placeholder="Ej: MD98765"
                  className="corte-input-medidor"
                />
              </label>
              <label>
                Fecha:
                <input
                  type="date"
                  value={fechaForm}
                  onChange={e => setFechaForm(e.target.value)}
                  required
                  disabled={loading}
                  className="corte-input-fecha"
                />
              </label>
              <label>
                Herramienta:
                <select
                  value={herramienta}
                  onChange={e => setHerramienta(e.target.value)}
                  required
                  disabled={loading}
                  className="corte-input-herramienta"
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
                  value={localizacion}
                  onChange={e => setLocalizacion(e.target.value)}
                  disabled={loading}
                  placeholder="https://maps.app.goo.gl/tTyWbAay9jPe7p36A"
                  className="corte-input-localizacion"
                />
              </label>
              <label>
                Imagen:
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImagen(e.target.files[0])}
                  disabled={loading}
                  className="corte-input-imagen"
                />
              </label>
              <button className="corte-btn" type="submit" disabled={loading}>
                Guardar
              </button>
            </div>
          </div>
        </form>

        <div className="corte-form-box">
          <div className="corte-filter-row">
            <form style={{ display: 'flex', alignItems: 'center' }} onSubmit={handleBuscarCuenta} className="corte-filter">
              <label style={{ marginRight: '1.5rem' }}>
                <span>Buscar por cuenta:</span>
                <input
                  type="text"
                  value={cuentaBusqueda}
                  onChange={e => setCuentaBusqueda(e.target.value)}
                  placeholder="Número de cuenta"
                  className="corte-search-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </label>
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
        </div>
        <h2 className="corte-subtitle">
          {(fechaFiltro || cortes.length > 0)
            ? `Cortes filtrados | Total: ${cortes.length}`
            : "Seleccione una fecha o busque por cuenta para verificación de cortes"}
        </h2>
        {error && (
          <div className="corte-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        {(fechaFiltro || cortes.length > 0) && (
          loading ? (
            <div className="corte-loader">
              <div className="loader" />
              <span>Cargando cortes...</span>
            </div>
          ) : (
            <div className="corte-table-wrapper">
              <table className="corte-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Número de cuenta</th>
                    <th>Medidor</th>
                    <th>Fecha</th>
                    <th>Herramienta</th>
                    <th>Localización</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(cortes) ? cortes : []).map((corte, idx) => (
                    <tr key={corte.id_cuenta + "-" + idx}>
                      <td>{idx + 1}</td>
                      <td>{corte.id_cuenta}</td>
                      <td>{corte.id_medidor}</td>
                      <td>{corte.fecha ? corte.fecha.slice(0, 10) : ""}</td>
                      <td>{corte.herramienta || "-"}</td>
                      <td>
                        {corte.localizacion ?
                          <a href={corte.localizacion} target="_blank" rel="noopener noreferrer">Ver mapa</a>
                          : <span>-</span>
                        }
                      </td>
                      <td>
                        {corte.imagen ?
                          <a href={corte.imagen} target="_blank" rel="noopener noreferrer">
                            <img src={corte.imagen} alt="Corte" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                          </a>
                          : <span>No imagen</span>
                        }
                      </td>
                      <td>
                        <button onClick={() => abrirModalEditar(corte)} className="corte-btn-edit" title="Editar">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleEliminar(corte.id_cuenta)} className="corte-btn-delete" title="Eliminar">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cortes.length === 0 && (
                    <tr>
                      <td colSpan={8} className="corte-table-empty">
                        No hay cortes encontrados.
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
          <div className="corte-modal-backdrop">
            <div className="corte-modal">
              <h3>Editar Corte</h3>
              <form className="corte-modal-form" onSubmit={handleEditSubmit} encType="multipart/form-data">
                <div className="corte-modal-row">
                  <label className="corte-modal-label">Cuenta:</label>
                  <input
                    type="text"
                    value={editForm.id_cuenta || ""}
                    onChange={e => setEditForm({ ...editForm, id_cuenta: e.target.value })}
                    required
                    disabled
                    className="corte-modal-cuenta"
                  />
                  <label className="corte-modal-label">Medidor:</label>
                  <input
                    type="text"
                    value={editForm.id_medidor || ""}
                    onChange={e => setEditForm({ ...editForm, id_medidor: e.target.value })}
                    required
                    className="corte-modal-medidor"
                  />
                </div>
                <div className="corte-modal-row">
                  <label className="corte-modal-label">Fecha:</label>
                  <input
                    type="date"
                    value={editForm.fecha ? editForm.fecha.slice(0,10) : ""}
                    onChange={e => setEditForm({ ...editForm, fecha: e.target.value })}
                    required
                    className="corte-modal-fecha"
                  />
                  <label className="corte-modal-label">Herramienta:</label>
                  <select
                    value={editHerramienta}
                    onChange={e => setEditHerramienta(e.target.value)}
                    required
                    className="corte-modal-herramienta"
                  >
                    <option value="amarilla">Amarilla</option>
                    <option value="roja">Roja</option>
                    <option value="azul">Azul</option>
                    <option value="blanca">Blanca</option>
                  </select>
                </div>
                <div className="corte-modal-row">
                  <label className="corte-modal-label">Localización:</label>
                  <input
                    type="text"
                    value={editForm.localizacion || ""}
                    onChange={e => setEditForm({ ...editForm, localizacion: e.target.value })}
                    className="corte-modal-row-full corte-modal-localizacion"
                  />
                </div>
                <div className="corte-modal-row">
                  <label className="corte-modal-label">Imagen:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditImagen(e.target.files[0])}
                    className="corte-modal-imagen"
                  />
                </div>
                {editForm.imagen && !editImagen && (
                  <div style={{margin:'10px 0'}}>
                    <span>Imagen actual:</span>
                    <a href={editForm.imagen} target="_blank" rel="noopener noreferrer">
                      <img src={editForm.imagen} alt="Corte" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4, marginLeft: 6 }} />
                    </a>
                  </div>
                )}
                {editImagen && (
                  <div style={{ marginTop: 6 }}>Nueva imagen seleccionada</div>
                )}
                <div className="corte-modal-actions">
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

export default CortePage;