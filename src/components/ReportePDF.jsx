import React from "react";
import { generarPDF } from "../utils/pdfGenerator";
import { FaFilePdf } from "react-icons/fa";

const ReportePDF = ({ datos, tipo, rango }) => {
  let nombreArchivo = "Reporte.pdf";

  if (tipo === "cortes" && rango?.fecha)
    nombreArchivo = `REPORTE: Cortes_Diarios_${rango.fecha}.pdf`;
  else if (tipo === "cortes" && rango?.start && rango?.end)
    nombreArchivo = `REPORTE: Cortes_Mensuales_${rango.start}_a_${rango.end}.pdf`;
  else if (tipo === "reconexiones" && rango?.fecha)
    nombreArchivo = `reconexiones_diarias_${rango.fecha}.pdf`;
  else if (tipo === "reconexiones" && rango?.start && rango?.end)
    nombreArchivo = `REPORTE: Reconexiones_Mensuales_${rango.start}_a_${rango.end}.pdf`;
  else if (tipo === "tendencia" && rango?.start && rango?.end)
    nombreArchivo = `REPORTE: Cortes&Reconexiones_Mensuales_${rango.start}_a_${rango.end}.pdf`;

  const handleGenerarPDF = () => {
    
    // Para tendencia, puedes imprimir los datos para verificar que tengan los detalles si lo deseas
    if (tipo === "tendencia" && rango?.start && rango?.end) {
      console.log("Datos tendencia para PDF:", datos);
    }
    console.log(datos);
    generarPDF(datos, tipo, rango, nombreArchivo);
  };

  return (
    <button className="pdf-btn" onClick={handleGenerarPDF}>
      <FaFilePdf className="icon-pdf" />
      Generar Reporte
    </button>
  );
};

export default ReportePDF;