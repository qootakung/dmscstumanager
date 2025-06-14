
// Excel utility functions for importing and exporting data
import * as XLSX from 'xlsx';
import { Student } from '@/types/student';
import { getStudents, gradeOptions } from './storage';

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportStudentsForHealthImport = (students: Student[]) => {
  const sortedStudents = [...students].sort((a, b) => {
    const gradeAIndex = gradeOptions.indexOf(a.grade);
    const gradeBIndex = gradeOptions.indexOf(b.grade);

    if (gradeAIndex !== gradeBIndex) {
      if (gradeAIndex === -1) return 1; // Put unknown grades at the end
      if (gradeBIndex === -1) return -1;
      return gradeAIndex - gradeBIndex;
    }

    // If grades are the same, sort by student ID numerically
    return (a.studentId || '').localeCompare(b.studentId || '', undefined, { numeric: true });
  });

  const dataForExport = sortedStudents.map(student => ({
    'รหัสนักเรียน': student.studentId,
    'ชื่อ-นามสกุล': `${student.firstNameTh} ${student.lastNameTh}`,
    'วันเดือนปีที่ชั่ง (วว/ดด/ปปปป)': '',
    'น้ำหนัก (กก.)': '',
    'ส่วนสูง (ซม.)': '',
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(dataForExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ข้อมูลน้ำหนักส่วนสูง');
  XLSX.writeFile(workbook, `template-health-import.xlsx`);
};

export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel columns to our Student model
        const students = jsonData.map((row: any) => {
          const birthDateValue = row['วันเกิด'];
          let birthDateISO = '';

          if (birthDateValue instanceof Date) {
            let year = birthDateValue.getFullYear();
            if (year > 2500) { // Correct for Buddhist year
              year -= 543;
            }
            const month = (birthDateValue.getMonth() + 1).toString().padStart(2, '0');
            const day = birthDateValue.getDate().toString().padStart(2, '0');
            birthDateISO = `${year}-${month}-${day}`;
          } else if (typeof birthDateValue === 'string') {
            const parts = birthDateValue.split(/[/.-]/);
            if (parts.length === 3) {
              const [day, month, yearStr] = parts;
              let year = parseInt(yearStr, 10);
              if (!isNaN(year)) {
                if (year > 2500) { // Correct for Buddhist year
                  year -= 543;
                }
                // Ensure month and day are two digits
                const paddedMonth = month.padStart(2, '0');
                const paddedDay = day.padStart(2, '0');
                birthDateISO = `${year}-${paddedMonth}-${paddedDay}`;
              }
            }
          }

          const rawGender = (row['เพศ'] || '').toString().trim();
          let gender: 'ชาย' | 'หญิง';
          if (rawGender === 'ช' || rawGender === 'ชาย') {
            gender = 'ชาย';
          } else { // This will correctly handle 'ญ' and 'หญิง' as female
            gender = 'หญิง';
          }

          const student: Partial<Student> = {
            citizenId: row['เลขประจำตัวประชาชน'] || '',
            grade: row['ชั้น'] || '',
            studentId: row['รหัสนักเรียน'] || '',
            gender: gender,
            titleTh: row['คำนำหน้าชื่อ'] || '',
            firstNameTh: row['ชื่อ'] || '',
            lastNameTh: row['นามสกุล'] || '',
            firstNameEn: row['ชื่อ (อังกฤษ)'] || '',
            lastNameEn: row['นามสกุล (อังกฤษ)'] || '',
            birthDate: birthDateISO,
            
            // Father information
            fatherTitle: row['คำนำหน้าชื่อบิดา'] || '',
            fatherFirstName: row['ชื่อบิดา'] || '',
            fatherLastName: row['นามสกุลบิดา'] || '',
            
            // Mother information
            motherTitle: row['คำนำหน้าชื่อมารดา'] || '',
            motherFirstName: row['ชื่อมารดา'] || '',
            motherLastName: row['นามสกุลมารดา'] || '',
            
            // Guardian information
            guardianTitle: row['คำนำหน้าชื่อผู้ปกครอง'] || '',
            guardianFirstName: row['ชื่อผู้ปกครอง'] || '',
            guardianLastName: row['นามสกุลผู้ปกครอง'] || '',
            guardianPhone: row['หมายเลขโทรศัพท์ของผู้ปกครอง'] || '',
            
            // Address
            houseNumber: row['เลขที่บ้าน (ที่อยู่ปัจจุบัน)'] || '',
            moo: row['หมู่ (ที่อยู่ปัจจุบัน)'] || '',
            subDistrict: row['ตำบล (ที่อยู่ปัจจุบัน)'] || '',
            district: row['อำเภอ (ที่อยู่ปัจจุบัน)'] || '',
            province: row['จังหวัด (ที่อยู่ปัจจุบัน)'] || '',
            postalCode: row['รหัสไปรษณีย์ (ที่อยู่ปัจจุบัน)'] || '',
            
            // Set default academic year to current year
            academicYear: (new Date().getFullYear() + 543).toString(),
          };
          
          return student;
        });
        
        resolve(students);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const importHealthDataFromExcel = (file: File): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const students = await getStudents();
    const studentMap = new Map(students.map(s => [s.studentId, s.id]));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const currentAcademicYear = (new Date().getFullYear() + 543).toString();

        const healthRecords = jsonData.map((row: any) => {
          const studentId = row['รหัสนักเรียน']?.toString().trim();
          if (!studentId) return null;

          const studentUUID = studentMap.get(studentId);
          if (!studentUUID) {
              console.warn(`Student with ID ${studentId} not found. Skipping.`);
              return null;
          }

          const measurementDateValue = row['วันเดือนปีที่ชั่ง (วว/ดด/ปปปป)'];
          let measurementDateISO = '';
          if (measurementDateValue instanceof Date) {
            let year = measurementDateValue.getFullYear();
            if (year > 2500) year -= 543;
            const month = (measurementDateValue.getMonth() + 1).toString().padStart(2, '0');
            const day = measurementDateValue.getDate().toString().padStart(2, '0');
            measurementDateISO = `${year}-${month}-${day}`;
          } else if (typeof measurementDateValue === 'string') {
             const parts = measurementDateValue.split(/[/.-]/);
             if (parts.length === 3) {
                 const [day, month, yearStr] = parts;
                 let year = parseInt(yearStr, 10);
                 if (year > 2500) year -= 543; // Buddhist year
                 measurementDateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
             }
          }

          if (!measurementDateISO) return null;

          const weight = parseFloat(row['น้ำหนัก (กก.)']);
          const height = parseFloat(row['ส่วนสูง (ซม.)']);

          return {
            student_id: studentUUID,
            measurement_date: measurementDateISO,
            weight_kg: isNaN(weight) ? null : weight,
            height_cm: isNaN(height) ? null : height,
            academic_year: currentAcademicYear,
          };
        }).filter(Boolean);

        resolve(healthRecords);
      } catch (error) {
        console.error("Error processing Excel file for health data:", error);
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
