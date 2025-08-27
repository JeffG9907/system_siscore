import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/Dashboard.css";

// Utilidad para mostrar fecha en formato DD/MM/YYYY
function toDisplayFormat(fecha) {
  if (!fecha) return '';
  const [y, m, d] = fecha.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// Utilidad para obtener la fecha actual en formato YYYY-MM-DD (igual que CortePage)
function getTodayISO() {
  const now = new Date();
  const utcMinus5 = new Date(now.getTime() - (now.getTimezoneOffset() + 300) * 60000);
  return utcMinus5.toISOString().slice(0, 10);
}

const DashboardCortesReconecciones = () => {
  const [startDate, setStartDate] = useState(getTodayISO());
  const [endDate, setEndDate] = useState(getTodayISO());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setData([]); // Limpiar datos antes de cargar nuevos
    fetch(`https://backend-apiemail.up.railway.app/api/dashboard/cortes-reconexiones?start=${startDate}&end=${endDate}`)
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setData([]);
        }
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // Formatear fechas para etiquetas del gráfico (DD/MM/YYYY)
  const labels = data.map(d => toDisplayFormat(d.fecha));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cortes",
        data: data.map(d => d.cortes),
        backgroundColor: "#ff5757",
      },
      {
        label: "Reconexiones",
        data: data.map(d => d.reconexiones),
        backgroundColor: "#4fc3f7",
      }
    ]
  };

  return (
    <div className="dashboard-cortes-reconecciones">
      <h1 className="dashboard-title">
        Tendencia diaria: Cortes vs Reconexiones
      </h1>
      <div className="dashboard-filtros">
        {/* Filtros verticales en móvil, horizontales en desktop */}
        <div className="filtro-fecha">
          <label htmlFor="fecha-desde">Desde:</label>
          <input
            id="fecha-desde"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="filtro-fecha">
          <label htmlFor="fecha-hasta">Hasta:</label>
          <input
            id="fecha-hasta"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="chart-container">
        {loading ? (
          <div style={{margin:"auto", color:"#274886"}}>Cargando...</div>
        ) : (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: { display: false }
              },
              layout: { padding: 0 },
              scales: {
                x: { ticks: { font: { size: 10 } } },
                y: { beginAtZero: true, ticks: { font: { size: 10 } } }
              }
            }}
          />
        )}
        {(!loading && data.length === 0 && startDate && endDate) && (
          <div style={{ color: "#888", marginTop: "0.7rem", fontSize: "0.97rem", textAlign:"center" }}>
            No hay datos para este rango de fechas.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCortesReconecciones;