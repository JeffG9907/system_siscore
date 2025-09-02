import React, { useState, useEffect } from "react";
import "../../styles/ReconexionViewPage.css";

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

const ReconexionViewPage = () => {
  const [reconexiones, setReconexiones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

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

  return (
    <div className="reconexion-main-container">
      <div className="reconexion-card">
        <h1 className="reconexion-title">Visualización de Reconexiones</h1>
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
        {mensaje && <div className="reconexion-mensaje">{mensaje}</div>}
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
              </tr>
            </thead>
            <tbody>
              {reconexionesFiltradas.map((item, idx) => (
                <tr key={`${item.id_cuenta}-${item.id_medidor}-${item.fecha}`}>
                  <td>{idx + 1}</td>
                  <td>{item.id_cuenta}</td>
                  <td>{item.id_medidor}</td>
                  <td>{item.fecha ? toDisplayFormat(item.fecha.slice(0, 10)) : ""}</td>
                </tr>
              ))}
              {reconexionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={4} className="reconexion-table-empty">
                    No hay reconexiones encontradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReconexionViewPage;