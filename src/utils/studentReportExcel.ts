
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
  let mainHeader: string[][];
  
  if (reportOptions.reportType === '3') {
    // For "Other Registration Form", use the user-entered headers
    mainHeader = [];
    
    // Add custom headers if provided
    if (reportOptions.customColumn1?.trim()) {
      mainHeader.push([reportOptions.customColumn1]);
    }
    if (reportOptions.customColumn2?.trim()) {
      mainHeader.push([reportOptions.customColumn2]);
    }
    
    mainHeader.push([`${reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`} ปีการศึกษา ${reportOptions.academicYear}`]);
  } else if (reportOptions.reportType === '2') {
    // For meeting registration form, use new text
    mainHeader = [
      ['แบบลงทะเบียนโครงการยกระดับผลสัมฤทธิ์ทางการเรียนรู้'],
      ['โรงเรียนบ้านดอนมูล'],
      [`${reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`} ปีการศึกษา ${reportOptions.academicYear}`]
    ];
  } else {
    // For other report types, use standard headers
    const reportTitle = 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล';
      
    mainHeader = [
      [reportTitle],
      [`${reportOptions.classLevel === 'all' ? 'ทุกระดับชั้น' : `ระดับชั้น ${reportOptions.classLevel}`} ปีการศึกษา ${reportOptions.academicYear}`]
    ];
  }
  
  XLSX.utils.sheet_add_aoa(ws, mainHeader, { origin: 'A1' });
  
  // Apply styles to headers - first header is bold, second header is normal for type 3
  mainHeader.forEach((_, rowIndex) => {
    const cellRef = XLSX.utils.encode_cell({c: 0, r: rowIndex});
    if (ws[cellRef]) {
      if (reportOptions.reportType === '3' && rowIndex === 1) {
        // For type 3, make second header normal weight
        ws[cellRef].s = { font: { name: 'Sarabun', sz: 14 }, alignment: { horizontal: "center", vertical: "center" } };
      } else {
        ws[cellRef].s = rowIndex === 0 ? titleStyle : subtitleStyle;
      }
    }
  });
  
  // Summary
  const maleCount = filteredStudents.filter(s => s.gender === 'ชาย').length;
  const femaleCount = filteredStudents.filter(s => s.gender === 'หญิง').length;
  const totalCount = filteredStudents.length;
  const summaryData = [[`จำนวนเพศชาย ${maleCount} คน`, `เพศหญิง ${femaleCount} คน`, `รวม ${totalCount} คน`]];
  const summaryRow = mainHeader.length + 2;
  XLSX.utils.sheet_add_aoa(ws, summaryData, { origin: `A${summaryRow}` });
  if(ws[`A${summaryRow}`]) ws[`A${summaryRow}`].s = summaryStyle;
  if(ws[`B${summaryRow}`]) ws[`B${summaryRow}`].s = summaryStyle;
  if(ws[`C${summaryRow}`]) ws[`C${summaryRow}`].s = summaryStyle;

  // Table Columns
  const allColumns = getReportColumns(reportOptions);

  // Table Header
  const tableHeaderRow = summaryRow + 2;
  XLSX.utils.sheet_add_aoa(ws, [allColumns], { origin: `A${tableHeaderRow}` });
  allColumns.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({c: colIndex, r: tableHeaderRow - 1});
      if(ws[cellRef]) ws[cellRef].s = tableHeaderStyle;
  });
  
  // Table Data
  const tableData = filteredStudents.map((student, index) => {
    const baseRow: (string | number)[] = [
      index + 1,
      student.studentId,
      `${student.titleTh || ''}${student.firstNameTh} ${student.lastNameTh}`,
    ];

    if (reportOptions.reportType === '3') {
      // For type 3, add the four fixed columns: signature, time in, time out, notes
      return [...baseRow, '', '', '', ''];
    }

    // For other report types, use existing logic
    if (reportOptions.additionalFields.gender) baseRow.push(student.gender === 'ชาย' ? 'ช' : 'ญ');
    if (reportOptions.additionalFields.citizenId) baseRow.push(student.citizenId);
    if (reportOptions.additionalFields.signature) baseRow.push('');
    if (reportOptions.additionalFields.signature2) baseRow.push('');
    if (reportOptions.additionalFields.guardianSignature) baseRow.push('');
    if (reportOptions.additionalFields.timeIn) baseRow.push('');
    if (reportOptions.additionalFields.timeOut) baseRow.push('');
    if (reportOptions.additionalFields.phone) baseRow.push(student.guardianPhone || '');
    for (let i = 0; i < (reportOptions.customColumns || 0); i++) { baseRow.push(''); }
    if (reportOptions.additionalFields.note) baseRow.push('');
    return baseRow;
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

  // Merges for headers
  const merges = [];
  mainHeader.forEach((_, rowIndex) => {
    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: allColumns.length - 1 } });
  });
  ws['!merges'] = merges;
  
  // Enhanced Column Widths - More flexible and appropriate sizing
  const customColumnCount = reportOptions.customColumns || 0;
  
  // Calculate dynamic widths based on custom column count and report type
  let nameColumnWidth: number;
  let customColumnWidth: number;
  
  if (customColumnCount === 0) {
    nameColumnWidth = 28; // Standard width when no custom columns
    customColumnWidth = 0;
  } else if (customColumnCount <= 2) {
    nameColumnWidth = 22; // Reduce name column for 1-2 custom columns
    customColumnWidth = 18; // About 1 inch width for custom columns
  } else if (customColumnCount <= 4) {
    nameColumnWidth = 18; // Further reduce for 3-4 custom columns
    customColumnWidth = 16; // Slightly smaller custom columns
  } else {
    nameColumnWidth = 16; // Minimum name column width for 5+ custom columns
    customColumnWidth = 14; // Smaller custom columns for many columns
  }
  
  const colWidths = [
    { wch: 6 }, // ลำดับที่ - smaller
    { wch: 12 }, // รหัสนักเรียน - compact
    { wch: nameColumnWidth }, // ชื่อ - นามสกุล (dynamic width)
  ];
  
  if (reportOptions.reportType === '3') {
    // For type 3, add widths for the fixed columns
    colWidths.push({ wch: 18 }); // ลายมือชื่อ
    colWidths.push({ wch: 12 }); // เวลามา - compact
    colWidths.push({ wch: 12 }); // เวลากลับ - compact
    colWidths.push({ wch: 25 }); // หมายเหตุ - wider for notes
  } else {
    // For other report types, use existing logic with optimized widths
      if (reportOptions.additionalFields.gender) colWidths.push({ wch: 6 }); // เพศ - very compact
      if (reportOptions.additionalFields.citizenId) colWidths.push({ wch: 16 }); // บัตรประชาชน - compact
      if (reportOptions.additionalFields.signature) colWidths.push({ wch: 16 }); // ลายมือชื่อ
      if (reportOptions.additionalFields.signature2) colWidths.push({ wch: 16 }); // ลายมือชื่อ 2
      if (reportOptions.additionalFields.guardianSignature) colWidths.push({ wch: 16 }); // ลายมือชื่อผู้รับเงิน
      if (reportOptions.additionalFields.timeIn) colWidths.push({ wch: 12 }); // เวลามา - compact
    if (reportOptions.additionalFields.timeOut) colWidths.push({ wch: 12 }); // เวลากลับ - compact
    if (reportOptions.additionalFields.phone) colWidths.push({ wch: 14 }); // เบอร์โทร
    
    // Custom columns with calculated width (about 1 inch each)
    for (let i = 0; i < customColumnCount; i++) {
      colWidths.push({ wch: customColumnWidth });
    }
    
    if (reportOptions.additionalFields.note) colWidths.push({ wch: 25 }); // หมายเหตุ - wider for notes
  }
  
  ws['!cols'] = colWidths;

  // Set row heights for headers
  ws['!rows'] = Array(mainHeader.length).fill({ hpt: 20 });
  
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

