import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import type { Teacher, TeacherPosition } from '@/types/teacher';

const TEACHER_POSITIONS: ReadonlyArray<TeacherPosition> = [
  'ครูผู้ช่วย', 'ครู ยังไม่มีวิทยฐานะ', 'ครู วิทยฐานะครูชำนาญการ',
  'ครู วิทยฐานะครูชำนาญการพิเศษ', 'ครู วิทยฐานะครูเชี่ยวชาญ', 'ครู วิทยฐานะครูเชี่ยวชาญพิเศษ',
  'ผู้อำนวยการโรงเรียน', 'นักการภารโรง', 'ครูอัตราจ้าง', 'เจ้าหน้าที่ธุรการ'
];

const isTeacherPosition = (value: any): value is TeacherPosition => {
  return TEACHER_POSITIONS.includes(value);
};

const toDateString = (date: any): string => {
  if (!date) return '';
  try {
    const d = xlsx.SSF.parse_date_code(date);
    const jsDate = new Date(d.y, d.m - 1, d.d, d.H, d.M, d.S);
    if (isNaN(jsDate.getTime())) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return '';
      return parsed.toISOString();
    }
    return jsDate.toISOString();
  } catch (e) {
    return '';
  }
};

export const importTeachersFromExcel = (file: File): Promise<{ data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[], errors: { row: number, message: string }[] }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = xlsx.read(data, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: true }) as any[][];

      const teachers: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      const errors: { row: number, message: string }[] = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.filter(cell => cell !== null && cell !== undefined && cell !== '').length === 0) continue;

        const position = row[3] ? String(row[3]).trim() : '';

        if (!isTeacherPosition(position)) {
          errors.push({ row: i + 1, message: `ตำแหน่ง "${position || ''}" ในแถวที่ ${i + 1} ไม่ถูกต้อง` });
          continue;
        }

        teachers.push({
          positionNumber: String(row[0] || ''),
          firstName: String(row[1] || ''),
          lastName: String(row[2] || ''),
          position: position,
          appointmentDate: toDateString(row[4]),
          education: String(row[5] || ''),
          citizenId: String(row[6] || ''),
          birthDate: toDateString(row[7]),
          scoutLevel: String(row[8] || ''),
          majorSubject: String(row[9] || ''),
          salary: String(row[10] || ''),
          phone: String(row[11] || ''),
          lineId: String(row[12] || ''),
          email: String(row[13] || ''),
          academicYear: String(row[14] || ''),
        });
      }

      resolve({ data: teachers, errors });
    };
    reader.readAsArrayBuffer(file);
  });
};

export const downloadTeacherTemplate = () => {
    const headers = [
        'เลขที่ตำแหน่ง', 'ชื่อ', 'นามสกุล', 'ตำแหน่ง', 'วัน/เดือน/ปี ที่บรรจุ (ค.ศ.)',
        'วุฒิการศึกษา', 'เลขบัตรประชาชน', 'วัน/เดือน/ปี เกิด (ค.ศ.)', 'วุฒิทางลูกเสือ', 'วิชาเอก',
        'เงินเดือน', 'เบอร์โทร', 'Line ID', 'Email', 'ปีการศึกษา'
    ];
    const exampleData = [
        ['1234', 'สมชาย', 'ใจดี', 'ครูผู้ช่วย', '2023-05-15', 'ปริญญาตรี', '1234567890123', '1990-01-01', 'B.T.C', 'คณิตศาสตร์', '15000', '0812345678', 'somchai.j', 'somchai.j@example.com', '2567']
    ];

    const wb = xlsx.utils.book_new();

    const ws_data = xlsx.utils.aoa_to_sheet([headers, ...exampleData]);
    xlsx.utils.book_append_sheet(wb, ws_data, 'ข้อมูลครู');

    const ws_positions = xlsx.utils.aoa_to_sheet([['ตำแหน่งที่ถูกต้อง'], ...TEACHER_POSITIONS.map(p => [p])]);
    xlsx.utils.book_append_sheet(wb, ws_positions, 'รายชื่อตำแหน่ง');
    
    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'template-teacher-import.xlsx');
};
