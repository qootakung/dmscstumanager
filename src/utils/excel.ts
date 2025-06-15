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

  // Add example row for reference
  const exampleRow = {
    'รหัสนักเรียน': 'ตัวอย่าง: ST001',
    'ชื่อ-นามสกุล': 'ตัวอย่าง: เด็กชาย สมชาย ใจดี',
    'วันเดือนปีที่ชั่ง (วว/ดด/ปปปป)': '15/06/2568',
    'น้ำหนัก (กก.)': '25.5',
    'ส่วนสูง (ซม.)': '120.0',
  };

  const dataForExport = [
    exampleRow,
    ...sortedStudents.map(student => ({
      'รหัสนักเรียน': student.studentId,
      'ชื่อ-นามสกุล': `${student.firstNameTh} ${student.lastNameTh}`,
      'วันเดือนปีที่ชั่ง (วว/ดด/ปปปป)': '',
      'น้ำหนัก (กก.)': '',
      'ส่วนสูง (ซม.)': '',
    }))
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

export const importHealthDataFromExcel = (file: File): Promise<{ 
  healthRecords: any[], 
  errors: string[], 
  validRecords: number,
  skippedRecords: number 
}> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting health data import...');
      const students = await getStudents();
      console.log('Found', students.length, 'students in system');
      
      const studentMap = new Map(students.map(s => [s.studentId, s.id]));
      console.log('Student ID mappings:', Array.from(studentMap.keys()));

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log('Excel data rows:', jsonData.length);

          const currentAcademicYear = (new Date().getFullYear() + 543).toString();
          const errors: string[] = [];
          const healthRecords: any[] = [];
          let validRecords = 0;
          let skippedRecords = 0;

          jsonData.forEach((row: any, index: number) => {
            const rowNumber = index + 2; // +2 because Excel rows start at 1 and we have header
            
            // Skip the example row (first row after header)
            const studentIdRaw = row['รหัสนักเรียน']?.toString().trim();
            if (!studentIdRaw || studentIdRaw.includes('ตัวอย่าง')) {
              console.log(`Row ${rowNumber}: Skipping example/empty row`);
              skippedRecords++;
              return;
            }

            console.log(`Processing row ${rowNumber}: Student ID = ${studentIdRaw}`);

            const studentUUID = studentMap.get(studentIdRaw);
            if (!studentUUID) {
              const errorMsg = `แถวที่ ${rowNumber}: ไม่พบรหัสนักเรียน "${studentIdRaw}" ในระบบ`;
              console.warn(errorMsg);
              errors.push(errorMsg);
              return;
            }

            // Process measurement date
            const measurementDateValue = row['วันเดือนปีที่ชั่ง (วว/ดด/ปปปป)'];
            let measurementDateISO = '';
            
            if (!measurementDateValue) {
              errors.push(`แถวที่ ${rowNumber}: กรุณาระบุวันที่ชั่งน้ำหนัก`);
              return;
            }

            if (measurementDateValue instanceof Date) {
              let year = measurementDateValue.getFullYear();
              if (year > 2500) year -= 543;
              const month = (measurementDateValue.getMonth() + 1).toString().padStart(2, '0');
              const day = measurementDateValue.getDate().toString().padStart(2, '0');
              measurementDateISO = `${year}-${month}-${day}`;
              console.log(`Row ${rowNumber}: Date processed as ${measurementDateISO}`);
            } else if (typeof measurementDateValue === 'string') {
              const parts = measurementDateValue.split(/[/.-]/);
              if (parts.length === 3) {
                const [day, month, yearStr] = parts;
                let year = parseInt(yearStr, 10);
                if (isNaN(year)) {
                  errors.push(`แถวที่ ${rowNumber}: รูปแบบปีไม่ถูกต้อง "${yearStr}"`);
                  return;
                }
                if (year > 2500) year -= 543; // Buddhist year conversion
                measurementDateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                console.log(`Row ${rowNumber}: Date string processed as ${measurementDateISO}`);
              } else {
                errors.push(`แถวที่ ${rowNumber}: รูปแบบวันที่ไม่ถูกต้อง "${measurementDateValue}" (ใช้รูปแบบ วว/ดด/ปปปป)`);
                return;
              }
            }

            if (!measurementDateISO) {
              errors.push(`แถวที่ ${rowNumber}: ไม่สามารถประมวลผลวันที่ได้`);
              return;
            }

            // Process weight and height
            const weightRaw = row['น้ำหนัก (กก.)'];
            const heightRaw = row['ส่วนสูง (ซม.)'];
            
            const weight = weightRaw ? parseFloat(weightRaw.toString()) : null;
            const height = heightRaw ? parseFloat(heightRaw.toString()) : null;

            if (weight !== null && (isNaN(weight) || weight <= 0)) {
              errors.push(`แถวที่ ${rowNumber}: น้ำหนักไม่ถูกต้อง "${weightRaw}"`);
              return;
            }

            if (height !== null && (isNaN(height) || height <= 0)) {
              errors.push(`แถวที่ ${rowNumber}: ส่วนสูงไม่ถูกต้อง "${heightRaw}"`);
              return;
            }

            if (weight === null && height === null) {
              errors.push(`แถวที่ ${rowNumber}: กรุณาระบุน้ำหนักหรือส่วนสูงอย่างน้อย 1 ค่า`);
              return;
            }

            const healthRecord = {
              student_id: studentUUID,
              measurement_date: measurementDateISO,
              weight_kg: weight,
              height_cm: height,
              academic_year: currentAcademicYear,
            };

            healthRecords.push(healthRecord);
            validRecords++;
            console.log(`Row ${rowNumber}: Valid record created for student ${studentIdRaw}`);
          });

          console.log(`Import summary: ${validRecords} valid, ${errors.length} errors, ${skippedRecords} skipped`);
          resolve({ healthRecords, errors, validRecords, skippedRecords });
          
        } catch (error) {
          console.error("Error processing Excel file for health data:", error);
          reject(new Error('ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์'));
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error in importHealthDataFromExcel:", error);
      reject(error);
    }
  });
};
