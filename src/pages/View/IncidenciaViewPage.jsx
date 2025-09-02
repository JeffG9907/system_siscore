import React, { useState, useEffect } from "react";
import "../../styles/IncidenciasPage.css";
import { generarPDFIncidencia } from "../../utils/generarReporteIncidencias";
import { FaFilePdf } from "react-icons/fa";

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

const API_HOST = "https://backend-apiemail.up.railway.app";

const IncidenciaViewPage = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleGenerarPDF = async (item) => {
    const imagenUrl = item.imagenUrl || "";
    await generarPDFIncidencia({ ...item, imagenUrl }, `incidencia_${item.cuenta}_${item.fecha}.pdf`);
  };

  const incidenciasFiltradas = incidencias.filter(i =>
    busqueda.trim() === ""
      ? true
      : i.cuenta.toLowerCase().includes(busqueda.toLowerCase()) ||
        i.medidor.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="incidencia-main-container">
      <h1 className="incidencia-title">Visualización de Novedades e Incidencias</h1>
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
              <th>PDF</th>
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
                  <button onClick={() => handleGenerarPDF(item)} className="btn-pdf" title="PDF">
                    <FaFilePdf />
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
    </div>
  );
};

export default IncidenciaViewPage;