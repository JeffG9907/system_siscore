import jsPDF from "jspdf";
import logo from "../assets/logo.png";

/**
 * Descarga imagen desde una URL y la convierte a base64.
 */
async function getImageBase64(url) {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Genera un PDF profesional de novedad/incidencia con formato informe textual, logo, título centrado, campos con negrita, y espacio.
 * Si hay imagen de incidencia la muestra, si no, muestra texto.
 * @param {Object} incidencia
 * @param {string} [nombreArchivo]
 */
export async function generarPDFIncidencia(incidencia, nombreArchivo = "Incidencia.pdf") {
  const doc = new jsPDF();

  // Logo encabezado
  doc.addImage(logo, "PNG", 15, 6, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 78, 103);
  doc.setFontSize(15);
  doc.text("José Luis Fariño V", 60, 15);
  doc.setFontSize(9);
  doc.text("RUC: 0916736523001", 60, 20);
  doc.text("josefarino27306@hotmail.com", 60, 25);
  doc.text("0992647600", 60, 30);
  doc.text("Guayaquil - Ecuador", 60, 35);

  // Línea separadora
  doc.setDrawColor(16, 78, 103);
  doc.setLineWidth(0.6);
  doc.line(15, 36, 195, 36);

  // Título principal centrado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(40, 70, 134);
  const pageWidth = doc.internal.pageSize.getWidth();
  const title = "REPORTE DE NOVEDADES E INCIDENCIAS";
  doc.text(title, pageWidth / 2, 50, { align: "center" });

  // Fecha de reporte a la derecha del título
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  const fechaReporte = incidencia.fecha
    ? new Date(incidencia.fecha).toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" })
    : "";
  doc.text(`Fecha de reporte: ${fechaReporte}`, pageWidth - 15, 58, { align: "right" });

  // --- Sección 1: Datos generales ---
  let y = 75; // Espacio después del título y fecha
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("1. Datos generales", 15, y);

  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cuenta:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${incidencia.cuenta || "-"}`, 50, y);

  y += 9;
  doc.setFont("helvetica", "bold");
  doc.text("Medidor:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${incidencia.medidor || "-"}`, 50, y);

  y += 9;
  doc.setFont("helvetica", "bold");
  doc.text("Cuadrilla responsable:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${incidencia.operador || "-"}`, 70, y);

  // --- Sección 2: Descripción de la novedad ---
  y += 16; // Espacio entre secciones
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("2. Descripción de la novedad", 15, y);

  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Tipo de novedad:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${incidencia.novedad || "-"}`, 60, y);

  y += 9;
  doc.setFont("helvetica", "bold");
  doc.text("Fecha:", 20, y);
  doc.setFont("helvetica", "normal");
  let fechaHora = incidencia.fecha
    ? new Date(incidencia.fecha).toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "-";
  if (incidencia.hora) fechaHora += ` – ${incidencia.hora}`;
  doc.text(`${fechaHora}`, 50, y);

  y += 9;
  doc.setFont("helvetica", "bold");
  doc.text("Observaciones registradas:", 20, y);
  doc.setFont("helvetica", "normal");
  const obs = `${incidencia.observaciones || "-"}`;
  const obsLines = doc.splitTextToSize(obs, 170);
  doc.text(obsLines, 20, y + 6);
  y += 6 + (obsLines.length - 1) * 6;

  // --- Sección 3: Evidencia ---
  y += 16; // Espacio entre secciones
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("3. Evidencia", 15, y);

  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Se adjunta registro fotográfico como soporte de la incidencia.", 20, y);

  // Imagen de la incidencia (si existe)
  const Y_IMG = y + 12;
  let imagenAgregada = false;
  if (incidencia.imagenUrl) {
    const b64 = await getImageBase64(incidencia.imagenUrl);
    if (b64) {
      // Fondo para la imagen
      doc.setFillColor(240, 240, 240);
      doc.rect(60, Y_IMG, 90, 55, "F");
      doc.addImage(b64, "JPEG", 65, Y_IMG + 5, 80, 45);
      imagenAgregada = true;
    }
  }

  if (!imagenAgregada) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.text("Sin imagen adjunta o imagen no accesible", 20, Y_IMG + 70);
  }

  // --- Footer ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "SISCORE EC | Todos los derechos reservados",
    15,
    doc.internal.pageSize.height - 10
  );

  doc.save(nombreArchivo);
}