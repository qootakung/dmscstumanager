
// Excel utility functions for importing and exporting data
import * as XLSX from 'xlsx';
import { Student } from '@/types/student';

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
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

          const student: Partial<Student> = {
            citizenId: row['เลขประจำตัวประชาชน'] || '',
            grade: row['ชั้น'] || '',
            studentId: row['รหัสนักเรียน'] || '',
            gender: row['เพศ'] === 'ชาย' ? 'ชาย' : 'หญิง',
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
