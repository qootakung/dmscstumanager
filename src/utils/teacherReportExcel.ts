import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { sortTeachersByPosition } from '@/utils/teacherSortUtils';

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
    .filter(teacher => teacher.academicYear === reportOptions.academicYear);
  
  const sortedTeachers = sortTeachersByPosition(filteredTeachers);

  // Define styles with enhanced black borders
  const borderAll = { top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } }, left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } } };
  const titleStyle = { font: { name: 'Sarabun', sz: 14, bold: true }, alignment: { horizontal: "center", vertical: "center" } };
  const subtitleStyle = { font: { name: 'Sarabun', sz: 12 }, alignment: { horizontal: "center", vertical: "center" } };
  const tableHeaderStyle = { font: { name: 'Sarabun', sz: 11, bold: true }, border: borderAll, alignment: { horizontal: "center", vertical: "center" } };
  const cellStyle = { font: { name: 'Sarabun', sz: 11 }, border: borderAll };
  const cellCenterStyle = { ...cellStyle, alignment: { horizontal: "center" } };

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([]);

  // Report Headers
  const headerRows: string[][] = [];
  
  // บรรทัดที่ 1: ชื่อรายงาน
  if (reportOptions.reportType === '1') {
    headerRows.push(['รายชื่อข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล']);
  } else if (reportOptions.reportType === '2') {
    headerRows.push(['แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล']);
  } else if (reportOptions.reportType === '3') {
    headerRows.push([reportOptions.customTitle1 || 'แบบลงทะเบียน']);
  }
  
  // บรรทัดที่ 2: customTitle2 (เฉพาะ reportType 3)
  if (reportOptions.reportType === '3' && reportOptions.customTitle2) {
    headerRows.push([reportOptions.customTitle2]);
  }
  
  // บรรทัดถัดไป: ปีการศึกษา
  headerRows.push([`ปีการศึกษา ${reportOptions.academicYear}`]);
  
  // บรรทัดถัดไป: วันที่ (ถ้ามี)
  if (reportOptions.showDate && reportOptions.selectedDate) {
    headerRows.push([`วันที่ ${formatThaiDate(reportOptions.selectedDate)}`]);
  }
  
  XLSX.utils.sheet_add_aoa(ws, headerRows, { origin: 'A1' });
  
  // จัดรูปแบบ header
  if (ws['A1']) ws['A1'].s = titleStyle;
  let rowIndex = 2;
  if (reportOptions.reportType === '3' && reportOptions.customTitle2) {
    if (ws['A2']) ws['A2'].s = subtitleStyle;
    rowIndex = 3;
  }
  if (ws[`A${rowIndex}`]) ws[`A${rowIndex}`].s = subtitleStyle;
  if (reportOptions.showDate && reportOptions.selectedDate) {
    if (ws[`A${rowIndex + 1}`]) ws[`A${rowIndex + 1}`].s = subtitleStyle;
  }

  // Table Columns
  const baseColumns = ['ลำดับที่', 'ชื่อ - นามสกุล'];
  
  // แมป field name กับชื่อคอลัมน์
  const fieldColumnMap: Record<string, string> = {
    position: 'ตำแหน่ง',
    email: 'Email',
    citizenId: 'เลขบัตรประจำตัวประชาชน',
    salary: 'เงินเดือน',
    birthDate: 'วัน/เดือน/ปีเกิด',
    appointmentDate: 'วันที่บรรจุ',
    education: 'วุฒิการศึกษา',
    major: 'วิชาเอก',
    phone: 'เบอร์โทร',
    lineId: 'ID Line',
    scoutLevel: 'วุฒิทางลูกเสือ',
    signature: 'ลายมือชื่อ',
    signature2: 'ลายมือชื่อ',
    timeIn: 'เวลามา',
    timeOut: 'เวลากลับ',
  };

  // สร้างคอลัมน์ตามลำดับที่เลือก
  const additionalColumns = reportOptions.fieldOrder
    .filter(field => field !== 'note' && reportOptions.additionalFields[field as keyof typeof reportOptions.additionalFields])
    .map(field => fieldColumnMap[field] || '');
  
  const customColumnCount = reportOptions.customColumns || 0;
  const customColumns = Array.from({ length: customColumnCount }, () => '');
  
  const noteColumn: string[] = [];
  if (reportOptions.additionalFields.note) {
    noteColumn.push('หมายเหตุ');
  }

  const allColumns = [...baseColumns, ...additionalColumns, ...customColumns, ...noteColumn];

  // Table Header
  const tableStartRow = headerRows.length + 2;
  XLSX.utils.sheet_add_aoa(ws, [allColumns], { origin: `A${tableStartRow}` });
  allColumns.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ c: colIndex, r: tableStartRow - 1 });
    if(ws[cellRef]) ws[cellRef].s = tableHeaderStyle;
  });

  // Table Data
  const tableData = sortedTeachers.map((teacher, index) => {
    const row: (string|number)[] = [
      index + 1,
      `${teacher.firstName} ${teacher.lastName}`,
    ];
    
    // เพิ่มข้อมูลตามลำดับที่เลือก
    reportOptions.fieldOrder
      .filter(field => field !== 'note' && reportOptions.additionalFields[field as keyof typeof reportOptions.additionalFields])
      .forEach(field => {
        const fieldMap: Record<string, any> = {
          position: teacher.position,
          email: teacher.email || '',
          citizenId: teacher.citizenId,
          salary: teacher.salary || '',
          birthDate: formatThaiDate(teacher.birthDate),
          appointmentDate: formatThaiDate(teacher.appointmentDate),
          education: teacher.education || '',
          major: teacher.majorSubject || '',
          phone: teacher.phone || '',
          lineId: teacher.lineId || '',
          scoutLevel: teacher.scoutLevel || '',
          signature: '',
          signature2: '',
          timeIn: '',
          timeOut: '',
        };
        row.push(fieldMap[field]);
      });
    
    for (let i = 0; i < customColumnCount; i++) { row.push(''); }

    if (reportOptions.additionalFields.note) { row.push(''); }

    return row;
  });
  
  const tableDataStartRow = tableStartRow + 1;
  XLSX.utils.sheet_add_aoa(ws, tableData, { origin: `A${tableDataStartRow}` });

  // Center-aligned columns
  const centeredColumns = ['ลำดับที่', 'เลขบัตรประจำตัวประชาชน', 'เงินเดือน', 'วัน/เดือน/ปีเกิด', 'วันที่บรรจุ', 'เบอร์โทร', 'ID Line'];
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
  for(let i = 0; i < headerRows.length; i++) {
    merges.push({ s: { r: i, c: 0 }, e: { r: i, c: allColumns.length - 1 } });
  }
  ws['!merges'] = merges;
  
  // Enhanced Column Widths - More flexible spacing with minimum 1 inch for custom columns
  const customColumnWidth = Math.max(14.4, customColumnCount > 0 ? 14.4 / Math.min(customColumnCount, 6) * 6 : 14.4); // Minimum ~1 inch (14.4 units)
  
  let nameColumnWidth: number;
  
  if (customColumnCount === 0) {
    nameColumnWidth = 24; // Standard width when no custom columns
  } else if (customColumnCount <= 2) {
    nameColumnWidth = 18; // Reduce for 1-2 custom columns
  } else if (customColumnCount <= 4) {
    nameColumnWidth = 16; // Further reduce for 3-4 custom columns
  } else {
    nameColumnWidth = 14; // Minimum for 5+ custom columns
  }
  
  const colWidths = [
    { wch: 8 }, // ลำดับที่ - compact with padding
    { wch: nameColumnWidth } // ชื่อ - นามสกุล (dynamic width)
  ];
  
  // แมป field กับ column width
  const fieldWidthMap: Record<string, number> = {
    position: 20,
    email: 24,
    citizenId: 18,
    salary: 14,
    birthDate: 20,
    appointmentDate: 20,
    education: 20,
    major: 20,
    phone: 14,
    lineId: 14,
    scoutLevel: 20,
    signature: 18,
    signature2: 18,
    timeIn: 14,
    timeOut: 14,
  };

  // เพิ่ม column width ตามลำดับที่เลือก
  reportOptions.fieldOrder
    .filter(field => field !== 'note' && reportOptions.additionalFields[field as keyof typeof reportOptions.additionalFields])
    .forEach(field => {
      colWidths.push({ wch: fieldWidthMap[field] || 14 });
    });

  // Custom columns with minimum 1 inch width (~14.4 units)
  for (let i = 0; i < customColumnCount; i++) {
    colWidths.push({ wch: customColumnWidth });
  }

  if (reportOptions.additionalFields.note) colWidths.push({ wch: 24 }); // หมายเหตุ with buffer
  
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
