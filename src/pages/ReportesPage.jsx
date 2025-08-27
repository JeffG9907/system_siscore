import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import ReportePDF from "../components/ReportePDF";
import "../styles/ReportesPage.css";

// Auxiliares para fechas
function getTodayISO() {
  const now = new Date();
  const utcMinus5 = new Date(now.getTime() - (now.getTimezoneOffset() + 300) * 60000);
  return utcMinus5.toISOString().slice(0, 10);
}
function toDisplayFormat(fecha) {
  if (!fecha) return "";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

const REPORT_TYPES = [
  { value: "cortes", label: "Cortes" },
  { value: "reconexiones", label: "Reconexiones" },
  { value: "tendencia", label: "Tendencia: Cortes vs Reconexiones" },
];

const FILTER_TYPES = [
  { value: "diario", label: "Diario" },
  { value: "mensual", label: "Mensual" },
];

const ReportesPage = () => {
  const [reportType, setReportType] = useState("cortes");
  const [filterType, setFilterType] = useState("diario");
  const [fecha, setFecha] = useState(getTodayISO());
  const [fechaInicio, setFechaInicio] = useState(getTodayISO());
  const [fechaFin, setFechaFin] = useState(getTodayISO());
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let url = "";
    if (reportType === "cortes" || reportType === "reconexiones") {
      if (filterType === "diario") {
        url = `https://backend-apiemail.up.railway.app/api/${reportType}?fecha=${fecha}`;
      } else if (filterType === "mensual") {
        url = `https://backend-apiemail.up.railway.app/api/${reportType}?start=${fechaInicio}&end=${fechaFin}`;
      }
    } else if (reportType === "tendencia") {
      url = `https://backend-apiemail.up.railway.app/api/reportes/cortes-reconexiones?start=${fechaInicio}&end=${fechaFin}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(json => setDatos(Array.isArray(json) ? json : []))
      .catch(() => setDatos([]))
      .finally(() => setLoading(false));
  }, [reportType, filterType, fecha, fechaInicio, fechaFin]);

  const columns = reportType === "cortes" || reportType === "reconexiones"
    ? ["#", "Número de cuenta", "Medidor", "Fecha"]
    : ["Fecha", "Cortes", "Reconexiones"];

  const chartData = reportType === "tendencia" ? {
    labels: datos.map(d => toDisplayFormat(d.fecha)),
    datasets: [
      {
        label: "Cortes",
        data: datos.map(d => d.cortes),
        backgroundColor: "#ff5757",
      },
      {
        label: "Reconexiones",
        data: datos.map(d => d.reconexiones),
        backgroundColor: "#4fc3f7",
      }
    ]
  } : null;

  let rangoPDF = {};
  if (reportType === "tendencia" || (filterType === "mensual"))
    rangoPDF = { start: fechaInicio, end: fechaFin };
  else
    rangoPDF = { fecha };

  return (
    <div className="reportes-main-container">
      <h1 className="reportes-title">Reportes</h1>
      <div className="reportes-card">
        <div className="reportes-form-box">
          <div className="reportes-form-row">
            <div className="reportes-label-group">
              <label htmlFor="tipo-reporte">Tipo de reporte:</label>
              <select
                id="tipo-reporte"
                value={reportType}
                onChange={e => {
                  setReportType(e.target.value);
                  if (e.target.value === "tendencia") setFilterType("mensual");
                  else setFilterType("diario");
                }}
                className="reportes-input-select"
              >
                {REPORT_TYPES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {(reportType === "cortes" || reportType === "reconexiones") && (
              <div className="reportes-label-group">
                <label htmlFor="filtro-reporte">Filtro:</label>
                <select
                  id="filtro-reporte"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="reportes-input-select"
                >
                  {FILTER_TYPES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            )}
            {(reportType === "cortes" || reportType === "reconexiones") && filterType === "diario" && (
              <div className="reportes-label-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="reportes-input-date"
                />
              </div>
            )}
            {((reportType === "cortes" || reportType === "reconexiones") && filterType === "mensual") && (
              <>
                <div className="reportes-label-group">
                  <label>Desde:</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={e => setFechaInicio(e.target.value)}
                    className="reportes-input-date"
                  />
                </div>
                <div className="reportes-label-group">
                  <label>Hasta:</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={e => setFechaFin(e.target.value)}
                    className="reportes-input-date"
                  />
                </div>
              </>
            )}
            {reportType === "tendencia" && (
              <>
                <div className="reportes-label-group">
                  <label>Desde:</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={e => setFechaInicio(e.target.value)}
                    className="reportes-input-date"
                  />
                </div>
                <div className="reportes-label-group">
                  <label>Hasta:</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={e => setFechaFin(e.target.value)}
                    className="reportes-input-date"
                  />
                </div>
              </>
            )}
          </div>
          <div className="reportes-form-row" style={{ justifyContent: "center" }}>
            <ReportePDF
              datos={datos}
              tipo={reportType}
              rango={rangoPDF}
            />
          </div>
        </div>
        {loading ? (
          <div className="reportes-loader">Cargando datos...</div>
        ) : reportType === "tendencia" ? (
          <div className="reportes-chart-wrapper">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: { display: false }
                }
              }}
              height={350}
            />
            {datos.length === 0 && (
              <div className="reportes-empty">No hay datos para este rango de fechas.</div>
            )}
          </div>
        ) : (
          <div className="reportes-table-wrapper">
            <table className="reportes-table">
              <thead>
                <tr>
                  {columns.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(datos) ? datos : []).map((item, idx) => (
                  <tr key={(item.id_cuenta ?? item.fecha ?? idx) + "-" + idx}>
                    {reportType === "cortes" || reportType === "reconexiones" ? (
                      <>
                        <td>{idx + 1}</td>
                        <td>{item.id_cuenta}</td>
                        <td>{item.id_medidor}</td>
                        <td>{item.fecha ? toDisplayFormat(item.fecha.slice(0, 10)) : ""}</td>
                      </>
                    ) : (
                      <>
                        <td>{toDisplayFormat(item.fecha)}</td>
                        <td>{item.cortes}</td>
                        <td>{item.reconexiones}</td>
                      </>
                    )}
                  </tr>
                ))}
                {(Array.isArray(datos) && datos.length === 0) && (
                  <tr>
                    <td colSpan={columns.length} className="reportes-table-empty">
                      No hay datos para la fecha/rango seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesPage;