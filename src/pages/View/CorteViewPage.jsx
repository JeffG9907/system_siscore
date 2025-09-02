import React, { useState, useEffect } from "react";
import "../../styles/CortePage.css";

// Utilidad para obtener la fecha actual en formato ISO Ecuador
function getTodayISO() {
  const now = new Date();
  const utcMinus5 = new Date(now.getTime() - (now.getTimezoneOffset() + 300) * 60000);
  return utcMinus5.toISOString().slice(0, 10);
}

const API_URL = "https://backend-apiemail.up.railway.app/api/cortes";

const CorteViewPage = () => {
  const [cortes, setCortes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => { fetchCortes(); }, []);

  const fetchCortes = async () => {
    setLoading(true);
    try {
      let url = API_URL;
      if (fechaFiltro) url += `?fecha=${fechaFiltro}`;
      const res = await fetch(url);
      const data = await res.json();
      setCortes(Array.isArray(data) ? data : []);
    } catch {
      setCortes([]);
    }
    setLoading(false);
  };

  // Buscar por cuenta
  const handleBuscarCuenta = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) { setCortes([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cuenta/${busqueda.trim()}`);
      const json = await res.json();
      setCortes(Array.isArray(json) ? json : []);
    } catch {
      setCortes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!fechaFiltro) return;
    fetchCortes();
  }, [fechaFiltro]);

  // Filtro visual local
  const cortesFiltrados = cortes.filter(i =>
    busqueda.trim() === ""
      ? true
      : String(i.id_cuenta).toLowerCase().includes(busqueda.toLowerCase()) ||
        String(i.id_medidor).toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="corte-main-container">
      <div className="corte-card">
        <h1 className="corte-title">Visualización de Cortes</h1>
        <div className="corte-form-box">
          <div className="corte-filter-row">
            <form style={{ display: 'flex', alignItems: 'center' }} onSubmit={handleBuscarCuenta} className="corte-filter">
              <label style={{ marginRight: '1.5rem' }}>
                <span>Buscar por cuenta o medidor:</span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Número de cuenta o medidor"
                  className="corte-search-input"
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
        </div>
        {mensaje && <div className="corte-mensaje">{mensaje}</div>}
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
                </tr>
              ))}
              {cortesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="corte-table-empty">
                    No hay cortes encontrados.
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

export default CorteViewPage;