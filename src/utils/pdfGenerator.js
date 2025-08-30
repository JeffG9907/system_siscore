import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

export function generarPDF(datos, tipo, rango, nombreArchivo = "Reporte.pdf") {
  const img = new window.Image();
  img.src = logo;

  img.onload = () => {
    // Agrupar datos por fecha si es cortes/reconexiones mensual/rango
    let grouped = {};
    if ((tipo === "cortes" || tipo === "reconexiones") && rango.start && rango.end) {
      datos.forEach(d => {
        const fecha = d.fecha?.slice(0, 10) || "";
        if (!grouped[fecha]) grouped[fecha] = [];
        grouped[fecha].push(d);
      });
    }

    const doc = new jsPDF();

    // === 1. Hoja de informe mensual/resumen ===
    if ((tipo === "cortes" || tipo === "reconexiones") && rango.start && rango.end) {
      // Logo y encabezado
      doc.addImage(img, "PNG", 15, 2, 28, 28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 78, 103);
      doc.setFontSize(15);
      doc.text("José Luis Fariño V", 60, 10);
      doc.setFontSize(9);
      doc.text("RUC: 0916736523001", 60, 15);
      doc.text("josefarino27306@hotmail.com", 60, 20);
      doc.text("0992647600", 60, 25);
      doc.text("Guayaquil - Ecuador", 60, 30);
      doc.setDrawColor(16, 78, 103);
      doc.setLineWidth(0.7);
      doc.line(15, 32, 195, 32);

      doc.setFontSize(17);
      doc.setTextColor(40, 70, 134);
      doc.text(
        tipo === "cortes" ? "INFORME MENSUAL DE CORTES" : "INFORME MENSUAL DE RECONEXIONES",
        40,
        45
      );
      doc.setFontSize(12);
      doc.setTextColor(90, 90, 90);
      doc.text(`Rango: ${rango.start} a ${rango.end}`, 15, 59);

      // Totales generales
      const totalRegistros = datos.length;
      const dias = Object.keys(grouped).length;
      // ORDENAR las fechas por orden cronológico
      const registrosPorDia = Object.keys(grouped)
        .sort((a, b) => new Date(a) - new Date(b))
        .map(fecha => ({
          fecha,
          cantidad: grouped[fecha].length
        }));

      doc.setFontSize(11);
      doc.setTextColor(40, 70, 134);
      doc.text(`Total días con registros: ${dias}`, 15, 70);
      doc.text(`Total registros en el mes: ${totalRegistros}`, 15, 78);

      // Tabla de totales por día
      autoTable(doc, {
        startY: 85,
        head: [["Fecha", "Total registros"]],
        body: registrosPorDia.map(r => [r.fecha, r.cantidad]),
        theme: "grid",
        headStyles: {
          fillColor: [40, 70, 134],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [240, 247, 250] },
        margin: { left: 15, right: 15 },
        styles: { cellPadding: 2, halign: "center" },
      });

      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(
        "SISCORE EC - Todos los derechos reservados",
        15,
        doc.internal.pageSize.height - 10
      );

      // === 2. Hojas diarias ===
      // ORDENAR las fechas por orden cronológico
      const fechas = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
      fechas.forEach((fecha, idx) => {
        doc.addPage();

        // Logo y encabezado
        doc.addImage(img, "PNG", 15, 2, 28, 28);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 78, 103);
        doc.setFontSize(15);
        doc.text("José Luis Fariño V", 60, 10);
        doc.setFontSize(9);
        doc.text("RUC: 0916736523001", 60, 15);
        doc.text("josefarino27306@hotmail.com", 60, 20);
        doc.text("0992647600", 60, 25);
        doc.text("Guayaquil - Ecuador", 60, 30);
        doc.setDrawColor(16, 78, 103);
        doc.setLineWidth(0.7);
        doc.line(15, 32, 195, 32);

        doc.setFontSize(15);
        doc.setTextColor(40, 70, 134);
        doc.text(
          tipo === "cortes" ? "REPORTE DE CORTES" : "REPORTE DE RECONEXIONES",
          75,
          45
        );
        doc.setFontSize(12);
        doc.setTextColor(90, 90, 90);
        doc.text(`Fecha: ${fecha}`, 15, 59);

        // TOTAL DE REGISTROS DEL DÍA
        doc.setFontSize(11);
        doc.setTextColor(40, 70, 134);
        doc.text(
          `Total registros: ${grouped[fecha].length}`,
          15,
          66
        );

        // Tabla
        autoTable(doc, {
          startY: 75,
          head: [["Número de cuenta", "Medidor"]],
          body: grouped[fecha].map(d => [
            d.id_cuenta,
            d.id_medidor,
          ]),
          theme: "grid",
          headStyles: {
            fillColor: [40, 70, 134],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 10 },
          alternateRowStyles: { fillColor: [240, 247, 250] },
          margin: { left: 15, right: 15 },
          styles: { cellPadding: 2, halign: "center" },
        });

        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(
          "SISCORE EC - Todos los derechos reservados",
          15,
          doc.internal.pageSize.height - 10
        );
      });
    }
    // ============ MODIFICACIÓN PARA TENDENCIA =============
    else if (tipo === "tendencia" && rango.start && rango.end) {
      // 1. Hoja resumen de tendencia
      doc.addImage(img, "PNG", 15, 2, 28, 28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 78, 103);
      doc.setFontSize(15);
      doc.text("José Luis Fariño V", 60, 10);
      doc.setFontSize(9);
      doc.text("RUC: 0916736523001", 60, 15);
      doc.text("josefarino27306@hotmail.com", 60, 20);
      doc.text("0992647600", 60, 25);
      doc.text("Guayaquil - Ecuador", 60, 30);
      doc.setDrawColor(16, 78, 103);
      doc.setLineWidth(0.7);
      doc.line(15, 32, 195, 32);

      doc.setFontSize(15);
      doc.setTextColor(40, 70, 134);
      doc.text("INFORME DE CORTES Y RECONEXIONES", 55, 45);
      doc.setFontSize(12);
      doc.setTextColor(90, 90, 90);
      doc.text(`Rango: ${rango.start} a ${rango.end}`, 15, 59);

      // Totales generales
      const totalCortes = datos.reduce((sum, d) => sum + (Number(d.cortes) || 0), 0);
      const totalReconexiones = datos.reduce((sum, d) => sum + (Number(d.reconexiones) || 0), 0);

      doc.setFontSize(11);
      doc.setTextColor(40, 70, 134);
      doc.text(`Total cortes: ${totalCortes}    Total reconexiones: ${totalReconexiones}`, 15, 70);

      // Tabla de totales por día (ordenar por fecha)
      autoTable(doc, {
        startY: 78,
        head: [["Fecha", "Cortes", "Reconexiones"]],
        body: datos
          .slice()
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          .map(d => [
            d.fecha?.slice(0, 10) || "",
            d.cortes,
            d.reconexiones,
          ]),
        theme: "grid",
        headStyles: {
          fillColor: [40, 70, 134],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [240, 247, 250] },
        margin: { left: 15, right: 15 },
        styles: { cellPadding: 2, halign: "center" },
      });

      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text("SISCORE EC - Todos los derechos reservados", 15, doc.internal.pageSize.height - 10);

      // 2. Hojas detalladas por día (ordenar por fecha)
      datos
        .slice()
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .forEach((dia, idx) => {
          doc.addPage();

          // Logo y encabezado
          doc.addImage(img, "PNG", 15, 2, 28, 28);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(16, 78, 103);
          doc.setFontSize(15);
          doc.text("José Luis Fariño V", 60, 10);
          doc.setFontSize(9);
          doc.text("RUC: 0916736523001", 60, 15);
          doc.text("josefarino27306@hotmail.com", 60, 20);
          doc.text("0992647600", 60, 25);
          doc.text("Guayaquil - Ecuador", 60, 30);
          doc.setDrawColor(16, 78, 103);
          doc.setLineWidth(0.7);
          doc.line(15, 32, 195, 32);

          doc.setFontSize(14);
          doc.setTextColor(40, 70, 134);
          doc.text("REPORTE DIARIO", 85, 45);
          doc.setFontSize(11);
          doc.setTextColor(90, 90, 90);
          doc.text(`Fecha: ${dia.fecha?.slice(0, 10) || ""}`, 15, 59);

          // Cortes Detallados
          doc.setFontSize(12);
          doc.setTextColor(40, 70, 134);
          doc.text(`Cortes: ${dia.cortes}`, 15, 70);

          if (Array.isArray(dia.detallesCortes) && dia.detallesCortes.length > 0) {
            autoTable(doc, {
              startY: 78,
              head: [["Número de cuenta", "Medidor"]],
              body: dia.detallesCortes.map(d => [
                d.id_cuenta,
                d.id_medidor,
              ]),
              theme: "grid",
              headStyles: {
                fillColor: [255, 87, 87],
                textColor: [255, 255, 255],
                fontStyle: "bold",
              },
              bodyStyles: { fontSize: 10 },
              alternateRowStyles: { fillColor: [255, 228, 228] },
              margin: { left: 15, right: 15 },
              styles: { cellPadding: 2, halign: "center" },
            });
          }

          // Reconexiones Detalladas
          const reconexY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 78;
          doc.setFontSize(12);
          doc.setTextColor(40, 70, 134);
          doc.text(`Reconexiones: ${dia.reconexiones}`, 15, reconexY);

          if (Array.isArray(dia.detallesReconexiones) && dia.detallesReconexiones.length > 0) {
            autoTable(doc, {
              startY: reconexY + 8,
              head: [["Número de cuenta", "Medidor"]],
              body: dia.detallesReconexiones.map(d => [
                d.id_cuenta,
                d.id_medidor,
              ]),
              theme: "grid",
              headStyles: {
                fillColor: [79, 195, 247],
                textColor: [255, 255, 255],
                fontStyle: "bold",
              },
              bodyStyles: { fontSize: 10 },
              alternateRowStyles: { fillColor: [220, 240, 250] },
              margin: { left: 15, right: 15 },
              styles: { cellPadding: 2, halign: "center" },
            });
          }

          doc.setFontSize(8);
          doc.setTextColor(140, 140, 140);
          doc.text("SISCORE EC - Todos los derechos reservados", 15, doc.internal.pageSize.height - 10);
        });
    }
    // ============ FIN MODIFICACIÓN PARA TENDENCIA =============
    else {
      // Un solo reporte (diario/tendencia)
      doc.addImage(img, "PNG", 15, 2, 28, 28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 78, 103);
      doc.setFontSize(15);
      doc.text("José Luis Fariño V", 60, 10);
      doc.setFontSize(9);
      doc.text("RUC: 0916736523001", 60, 15);
      doc.text("josefarino27306@hotmail.com", 60, 20);
      doc.text("0992647600", 60, 25);
      doc.text("Guayaquil - Ecuador", 60, 30);

      doc.setDrawColor(16, 78, 103);
      doc.setLineWidth(0.7);
      doc.line(15, 32, 195, 32);

      doc.setFontSize(15);
      doc.setTextColor(40, 70, 134);
      let titulo = "";
      let subtitulo = "";
      let totales = "";

      if (tipo === "cortes") {
        titulo = "REPORTE DE CORTES";
        subtitulo = `Fecha: ${rango?.fecha || ""}`;
        totales = `Total registros: ${datos.length}`;
      } else if (tipo === "reconexiones") {
        titulo = "REPORTE DE RECONEXIONES";
        subtitulo = `Fecha: ${rango?.fecha || ""}`;
        totales = `Total registros: ${datos.length}`;
      } else {
        titulo = "REPORTE DE CORTES Y RECONEXIONES";
        subtitulo = `Rango: ${rango?.start || ""} a ${rango?.end || ""}`;
        const totalCortes = datos.reduce((sum, d) => sum + (Number(d.cortes) || 0), 0);
        const totalReconexiones = datos.reduce((sum, d) => sum + (Number(d.reconexiones) || 0), 0);
        totales = `Total cortes: ${totalCortes}    Total reconexiones: ${totalReconexiones}`;
      }

      doc.text(titulo, 75, 45);
      doc.setFontSize(12);
      doc.setTextColor(90, 90, 90);
      doc.text(subtitulo, 15, 59);

      if (totales) {
        doc.setFontSize(11);
        doc.setTextColor(40, 70, 134);
        doc.text(totales, 15, 66);
      }

      let head = [];
      let body = [];
      let tableStartY = totales ? 75 : 65;

      if (tipo === "cortes" || tipo === "reconexiones") {
        // ORDENAR por fecha si existe
        body = datos
          .slice()
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          .map((d) => [
            d.id_cuenta,
            d.id_medidor,
            d.fecha?.slice(0, 10) || "",
          ]);
        head = [["Número de cuenta", "Medidor", "Fecha"]];
      } else {
        body = datos
          .slice()
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          .map((d) => [
            d.fecha?.slice(0, 10) || "",
            d.cortes,
            d.reconexiones,
          ]);
        head = [["Fecha", "Cortes", "Reconexiones"]];
      }

      autoTable(doc, {
        startY: tableStartY,
        head,
        body,
        theme: "grid",
        headStyles: {
          fillColor: [40, 70, 134],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [240, 247, 250] },
        margin: { left: 15, right: 15 },
        styles: { cellPadding: 2, halign: "center" },
      });

      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(
        "SISCORE EC - Todos los derechos reservados",
        15,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(nombreArchivo);
  };
}