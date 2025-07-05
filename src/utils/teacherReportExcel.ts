
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';

export const formatThaiDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

export const generateTeacherExcel = (
  teachers: Teacher[],
  reportOptions: TeacherReportOptions
) => {
  const filteredTeachers = teachers
    .filter(teacher => teacher.academicYear === reportOptions.academicYear)
    .sort((a, b) => {
      const aNum = parseInt(a.positionNumber) || 0;
      const bNum = parseInt(b.positionNumber) || 0;
      return aNum - bNum;
    });

  // Enhanced black borders for all cells
  const borderAll = { 
    top: { style: "thin", color: { rgb: "000000" } }, 
    bottom: { style: "thin", color: { rgb: "000000" } }, 
    left: { style: "thin", color: { rgb: "000000" } }, 
    right: { style: "thin", color: { rgb: "000000" } } 
  };
  
  const titleStyle = { font: { name: 'Sarabun', sz: 14, bold: true }, alignment: { horizontal: "center", vertical: "center" } };
  const subtitleStyle = { font: { name: 'Sarabun', sz: 12 }, alignment: { horizontal: "center", vertical: "center" } };
  const tableHeaderStyle = { font: { name: 'Sarabun', sz: 11, bold: true }, border: borderAll, alignment: { horizontal: "center", vertical: "center" }, fill: { fgColor: { rgb: "F3F4F6" } } };
  const cellStyle = { font: { name: 'Sarabun', sz: 11 }, border: borderAll };
  const cellCenterStyle = { ...cellStyle, alignment: { horizontal: "center" } };

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Report Headers
  const headerContent = [
    [reportOptions.reportType === '1' 
      ? 'รายชื่อข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล' 
      : 'แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล'
    ],
    [`ปีการศึกษา ${reportOptions.academicYear}`],
  ];
  if (reportOptions.showDate && reportOptions.selectedDate) {
    headerContent.push([`วันที่ ${formatThaiDate(reportOptions.selectedDate)}`]);
  }
  
  XLSX.utils.sheet_add_aoa(ws, headerContent, { origin: 'A1' });
  if (ws['A1']) ws['A1'].s = titleStyle;
  if (ws['A2']) ws['A2'].s = subtitleStyle;
  if (ws['A3']) ws['A3'].s = subtitleStyle;

  // Table Columns
  const baseColumns = ['ลำดับที่', 'ชื่อ - นามสกุล'];
  const additionalColumns = [];
  if (reportOptions.additionalFields.position) additionalColumns.push('ตำแหน่ง');
  if (reportOptions.additionalFields.email) additionalColumns.push('Email');
  if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประชาชน');
  if (reportOptions.additionalFields.salary) additionalColumns.push('เงินเดือน');
  if (reportOptions.additionalFields.birthDate) additionalColumns.push('วันเกิด');
  if (reportOptions.additionalFields.appointmentDate) additionalColumns.push('วันบรรจุ');
  if (reportOptions.additionalFields.education) additionalColumns.push('วุฒิการศึกษา');
  if (reportOptions.additionalFields.major) additionalColumns.push('วิชาเอก');
  if (reportOptions.additionalFields.phone) additionalColumns.push('โทร');
  if (reportOptions.additionalFields.lineId) additionalColumns.push('ID Line');
  if (reportOptions.additionalFields.signature) additionalColumns.push('ลายมือชื่อ');
  if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลามา');
  if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลากลับ');
  
  const customColumnCount = reportOptions.customColumns || 0;
  const customColumns = Array.from({ length: customColumnCount }, () => 'AAAAAA');
  
  const noteColumn: string[] = [];
  if (reportOptions.additionalFields.note) {
    noteColumn.push('หมายเหตุ');
  }

  const allColumns = [...baseColumns, ...additionalColumns, ...customColumns, ...noteColumn];

  // Table Header
  const tableStartRow = headerContent.length + 2;
  XLSX.utils.sheet_add_aoa(ws, [allColumns], { origin: `A${tableStartRow}` });
  allColumns.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: tableStartRow - 1 });
    if(ws[cellRef]) ws[cellRef].s = tableHeaderStyle;
  });

  // Table Data
  const tableData = filteredTeachers.map((teacher, index) => {
    const row: (string|number)[] = [
      index + 1,
      `${teacher.firstName} ${teacher.lastName}`,
    ];
    if (reportOptions.additionalFields.position) row.push(teacher.position);
    if (reportOptions.additionalFields.email) row.push(teacher.email || '');
    if (reportOptions.additionalFields.citizenId) row.push(teacher.citizenId);
    if (reportOptions.additionalFields.salary) row.push(teacher.salary || '');
    if (reportOptions.additionalFields.birthDate) row.push(formatThaiDate(teacher.birthDate));
    if (reportOptions.additionalFields.appointmentDate) row.push(formatThaiDate(teacher.appointmentDate));
    if (reportOptions.additionalFields.education) row.push(teacher.education || '');
    if (reportOptions.additionalFields.major) row.push(teacher.majorSubject || '');
    if (reportOptions.additionalFields.phone) row.push(teacher.phone || '');
    if (reportOptions.additionalFields.lineId) row.push(teacher.lineId || '');
    if (reportOptions.additionalFields.signature) row.push('');
    if (reportOptions.additionalFields.timeIn) row.push('');
    if (reportOptions.additionalFields.timeOut) row.push('');
    
    for (let i = 0; i < customColumnCount; i++) { row.push(''); }

    if (reportOptions.additionalFields.note) { row.push(''); }

    return row;
  });
  
  const tableDataStartRow = tableStartRow + 1;
  XLSX.utils.sheet_add_aoa(ws, tableData, { origin: `A${tableDataStartRow}` });

  // Center-aligned columns
  const centeredColumns = ['ลำดับที่', 'เลขบัตรประชาชน', 'เงินเดือน', 'วันเกิด', 'วันบรรจุ', 'โทร', 'ID Line'];
  const centeredColIndices = allColumns.map((col, i) => centeredColumns.includes(col) ? i : -1).filter(i => i !== -1);
  
  // Apply styles to table data
  tableData.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: tableDataStartRow - 1 + rowIndex });
      if (ws[cellRef]) {
        ws[cellRef].s = centeredColIndices.includes(colIndex) ? cellCenterStyle : cellStyle;
      }
    });
  });

  // Merges
  const merges = [];
  for(let i = 0; i < headerContent.length; i++) {
    merges.push({ s: { r: i, c: 0 }, e: { r: i, c: allColumns.length - 1 } });
  }
  ws['!merges'] = merges;
  
  // Optimized Column Widths with better proportions
  const customColumnWidth = Math.max(18, customColumnCount > 0 ? Math.max(18, 72 / Math.min(customColumnCount, 4)) : 18);
  
  let nameColumnWidth: number;
  
  if (customColumnCount === 0) {
    nameColumnWidth = 22; // Reduced from 24
  } else if (customColumnCount <= 2) {
    nameColumnWidth = 16; // Reduced from 18  
  } else if (customColumnCount <= 4) {
    nameColumnWidth = 14; // Reduced from 16
  } else {
    nameColumnWidth = 12; // Reduced from 14
  }
  
  const colWidths = [
    { wch: 6 }, // ลำดับที่ - more compact
    { wch: nameColumnWidth } // ชื่อ - นามสกุล (reduced width)
  ];
  
  // Reduced widths for other columns to make room for custom columns
  if (reportOptions.additionalFields.position) colWidths.push({ wch: 16 }); // Reduced from 20
  if (reportOptions.additionalFields.email) colWidths.push({ wch: 20 }); // Reduced from 24
  if (reportOptions.additionalFields.citizenId) colWidths.push({ wch: 15 }); // Reduced from 18
  if (reportOptions.additionalFields.salary) colWidths.push({ wch: 12 }); // Reduced from 14
  if (reportOptions.additionalFields.birthDate) colWidths.push({ wch: 16 }); // Reduced from 20
  if (reportOptions.additionalFields.appointmentDate) colWidths.push({ wch: 16 }); // Reduced from 20
  if (reportOptions.additionalFields.education) colWidths.push({ wch: 16 }); // Reduced from 20
  if (reportOptions.additionalFields.major) colWidths.push({ wch: 16 }); // Reduced from 20
  if (reportOptions.additionalFields.phone) colWidths.push({ wch: 12 }); // Reduced from 14
  if (reportOptions.additionalFields.lineId) colWidths.push({ wch: 12 }); // Reduced from 14
  if (reportOptions.additionalFields.signature) colWidths.push({ wch: 15 }); // Reduced from 18
  if (reportOptions.additionalFields.timeIn) colWidths.push({ wch: 12 }); // Reduced from 14
  if (reportOptions.additionalFields.timeOut) colWidths.push({ wch: 12 }); // Reduced from 14

  // Custom columns with enhanced width (at least 18 units ≈ 1.25 inches)
  for (let i = 0; i < customColumnCount; i++) {
    colWidths.push({ wch: customColumnWidth });
  }

  if (reportOptions.additionalFields.note) colWidths.push({ wch: 20 }); // Reduced from 24
  
  ws['!cols'] = colWidths;

  // Row heights
  const rowHeights = [{ hpt: 24 }, { hpt: 18 }];
  if (reportOptions.showDate && reportOptions.selectedDate) rowHeights.push({ hpt: 18 });
  ws['!rows'] = rowHeights;

  // Generate file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงานข้อมูลครู');
  const wbbuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([new Uint8Array(wbbuf)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `teacher-report-${Date.now()}.xlsx`);
};
