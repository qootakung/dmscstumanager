
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';

export const formatThaiDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

export const generateTeacherExcel = (
  teachers: Teacher[],
  reportOptions: TeacherReportOptions
) => {
  const filteredTeachers = teachers
    .filter(teacher => teacher.academicYear === reportOptions.academicYear)
    .sort((a, b) => {
      const aNum = parseInt(a.positionNumber) || 0;
      const bNum = parseInt(b.positionNumber) || 0;
      return aNum - bNum;
    });

  // สร้างหัวเรื่อง
  const headerData = [
    [reportOptions.reportType === '1' 
      ? 'รายชื่อข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล' 
      : 'แบบลงทะเบียนการประชุมข้าราชการครูและบุคลากรทางการศึกษาโรงเรียนบ้านดอนมูล'
    ],
    [`ปีการศึกษา ${reportOptions.academicYear}`],
  ];

  if (reportOptions.showDate && reportOptions.selectedDate) {
    headerData.push([`วันที่ ${formatThaiDate(reportOptions.selectedDate)}`]);
  }

  headerData.push([]);

  // สร้างคอลัมน์พื้นฐาน
  const baseColumns = [
    'ลำดับที่',
    'ชื่อ - นามสกุล',
  ];

  // เพิ่มคอลัมน์เพิ่มเติมที่เลือก
  const additionalColumns = [];
  if (reportOptions.additionalFields.position) additionalColumns.push('ตำแหน่ง');
  if (reportOptions.additionalFields.email) additionalColumns.push('Email');
  if (reportOptions.additionalFields.citizenId) additionalColumns.push('เลขบัตรประจำตัวประชาชน');
  if (reportOptions.additionalFields.salary) additionalColumns.push('เงินเดือน');
  if (reportOptions.additionalFields.birthDate) additionalColumns.push('วัน/เดือน/ปีเกิด');
  if (reportOptions.additionalFields.appointmentDate) additionalColumns.push('วันที่บรรจุ');
  if (reportOptions.additionalFields.education) additionalColumns.push('วุฒิการศึกษา');
  if (reportOptions.additionalFields.major) additionalColumns.push('วิชาเอก');
  if (reportOptions.additionalFields.phone) additionalColumns.push('เบอร์โทร');
  if (reportOptions.additionalFields.lineId) additionalColumns.push('ID Line');

  // เพิ่มคอลัมน์ว่างตามจำนวนที่ระบุ
  const customColumns = [];
  if (reportOptions.customColumns && reportOptions.customColumns > 0) {
    for (let i = 1; i <= reportOptions.customColumns; i++) {
      customColumns.push('');
    }
  }

  const allColumns = [...baseColumns, ...additionalColumns, ...customColumns];

  // สร้างข้อมูลสำหรับ Excel
  const excelData = [
    ...headerData,
    allColumns,
    ...filteredTeachers.map((teacher, index) => {
      const row: (string|number)[] = [
        index + 1,
        `${teacher.firstName} ${teacher.lastName}`,
      ];

      if (reportOptions.additionalFields.position) row.push(teacher.position);
      if (reportOptions.additionalFields.email) row.push(teacher.email || '');
      if (reportOptions.additionalFields.citizenId) row.push(teacher.citizenId);
      if (reportOptions.additionalFields.salary) row.push(teacher.salary);
      if (reportOptions.additionalFields.birthDate) row.push(formatThaiDate(teacher.birthDate));
      if (reportOptions.additionalFields.appointmentDate) row.push(formatThaiDate(teacher.appointmentDate));
      if (reportOptions.additionalFields.education) row.push(teacher.education);
      if (reportOptions.additionalFields.major) row.push(teacher.majorSubject);
      if (reportOptions.additionalFields.phone) row.push(teacher.phone);
      if (reportOptions.additionalFields.lineId) row.push(teacher.lineId);

      for (let i = 0; i < (reportOptions.customColumns || 0); i++) {
        row.push('');
      }

      return row;
    })
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, 'รายงานข้อมูลครู');
  const wbbuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([new Uint8Array(wbbuf)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `teacher-report-${Date.now()}.xlsx`);
};
