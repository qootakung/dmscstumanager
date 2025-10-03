
import type { ReportOptions, Student } from '@/types/student';

export const gradeOrder = [
  'อ.1', 'อ.2', 'อ.3',
  'ป.1', 'ป.2', 'ป.3',
  'ป.4', 'ป.5', 'ป.6'
];

export const sortGrades = (grades: string[]): string[] => {
  return [...grades].sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));
};

export const getReportColumns = (reportOptions: ReportOptions) => {
  const baseColumns = ['ลำดับที่', 'รหัสนักเรียน', 'ชื่อ - นามสกุล'];
  
  // For "Other Registration Form" type, add fixed additional columns
  if (reportOptions.reportType === '3') {
    return [...baseColumns, 'ลายมือชื่อ', 'เวลามา', 'ลายมือชื่อ', 'เวลากลับ'];
  }
  
  // For "Meeting Registration Form" type, order signature and time columns together
  if (reportOptions.reportType === '2') {
    const additionalColumns = [];
    if (reportOptions.additionalFields.gender) additionalColumns.push('เพศ');
    if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
    
    // Add signature and time fields in specific order
    if (reportOptions.additionalFields.signature) additionalColumns.push('ลายมือชื่อ');
    if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลามา');
    if (reportOptions.additionalFields.signature2) additionalColumns.push('ลายมือชื่อ');
    if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลากลับ');
    
    if (reportOptions.additionalFields.guardianSignature) additionalColumns.push('ลายเซ็นผู้ปกครอง');
    if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');
    if (reportOptions.additionalFields.gradeLevel) additionalColumns.push('ระดับชั้น');
    if (reportOptions.additionalFields.address) additionalColumns.push('ที่อยู่');
    if (reportOptions.additionalFields.age) additionalColumns.push('อายุ');
    if (reportOptions.additionalFields.birthDate) additionalColumns.push('วันเดือนปีเกิด');

    const customColumns: string[] = [];
    if (reportOptions.customColumns && reportOptions.customColumns > 0) {
      for (let i = 1; i <= reportOptions.customColumns; i++) {
        customColumns.push('');
      }
    }

    const noteColumn: string[] = [];
    if (reportOptions.additionalFields.note) {
      noteColumn.push('หมายเหตุ');
    }

    return [...baseColumns, ...additionalColumns, ...customColumns, ...noteColumn];
  }
  
  // For other report types, use existing logic - Order matches the form display order
  const additionalColumns = [];
  if (reportOptions.additionalFields.gender) additionalColumns.push('เพศ');
  if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
  if (reportOptions.additionalFields.signature) additionalColumns.push('ลายมือชื่อ');
  if (reportOptions.additionalFields.signature2) additionalColumns.push('ลายมือชื่อ');
  if (reportOptions.additionalFields.guardianSignature) additionalColumns.push('ลายเซ็นผู้ปกครอง');
  if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลามา');
  if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลากลับ');
  if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');
  if (reportOptions.additionalFields.gradeLevel) additionalColumns.push('ระดับชั้น');
  if (reportOptions.additionalFields.address) additionalColumns.push('ที่อยู่');
  if (reportOptions.additionalFields.age) additionalColumns.push('อายุ');
  if (reportOptions.additionalFields.birthDate) additionalColumns.push('วันเดือนปีเกิด');

  const customColumns: string[] = [];
  if (reportOptions.customColumns && reportOptions.customColumns > 0) {
    for (let i = 1; i <= reportOptions.customColumns; i++) {
      customColumns.push('');
    }
  }

  const noteColumn: string[] = [];
  if (reportOptions.additionalFields.note) {
    noteColumn.push('หมายเหตุ');
  }

  return [...baseColumns, ...additionalColumns, ...customColumns, ...noteColumn];
};

export const calculateAge = (birthDate: string): string => {
  if (!birthDate) return '';
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return `${years} ปี ${months} เดือน ${days} วัน`;
};

export const formatAddress = (student: Student): string => {
  const parts = [];
  if (student.houseNumber) parts.push(`บ้านเลขที่ ${student.houseNumber}`);
  if (student.moo) parts.push(`หมู่ ${student.moo}`);
  if (student.subDistrict) parts.push(`ต.${student.subDistrict}`);
  if (student.district) parts.push(`อ.${student.district}`);
  if (student.province) parts.push(`จ.${student.province}`);
  if (student.postalCode) parts.push(student.postalCode);
  
  return parts.join(' ');
};

export const formatBirthDate = (birthDate: string): string => {
  if (!birthDate) return '';
  
  const date = new Date(birthDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = (date.getFullYear() + 543).toString(); // Convert to Buddhist year
  
  return `${day}/${month}/${year}`;
};

export const getReportTitle = (reportOptions: ReportOptions) => {
  switch (reportOptions.reportType) {
    case '1':
      return 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล';
    case '2':
      return 'แบบลงทะเบียนโครงการยกระดับผลสัมฤทธิ์ทางการเรียนรู้';
    case '3':
      return 'แบบลงทะเบียนโครงการยกระดับผลสัมฤทธิ์ทางการเรียนรู้';
    default:
      return 'รายงานนักเรียนโรงเรียนบ้านดอนมูล';
  }
};
