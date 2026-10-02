const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');

class ReportesService {
  /**
   * Genera un archivo Excel profesional a partir de columnas y filas
   */
  static async generarExcel({ res, nombreHoja, titulo, columnas, datos, nombreArchivo }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(nombreHoja);

    // 1. Título institucional
    worksheet.mergeCells('A1', `${String.fromCharCode(64 + columnas.length)}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `CLÍNICA META S.A. — ${titulo.toUpperCase()}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004085' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 35;

    // 2. Subtítulo con fecha de generación
    worksheet.mergeCells('A2', `${String.fromCharCode(64 + columnas.length)}2`);
    const subTitleCell = worksheet.getCell('A2');
    subTitleCell.value = `Reporte generado el: ${new Date().toLocaleString('es-CO')}`;
    subTitleCell.font = { name: 'Arial', size: 10, italic: true };
    subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 20;

    worksheet.addRow([]); // Fila vacía

    // 3. Encabezados de Tabla
    const headerRow = worksheet.addRow(columnas.map(col => col.header));
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D6EFD' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // 4. Agregar datos de filas
    datos.forEach((item, index) => {
      const rowValues = columnas.map(col => item[col.key] || '');
      const row = worksheet.addRow(rowValues);
      row.height = 20;

      // Color intercalado de filas
      const bgColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA';
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFDEE2E6' } },
          left: { style: 'thin', color: { argb: 'FFDEE2E6' } },
          bottom: { style: 'thin', color: { argb: 'FFDEE2E6' } },
          right: { style: 'thin', color: { argb: 'FFDEE2E6' } }
        };
      });
    });

    // 5. Ajuste automático del ancho de las columnas
    columnas.forEach((col, idx) => {
      const column = worksheet.getColumn(idx + 1);
      let maxLen = col.header.length;
      datos.forEach(row => {
        const val = row[col.key] ? String(row[col.key]) : '';
        if (val.length > maxLen) maxLen = val.length;
      });
      column.width = Math.min(Math.max(maxLen + 4, col.width || 15), 40);
    });

    // Configurar cabeceras de respuesta HTTP
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Genera un archivo PDF profesional con membrete corporativo y tabla
   */
  static async generarPDF({ res, titulo, headers, rows, nombreArchivo, orientacion = 'portrait' }) {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: orientacion });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.pdf"`);

    doc.pipe(res);

    // Encabezado Corporativo
    doc.fillColor('#004085').fontSize(16).text('CLÍNICA META S.A.', { align: 'center' });
    doc.fillColor('#333333').fontSize(12).text(titulo.toUpperCase(), { align: 'center' });
    doc.fontSize(9).fillColor('#666666').text(`Fecha de emisión: ${new Date().toLocaleString('es-CO')}`, { align: 'center' });
    doc.moveDown(1.5);

    // Construcción de Tabla
    const table = {
      title: "",
      headers: headers.map(h => ({ label: h.label, property: h.property, width: h.width })),
      rows: rows
    };

    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9).fillColor('#004085'),
      prepareRow: (row, i, label, rect, col) => {
        doc.font('Helvetica').fontSize(8).fillColor('#333333');
      }
    });

    doc.end();
  }
}

module.exports = ReportesService;