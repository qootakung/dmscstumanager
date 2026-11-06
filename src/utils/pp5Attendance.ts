// เวลาเรียน (วัน) สำหรับตัดสิน "มส." ใน ปพ.5
// ใช้กติกาเดียวกับ Excel ต้นแบบและหน้า "แบบนับเวลาเรียน": นับเฉพาะวันที่มาเรียน ('/') เทียบกับวันเปิดเรียนทั้งภาคเรียน
// ต้องมาเรียนไม่น้อยกว่า 80% มิฉะนั้นได้ มส.
import { supabase } from '@/integrations/supabase/client';
import {
  getThaiHolidays,
  getCustomDays,
  getLockedMonths,
  getDayStatusLocked,
  getSemesterMonths,
  getDaysInMonth,
  getStartDay,
  toMonthKey,
  toDateKey,
} from '@/utils/thaiHolidays';

export const ATTENDANCE_PASS_RATIO = 0.8;

export interface StudentAttendanceResult {
  present: number;
  totalDays: number;
  percent: number;
  /** มีการบันทึกเวลาเรียนของนักเรียนคนนี้ในภาคเรียนนี้หรือไม่ (ถ้าไม่มี จะไม่ตัดสิน มส. อัตโนมัติ) */
  hasRecords: boolean;
  /** ได้ มส. = มีข้อมูล และมาเรียนน้อยกว่า 80% */
  failed: boolean;
}

export interface SemesterAttendance {
  /** เดือนของภาคเรียนที่ยังไม่ได้ล็อกวันเปิดเรียน (จำนวนวันเปิดเรียนของเดือนเหล่านี้คำนวณจากปฏิทินวันหยุดเท่านั้น อาจคลาดเคลื่อน) */
  unlockedMonths: string[];
  totalSchoolDays: number;
  minRequiredDays: number;
  /** key = รหัสนักเรียน (studentId) */
  byStudent: Record<string, StudentAttendanceResult>;
}

/** ฟังก์ชันล้วน ทดสอบได้: ผ่านเกณฑ์เมื่อ present/total >= 80% */
export const evaluateAttendance = (present: number, totalDays: number, hasRecords: boolean): StudentAttendanceResult => {
  const percent = totalDays > 0 ? (present * 100) / totalDays : 0;
  const passed = totalDays > 0 && present / totalDays >= ATTENDANCE_PASS_RATIO;
  return { present, totalDays, percent, hasRecords, failed: hasRecords && totalDays > 0 && !passed };
};

/** รายการวันเปิดเรียน (YYYY-MM-DD) ของภาคเรียน ตามปฏิทินวันหยุด วันหยุดที่กำหนดเอง และเดือนที่ล็อกไว้ */
export const listSchoolDays = (semester: string, academicYear: string): string[] => {
  const holidays = getThaiHolidays(parseInt(academicYear));
  const custom = getCustomDays(academicYear);
  const locked = getLockedMonths(academicYear);
  const days: string[] = [];
  getSemesterMonths(semester, academicYear).forEach(m => {
    const daysInMonth = getDaysInMonth(m.month, m.ceYear);
    const startDay = getStartDay(semester, m.month);
    const lockedForMonth = locked[toMonthKey(m.ceYear, m.month)] ?? null;
    for (let d = startDay; d <= daysInMonth; d++) {
      const date = new Date(m.ceYear, m.month, d);
      const st = getDayStatusLocked(date, holidays, custom, lockedForMonth);
      if (!st.weekend && !st.holiday) days.push(toDateKey(date));
    }
  });
  return days;
};

/**
 * โหลดเวลาเรียนของทั้งภาคเรียน
 * @param idsByCode รหัสนักเรียน (studentId) -> รายการ student.id ทั้งหมดของคนนั้นในชั้น/ปีนี้
 *                  (นักเรียนคนเดียวกันอาจมีระเบียนแยกตามภาคเรียน และบันทึกเวลาเรียนผูกกับ id ของระเบียนนั้น)
 */
/** เดือนในภาคเรียนที่ยังไม่ได้ล็อกวันเปิดเรียน (คืนค่าเป็น YYYY-MM) */
export const listUnlockedMonths = (semester: string, academicYear: string): string[] => {
  const locked = getLockedMonths(academicYear);
  return getSemesterMonths(semester, academicYear)
    .map(m => toMonthKey(m.ceYear, m.month))
    .filter(key => !locked[key]);
};

/** ทั้งปีการศึกษา = ภาคเรียนที่ 1 + 2 */
export const loadYearAttendance = (idsByCode: Record<string, string[]>, academicYear: string) =>
  loadSemesterAttendance(idsByCode, ['1', '2'], academicYear);

export const loadSemesterAttendance = async (
  idsByCode: Record<string, string[]>,
  semesters: string | string[],
  academicYear: string,
): Promise<SemesterAttendance> => {
  const sems = Array.isArray(semesters) ? semesters : [semesters];
  const schoolDays = sems.flatMap(sem => listSchoolDays(sem, academicYear)).sort();
  const unlockedMonths = sems.flatMap(sem => listUnlockedMonths(sem, academicYear));
  const totalSchoolDays = schoolDays.length;
  const minRequiredDays = Math.ceil(totalSchoolDays * ATTENDANCE_PASS_RATIO);
  const byStudent: Record<string, StudentAttendanceResult> = {};

  const codes = Object.keys(idsByCode);
  if (totalSchoolDays === 0 || codes.length === 0) {
    codes.forEach(c => { byStudent[c] = evaluateAttendance(0, totalSchoolDays, false); });
    return { unlockedMonths, totalSchoolDays, minRequiredDays, byStudent };
  }

  const allIds = Array.from(new Set(codes.flatMap(c => idsByCode[c])));
  const start = schoolDays[0];
  const end = schoolDays[schoolDays.length - 1];

  // ดึงเป็นหน้า ๆ ละ 1000 แถว (PostgREST จำกัดค่าเริ่มต้นไว้ที่ 1000 แถวต่อคำสั่ง)
  const statusByIdDate: Record<string, string> = {};
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('student_id, attendance_date, status')
      .in('student_id', allIds)
      .gte('attendance_date', start)
      .lte('attendance_date', end)
      .order('attendance_date', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error('Error loading attendance for grade decision:', error);
      break;
    }
    (data || []).forEach((r: any) => { statusByIdDate[`${r.student_id}_${r.attendance_date}`] = r.status; });
    if (!data || data.length < PAGE) break;
  }

  const schoolDaySet = new Set(schoolDays);
  codes.forEach(code => {
    let present = 0;
    let hasRecords = false;
    schoolDaySet.forEach(day => {
      // นักเรียนหนึ่งคนอาจมีหลาย id: ใช้สถานะแรกที่ไม่ว่างของวันนั้น
      const status = idsByCode[code].map(id => statusByIdDate[`${id}_${day}`]).find(Boolean) || '';
      if (status) hasRecords = true;
      if (status === '/') present++;
    });
    byStudent[code] = evaluateAttendance(present, totalSchoolDays, hasRecords);
  });

  return { unlockedMonths, totalSchoolDays, minRequiredDays, byStudent };
};
