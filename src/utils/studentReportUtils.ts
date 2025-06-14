
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
  const additionalColumns = [];
  if (reportOptions.additionalFields.gender) additionalColumns.push('เพศ');
  if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
  if (reportOptions.additionalFields.signature) additionalColumns.push('ลายเซ็น');
  if (reportOptions.additionalFields.guardianSignature) additionalColumns.push('ลายเซ็นผู้ปกครอง');
  if (reportOptions.additionalFields.timeIn) additionalColumns.push('เวลาเข้า');
  if (reportOptions.additionalFields.timeOut) additionalColumns.push('เวลาออก');
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
