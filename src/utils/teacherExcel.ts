
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Teacher } from '@/types/teacher';

const teacherHeaders = {
  academicYear: 'ปีการศึกษา',
  positionNumber: 'เลขตำแหน่ง',
  firstName: 'ชื่อ',
  lastName: 'นามสกุล',
  position: 'ตำแหน่ง',
  citizenId: 'เลขบัตรประชาชน',
  education: 'วุฒิการศึกษา',
  majorSubject: 'วิชาเอก',
  birthDate: 'วันเกิด (ปปปป-ดด-วว)',
  appointmentDate: 'วันบรรจุ (ปปปป-ดด-วว)',
  salary: 'เงินเดือน',
  phone: 'เบอร์โทร',
  lineId: 'LINE ID',
  email: 'อีเมล',
  scoutLevel: 'วุฒิทางลูกเสือ',
};

const headerMap: { [key: string]: keyof Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'> } = Object.entries(teacherHeaders).reduce((acc, [key, value]) => {
  acc[value] = key as keyof Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>;
  return acc;
}, {} as any);


export const downloadTeacherTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([{}], { header: Object.values(teacherHeaders) });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'teacher_import_template.xlsx');
};

const parseDateExcel = (dateValue: any): string => {
  if (!dateValue) return '';

  if (dateValue instanceof Date) {
      let year = dateValue.getFullYear();
      if (year > 2500) { // Correct for Buddhist year
          year -= 543;
      }
      const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
      const day = dateValue.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
  }

  if (typeof dateValue === 'string') {
      const parts = dateValue.split(/[/.-]/);
      if (parts.length === 3) {
          let day, month, yearStr;
          if (parts[0].length === 4) { // YYYY-MM-DD
              [yearStr, month, day] = parts;
          } else { // DD-MM-YYYY
              [day, month, yearStr] = parts;
          }
          let year = parseInt(yearStr, 10);
          if (!isNaN(year)) {
              if (year > 2500) {
                  year -= 543;
              }
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
      }
  }
  return '';
};

export const importTeachersFromExcel = (file: File): Promise<Partial<Teacher>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const teachers = jsonData.map((row: any) => {
          const teacher: Partial<Teacher> = {};
          for (const excelHeader in headerMap) {
            if (row[excelHeader] !== undefined) {
              const teacherField = headerMap[excelHeader];
              if (teacherField === 'birthDate' || teacherField === 'appointmentDate') {
                teacher[teacherField] = parseDateExcel(row[excelHeader]);
              } else {
                teacher[teacherField] = String(row[excelHeader]);
              }
            }
          }
          return teacher;
        });
        
        resolve(teachers.filter(t => t.firstName && t.lastName && t.positionNumber));
      } catch (error) {
        console.error("Error parsing teacher excel file:", error);
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
