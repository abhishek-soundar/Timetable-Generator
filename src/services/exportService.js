// src/utils/exportService.js

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf'; // ESM-compatible import
import * as XLSX from 'xlsx';

export const exportToPDF = (tableId) => {
  const input = document.getElementById(tableId);

  const actions = document.querySelectorAll('.actions, .print-only-hide');
  actions.forEach(btn => btn.style.display = 'none');

  setTimeout(() => {
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Timetable_${new Date().toISOString().slice(0, 10)}.pdf`);

      actions.forEach(btn => btn.style.display = '');
    });
  }, 500);
};

export const exportToExcel = (timetable, periods, semester, section) => {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const worksheetData = [
    ['Day', ...periods.map(p => p.name)],
    ...DAYS.map((day, dayIndex) => [
      day,
      ...timetable[dayIndex].map(slot => slot?.name || '—')
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, `${semester}_${section}`);
  XLSX.writeFile(wb, `Timetable_${semester}_${section}.xlsx`);
};