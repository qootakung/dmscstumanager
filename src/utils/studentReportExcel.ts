
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "@/components/ui/use-toast";
import type { Student, ReportOptions } from '@/types/student';
import { getReportColumns } from '@/utils/studentReportUtils';

export const generateStudentExcel = (filteredStudents: Student[], reportOptions: ReportOptions) => {
  // Define styles
  const borderAll = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
  const titleStyle = { font: { name: 'Sarabun', sz: 14, bold: true }, alignment: { horizontal: "center", vertical: "center" } };
  const subtitleStyle = { font: { name: 'Sarabun', sz: 12 }, alignment: { horizontal: "center", vertical: "center" } };
  const summaryStyle = { font: { name: 'Sarabun', sz: 11 } };
  const tableHeaderStyle = { font: { name: 'Sarabun', sz: 11, bold: true }, border: borderAll, alignment: { horizontal: "center", vertical: "center" } };
  const cellStyle = { font: { name: 'Sarabun', sz: 11 }, border: borderAll };
  const cellCenterStyle = { ...cellStyle, alignment: { horizontal: "center" } };

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([]);
  
  // Report Headers
  const mainHeader = [
    [reportOptions.reportType === '1' ? 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล' : 'แบบลงทะเบียนการประชุมนักเรียนโรงเรียนบ้านดอนมูล'],
    [`ปีการศึกษา ${reportOptions.academicYear}`],
    [reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`]
  ];
  XLSX.utils.sheet_add_aoa(ws, mainHeader, { origin: 'A1' });
  if(ws['A1']) ws['A1'].s = titleStyle;
  if(ws['A2']) ws['A2'].s = subtitleStyle;
  if(ws['A3']) ws['A3'].s = subtitleStyle;
  
  // Summary
  const maleCount = filteredStudents.filter(s => s.gender === 'ชาย').length;
  const femaleCount = filteredStudents.filter(s => s.gender === 'หญิง').length;
  const totalCount = filteredStudents.length;
  const summaryData = [[`จำนวนเพศชาย ${maleCount} คน`, `เพศหญิง ${femaleCount} คน`, `รวม ${totalCount} คน`]];
  XLSX.utils.sheet_add_aoa(ws, summaryData, { origin: 'A5' });
  if(ws['A5']) ws['A5'].s = summaryStyle;
  if(ws['B5']) ws['B5'].s = summaryStyle;
  if(ws['C5']) ws['C5'].s = summaryStyle;

  // Table Columns
  const allColumns = getReportColumns(reportOptions);

  // Table Header
  const tableHeaderRow = 7;
  XLSX.utils.sheet_add_aoa(ws, [allColumns], { origin: `A${tableHeaderRow}` });
  allColumns.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({c: colIndex, r: tableHeaderRow - 1});
      if(ws[cellRef]) ws[cellRef].s = tableHeaderStyle;
  });
  
  // Table Data
  const tableData = filteredStudents.map((student, index) => {
    const row: (string | number)[] = [
      index + 1,
      student.studentId,
      `${student.titleTh || ''}${student.firstNameTh} ${student.lastNameTh}`,
    ];
    if (reportOptions.additionalFields.gender) row.push(student.gender === 'ชาย' ? 'ช' : 'ญ');
    if (reportOptions.additionalFields.citizenId) row.push(student.citizenId);
    if (reportOptions.additionalFields.signature) row.push('');
    if (reportOptions.additionalFields.guardianSignature) row.push('');
    if (reportOptions.additionalFields.timeIn) row.push('');
    if (reportOptions.additionalFields.timeOut) row.push('');
    if (reportOptions.additionalFields.phone) row.push(student.guardianPhone || '');
    for (let i = 0; i < (reportOptions.customColumns || 0); i++) { row.push(''); }
    if (reportOptions.additionalFields.note) row.push('');
    return row;
  });

  const tableDataStartRow = tableHeaderRow + 1;
  XLSX.utils.sheet_add_aoa(ws, tableData, { origin: `A${tableDataStartRow}` });
  
  // Center-aligned columns
  const centeredColumns = ['ลำดับที่', 'รหัสนักเรียน', 'เพศ', 'เลขบัตรประจำตัวประชาชน', 'เบอร์โทร'];
  const centeredColIndices = allColumns.map((col, i) => centeredColumns.includes(col) ? i : -1).filter(i => i !== -1);

  // Apply styles to table data
  tableData.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({c: colIndex, r: tableDataStartRow - 1 + rowIndex});
      if (ws[cellRef]) {
          ws[cellRef].s = centeredColIndices.includes(colIndex) ? cellCenterStyle : cellStyle;
      }
    });
  });

  // Merges
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: allColumns.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: allColumns.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: allColumns.length - 1 } },
  ];
  
  // Column Widths
  const colWidths = [
    { wch: 8 }, { wch: 15 }, { wch: 30 },
  ];
  if (reportOptions.additionalFields.gender) colWidths.push({ wch: 8 });
  if (reportOptions.additionalFields.citizenId) colWidths.push({ wch: 20 });
  if (reportOptions.additionalFields.signature) colWidths.push({ wch: 20 });
  if (reportOptions.additionalFields.guardianSignature) colWidths.push({ wch: 20 });
  if (reportOptions.additionalFields.timeIn) colWidths.push({ wch: 15 });
  if (reportOptions.additionalFields.timeOut) colWidths.push({ wch: 15 });
  if (reportOptions.additionalFields.phone) colWidths.push({ wch: 15 });
  for (let i = 0; i < (reportOptions.customColumns || 0); i++) {
    colWidths.push({ wch: 20 });
  }
  if (reportOptions.additionalFields.note) colWidths.push({ wch: 30 });
  ws['!cols'] = colWidths;

  // Set row heights for headers
  ws['!rows'] = [
      { hpt: 24 }, { hpt: 18 }, { hpt: 18 }
  ];
  
  // Generate file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงานนักเรียน');
  const wbbuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([new Uint8Array(wbbuf)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `student-report-${Date.now()}.xlsx`);
  toast({
    title: "ดาวน์โหลดรายงานสำเร็จ!",
    description: "ไฟล์ Excel กำลังถูกดาวน์โหลด...",
  })
};
