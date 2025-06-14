
import { z } from 'zod';

export const positionOptions = [
  'ครูผู้ช่วย',
  'ครู ยังไม่มีวิทยฐานะ',
  'ครู วิทยฐานะครูชำนาญการ',
  'ครู วิทยฐานะครูชำนาญการพิเศษ',
  'ครู วิทยฐานะครูเชี่ยวชาญ',
  'ครู วิทยฐานะครูเชี่ยวชาญพิเศษ',
  'ผู้อำนวยการโรงเรียน',
  'นักการภารโรง',
  'ครูอัตราจ้าง',
  'เจ้าหน้าที่ธุรการ'
] as const;


export const teacherSchema = z.object({
  positionNumber: z.string().min(1, "กรุณากรอกเลขตำแหน่ง"),
  academicYear: z.string().optional(),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  position: z.enum(positionOptions).optional(),
  appointmentDate: z.date().optional().nullable(),
  education: z.string().optional(),
  citizenId: z.string().length(13, "เลขบัตรประชาชนต้องมี 13 หลัก").optional().or(z.literal('')),
  birthDate: z.date().optional().nullable(),
  scoutLevel: z.string().optional(),
  majorSubject: z.string().optional(),
  salary: z.string().regex(/^\d*$/, "กรุณากรอกเป็นตัวเลข").optional(),
  phone: z.string().optional(),
  lineId: z.string().optional(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal('')),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
