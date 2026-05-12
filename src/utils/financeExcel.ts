import * as XLSX from 'xlsx';
import { Student } from '@/types/student';

export const exportFinanceStudentTemplate = () => {
  const exampleRow = {
    'ที่': 1,
    'คำนำหน้า': 'เด็กชาย',
    'ชื่อ': 'สมชาย',
    'นามสกุล': 'ใจดี',
    'เลขประจำตัวประชาชน': '1234567890123',
    'ชั้นเรียน': 'ป.1',
  };

  const dataForExport = [
    exampleRow,
    {
      'ที่': 2,
      'คำนำหน้า': '',
      'ชื่อ': '',
      'นามสกุล': '',
      'เลขประจำตัวประชาชน': '',
      'ชั้นเรียน': '',
    }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(dataForExport);
  
  // Style the example row differently
  const range = XLSX.utils.decode_range(worksheet['!ref']!);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      fill: { fgColor: { rgb: "FFFF00" } }, // Yellow background
      font: { bold: true }
    };
  }
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อนักเรียน');
  XLSX.writeFile(workbook, `template-finance-students.xlsx`);
};

export const importFinanceStudentsFromExcel = (file: File): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const students = jsonData
          .filter((row: any) => row['ชื่อ'] && row['ชื่อ'].trim() !== '')
          .map((row: any, index: number) => {
            const student: Partial<Student> = {
              id: `manual-${Date.now()}-${index}`,
              citizenId: row['เลขประจำตัวประชาชน']?.toString() || '',
              grade: row['ชั้นเรียน']?.toString() || '',
              titleTh: row['คำนำหน้า']?.toString() || '',
              firstNameTh: row['ชื่อ']?.toString() || '',
              lastNameTh: row['นามสกุล']?.toString() || '',
              academicYear: '',
              semester: '',
            };
            return student as Student;
          });
        
        resolve(students);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