// Export Excel with separate sheets for each grade (Paginated mode)
export const generateStudentExcelPaginated = (filteredStudents: Student[], reportOptions: ReportOptions) => {
  // Group students by grade
  const studentsByGrade = filteredStudents.reduce((acc, student) => {
    const grade = student.grade || 'ไม่ระบุ';
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  // Sort grades
  const sortedGrades = Object.keys(studentsByGrade).sort((a, b) => {
    const gradeOrder = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
    const indexA = gradeOrder.indexOf(a);
    const indexB = gradeOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Define styles (same as original)
  const borderAll = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
  const titleStyle = { font: { name: 'Sarabun', sz: 14, bold: true }, alignment: { horizontal: "center", vertical: "center" } };
  const subtitleStyle = { font: { name: 'Sarabun', sz: 12 }, alignment: { horizontal: "center", vertical: "center" } };
  const summaryStyle = { font: { name: 'Sarabun', sz: 11 } };
  const tableHeaderStyle = { font: { name: 'Sarabun', sz: 11, bold: true }, border: borderAll, alignment: { horizontal: "center", vertical: "center" } };
  const cellStyle = { font: { name: 'Sarabun', sz: 11 }, border: borderAll };
  const cellCenterStyle = { ...cellStyle, alignment: { horizontal: "center" } };

  // Create a sheet for each grade
  sortedGrades.forEach((grade) => {
    const gradeStudents = studentsByGrade[grade];
    
    // Sort students by studentId
    gradeStudents.sort((a, b) => {
      const aId = a.studentId;
      const bId = b.studentId;
      const aIs3Digit = aId.length === 3;
      const bIs3Digit = bId.length === 3;
      if (aIs3Digit && !bIs3Digit) return -1;
      if (!aIs3Digit && bIs3Digit) return 1;
      return parseInt(aId) - parseInt(bId);
    });

    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Report Headers
    let mainHeader: string[][];
    
    if (reportOptions.reportType === '3') {
      mainHeader = [];
      if (reportOptions.customColumn1?.trim()) {
        mainHeader.push([reportOptions.customColumn1]);
      }
      if (reportOptions.customColumn2?.trim()) {
        mainHeader.push([reportOptions.customColumn2]);
      }
      mainHeader.push([`ระดับชั้น ${grade} ปีการศึกษา ${reportOptions.academicYear}`]);
    } else if (reportOptions.reportType === '2') {
      mainHeader = [
        ['แบบลงทะเบียนโครงการยกระดับผลสัมฤทธิ์ทางการเรียนรู้'],
        ['โรงเรียนบ้านดอนมูล'],
        [`ระดับชั้น ${grade} ปีการศึกษา ${reportOptions.academicYear}`]
      ];
    } else {
      const reportTitle = 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล';
      mainHeader = [
        [reportTitle],
        [`ระดับชั้น ${grade} ปีการศึกษา ${reportOptions.academicYear}`]
      ];
    }
    
    XLSX.utils.sheet_add_aoa(ws, mainHeader, { origin: 'A1' });
    
    // Apply styles to headers
    mainHeader.forEach((_, rowIndex) => {
      const cellRef = XLSX.utils.encode_cell({c: 0, r: rowIndex});
      if (ws[cellRef]) {
        if (reportOptions.reportType === '3' && rowIndex === 1) {
          ws[cellRef].s = { font: { name: 'Sarabun', sz: 14 }, alignment: { horizontal: "center", vertical: "center" } };
        } else {
          ws[cellRef].s = rowIndex === 0 ? titleStyle : subtitleStyle;
        }
      }
    });
    
    // Summary
    const maleCount = gradeStudents.filter(s => s.gender === 'ชาย').length;
    const femaleCount = gradeStudents.filter(s => s.gender === 'หญิง').length;
    const totalCount = gradeStudents.length;
    const summaryData = [[`จำนวนเพศชาย ${maleCount} คน`, `เพศหญิง ${femaleCount} คน`, `รวม ${totalCount} คน`]];
    const summaryRow = mainHeader.length + 2;
    XLSX.utils.sheet_add_aoa(ws, summaryData, { origin: `A${summaryRow}` });
    if(ws[`A${summaryRow}`]) ws[`A${summaryRow}`].s = summaryStyle;
    if(ws[`B${summaryRow}`]) ws[`B${summaryRow}`].s = summaryStyle;
    if(ws[`C${summaryRow}`]) ws[`C${summaryRow}`].s = summaryStyle;

    // Table Columns
    const allColumns = getReportColumns(reportOptions);

    // Table Header
    const tableHeaderRow = summaryRow + 2;
    XLSX.utils.sheet_add_aoa(ws, [allColumns], { origin: `A${tableHeaderRow}` });
    allColumns.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({c: colIndex, r: tableHeaderRow - 1});
        if(ws[cellRef]) ws[cellRef].s = tableHeaderStyle;
    });
    
    // Table Data
    const tableData = gradeStudents.map((student, index) => {
      const baseRow: (string | number)[] = [
        index + 1,
        student.studentId,
        `${student.titleTh || ''}${student.firstNameTh} ${student.lastNameTh}`,
      ];

      if (reportOptions.reportType === '3') {
        return [...baseRow, '', '', '', ''];
      }

      if (reportOptions.additionalFields.gender) baseRow.push(student.gender === 'ชาย' ? 'ช' : 'ญ');
      if (reportOptions.additionalFields.citizenId) baseRow.push(student.citizenId);
      if (reportOptions.additionalFields.signature) baseRow.push('');
      if (reportOptions.additionalFields.signature2) baseRow.push('');
      if (reportOptions.additionalFields.guardianSignature) baseRow.push('');
      if (reportOptions.additionalFields.timeIn) baseRow.push('');
      if (reportOptions.additionalFields.timeOut) baseRow.push('');
      if (reportOptions.additionalFields.phone) baseRow.push(student.guardianPhone || '');
      for (let i = 0; i < (reportOptions.customColumns || 0); i++) { baseRow.push(''); }
      if (reportOptions.additionalFields.note) baseRow.push('');
      return baseRow;
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

    // Merges for headers
    const merges = [];
    mainHeader.forEach((_, rowIndex) => {
      merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: allColumns.length - 1 } });
    });
    ws['!merges'] = merges;
    
    // Column Widths
    const customColumnCount = reportOptions.customColumns || 0;
    let nameColumnWidth: number;
    let customColumnWidth: number;
    
    if (customColumnCount === 0) {
      nameColumnWidth = 28;
      customColumnWidth = 0;
    } else if (customColumnCount <= 2) {
      nameColumnWidth = 22;
      customColumnWidth = 18;
    } else if (customColumnCount <= 4) {
      nameColumnWidth = 18;
      customColumnWidth = 16;
    } else {
      nameColumnWidth = 16;
      customColumnWidth = 14;
    }
    
    const colWidths = [
      { wch: 6 },
      { wch: 12 },
      { wch: nameColumnWidth },
    ];
    
    if (reportOptions.reportType === '3') {
      colWidths.push({ wch: 18 });
      colWidths.push({ wch: 12 });
      colWidths.push({ wch: 12 });
      colWidths.push({ wch: 25 });
    } else {
      if (reportOptions.additionalFields.gender) colWidths.push({ wch: 6 });
      if (reportOptions.additionalFields.citizenId) colWidths.push({ wch: 16 });
      if (reportOptions.additionalFields.signature) colWidths.push({ wch: 16 });
      if (reportOptions.additionalFields.signature2) colWidths.push({ wch: 16 });
      if (reportOptions.additionalFields.guardianSignature) colWidths.push({ wch: 16 });
      if (reportOptions.additionalFields.timeIn) colWidths.push({ wch: 12 });
      if (reportOptions.additionalFields.timeOut) colWidths.push({ wch: 12 });
      if (reportOptions.additionalFields.phone) colWidths.push({ wch: 14 });
      
      for (let i = 0; i < customColumnCount; i++) {
        colWidths.push({ wch: customColumnWidth });
      }
      
      if (reportOptions.additionalFields.note) colWidths.push({ wch: 25 });
    }
    
    ws['!cols'] = colWidths;

    // Set row heights for headers
    ws['!rows'] = Array(mainHeader.length).fill({ hpt: 20 });
    
    // Add sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, grade);
  });
  
  // Generate file
  const wbbuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([new Uint8Array(wbbuf)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `student-report-paginated-${Date.now()}.xlsx`);
  
  toast({
    title: "ดาวน์โหลดรายงานสำเร็จ!",
    description: "ไฟล์ Excel แยก Sheet ตามชั้นเรียนกำลังถูกดาวน์โหลด...",
  });
};
