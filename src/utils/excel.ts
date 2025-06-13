
import * as XLSX from 'xlsx';
import { Student, ReportOptions } from '@/types/student';

export const exportToExcel = (students: Student[], options: ReportOptions) => {
  const filteredStudents = options.classLevel === 'all' 
    ? students.filter(s => s.academicYear === options.academicYear)
    : students.filter(s => s.academicYear === options.academicYear && s.grade === options.classLevel);

  if (options.classLevel === 'all') {
    // Export separate sheets for each grade
    const workbook = XLSX.utils.book_new();
    
    const grades = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
    
    grades.forEach(grade => {
      const gradeStudents = filteredStudents.filter(s => s.grade === grade);
      if (gradeStudents.length > 0) {
        const worksheet = createWorksheet(gradeStudents, options, grade);
        XLSX.utils.book_append_sheet(workbook, worksheet, grade);
      }
    });
    
    const fileName = `${getReportTitle(options)}_${options.academicYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } else {
    // Export single sheet
    const workbook = XLSX.utils.book_new();
    const worksheet = createWorksheet(filteredStudents, options, options.classLevel);
    XLSX.utils.book_append_sheet(workbook, worksheet, options.classLevel);
    
    const fileName = `${getReportTitle(options)}_${options.classLevel}_${options.academicYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
};

const createWorksheet = (students: Student[], options: ReportOptions, grade: string) => {
  const headers = createHeaders(options);
  const title = getReportTitle(options);
  
  // Create header rows
  const headerRows = [
    [title],
    [`ระดับชั้น ${grade} ปีการศึกษา ${options.academicYear}`],
  ];
  
  if (options.selectedDate) {
    headerRows.push([`วันที่ ${options.selectedDate}`]);
  }
  
  headerRows.push([]); // Empty row
  headerRows.push(headers); // Column headers
  
  // Create data rows
  const dataRows = students.map((student, index) => createDataRow(student, index + 1, options));
  
  // Combine all rows
  const allRows = [...headerRows, ...dataRows];
  
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);
  
  // Set column widths
  const colWidths = headers.map((_, index) => ({ wch: index === 1 ? 30 : 15 }));
  worksheet['!cols'] = colWidths;
  
  return worksheet;
};

const getReportTitle = (options: ReportOptions): string => {
  return options.reportType === '1' 
    ? 'ข้อมูลนักเรียนโรงเรียนบ้านดอนมูล'
    : 'แบบลงทะเบียนการประชุมผู้ปกครองโรงเรียนบ้านดอนมูล';
};

const createHeaders = (options: ReportOptions): string[] => {
  const baseHeaders = ['ลำดับ', 'ชื่อ-นามสกุล', 'ชั้น', 'รหัสนักเรียน'];
  
  if (options.additionalFields.citizenId) baseHeaders.push('เลขบัตรประชาชน');
  if (options.additionalFields.signature) baseHeaders.push('ลายมือชื่อ');
  if (options.additionalFields.guardianSignature) baseHeaders.push('ลายมือชื่อผู้ปกครอง');
  if (options.additionalFields.timeIn) baseHeaders.push('เวลามา');
  if (options.additionalFields.timeOut) baseHeaders.push('เวลากลับ');
  if (options.additionalFields.phone) baseHeaders.push('เบอร์โทร');
  if (options.additionalFields.note) baseHeaders.push('หมายเหตุ');
  
  return baseHeaders;
};

const createDataRow = (student: Student, index: number, options: ReportOptions): (string | number)[] => {
  const fullName = `${student.titleTh}${student.firstNameTh} ${student.lastNameTh}`;
  const baseRow: (string | number)[] = [index, fullName, student.grade, student.studentId];
  
  if (options.additionalFields.citizenId) baseRow.push(student.citizenId);
  if (options.additionalFields.signature) baseRow.push('');
  if (options.additionalFields.guardianSignature) baseRow.push('');
  if (options.additionalFields.timeIn) baseRow.push('');
  if (options.additionalFields.timeOut) baseRow.push('');
  if (options.additionalFields.phone) baseRow.push(student.guardianPhone);
  if (options.additionalFields.note) baseRow.push('');
  
  return baseRow;
};

export const importFromExcel = (file: File): Promise<Partial<Student>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Map Excel columns to student data structure
        const students: Partial<Student>[] = jsonData.slice(1).map(row => ({
          citizenId: row[2] || '', // Column C
          grade: row[3] || '', // Column D
          studentId: row[5] || '', // Column F
          gender: row[6] as 'ชาย' | 'หญิง' || 'ชาย', // Column G
          titleTh: row[7] || '', // Column H
          firstNameTh: row[8] || '', // Column I
          lastNameTh: row[9] || '', // Column J
          firstNameEn: row[10] || '', // Column K
          lastNameEn: row[11] || '', // Column L
          birthDate: row[12] || '', // Column M
          fatherTitle: row[26] || '', // Column AA
          fatherFirstName: row[27] || '', // Column AB
          fatherLastName: row[29] || '', // Column AD
          motherTitle: row[32] || '', // Column AG
          motherFirstName: row[33] || '', // Column AH
          motherLastName: row[34] || '', // Column AI
          guardianTitle: row[39] || '', // Column AN
          guardianFirstName: row[40] || '', // Column AO
          guardianLastName: row[41] || '', // Column AP
          guardianPhone: row[43] || '', // Column AR
          houseNumber: row[54] || '', // Column BC
          moo: row[55] || '', // Column BD
          subDistrict: row[57] || '', // Column BF
          district: row[58] || '', // Column BG
          province: row[59] || '', // Column BH
          postalCode: row[60] || '', // Column BI
        })).filter(student => student.firstNameTh && student.lastNameTh);
        
        resolve(students);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
