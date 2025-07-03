
import type { ReportOptions } from '@/types/student';

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
  
  // For "Other Registration Form" type, only show basic columns
  if (reportOptions.reportType === '3') {
    return baseColumns;
  }
  
  // For other report types, use existing logic
  const additionalColumns = [];
  if (reportOptions.additionalFields.gender) additionalColumns.push('เพศ');
  if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
  if (reportOptions.additionalFields.signature) additionalColumns.push('ลายมือชื่อ');
  if (reportOptions.additionalFields.guardianSignature) additionalColumns.push('ลายเซ็นผู้ปกครอง');
  if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลามา');
  if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลากลับ');
  if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');

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

export const getReportTitle = (reportOptions: ReportOptions) => {
  switch (reportOptions.reportType) {
    case '1':
      return 'รายชื่อนักเรียนโรงเรียนบ้านดอนมูล';
    case '2':
      return 'แบบลงทะเบียนโครงการยกระดับผลสัมฤทธิ์ทางการเรียนรู้';
    case '3':
      return 'แบบลงทะเบียนโรงเรียนบ้านดอนมูล';
    default:
      return 'รายงานนักเรียนโรงเรียนบ้านดอนมูล';
  }
};
