
export interface Teacher {
  id: string;
  positionNumber: string;
  firstName: string;
  lastName: string;
  position: 'ครูผู้ช่วย' | 'ครู ยังไม่มีวิทยฐานะ' | 'ครู วิทยฐานะครูชำนาญการ' | 'ครู วิทยฐานะครูชำนาญการพิเศษ' | 'ครู วิทยฐานะครูเชี่ยวชาญ' | 'ครู วิทยฐานะครูเชี่ยวชาญพิเศษ' | 'ผู้อำนวยการโรงเรียน' | 'นักการภารโรง' | 'ครูอัตราจ้าง' | 'เจ้าหน้าที่ธุรการ';
  appointmentDate: string;
  education: string;
  citizenId: string;
  birthDate: string;
  scoutLevel: string;
  majorSubject: string;
  salary: string;
  phone: string;
  lineId: string;
  email?: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export type TeacherPosition = Teacher['position'];

export interface TeacherReportOptions {
  reportType: '1' | '2'; // 1 = ข้อมูลครู, 2 = แบบลงทะเบียนการประชุม
  academicYear: string;
  additionalFields: {
    email: boolean;
    citizenId: boolean;
    salary: boolean;
    birthDate: boolean;
    position: boolean;
    education: boolean;
    majorSubject: boolean;
    phone: boolean;
    lineId: boolean;
  };
  customColumns: number;
}
