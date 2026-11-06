// การตัดสินผลการเรียนรายบุคคล: รวมคะแนนรายวิชา เวลาเรียน (มส.) กิจกรรม (มผ.) และรายการแก้ผลการเรียน (ร/มส)
// แยกเป็นฟังก์ชันล้วนเพื่อให้ทดสอบได้ และใช้ร่วมกันทั้งหน้าจอและใบพิมพ์
import type { StudentAttendanceResult } from '@/utils/pp5Attendance';
import type { StudentActivityResult } from '@/utils/pp5Activities';

export type CellStatus = 'ร' | 'มส' | null;

/** รายการจากหน้า "แก้ 0 ร มส มผ" (เฉพาะฟิลด์ที่ใช้ตัดสิน) */
export interface FixRecordLite {
  studentId: string;
  subject: string;
  status: string;
  resultGrade: string;
}

export interface SubjectScoreInput {
  name: string;
  shortName: string;
  credit: number;
  score100: number;
  grade: number;
  hasData: boolean;
}

export interface DecisionCell {
  /** ข้อความที่แสดงในตาราง เช่น "3.5", "0", "ร", "มส" */
  display: string;
  /** ระดับผลการเรียนที่ใช้คิด GPA (null = ยังไม่มีระดับ เพราะเป็น ร หรือ มส) */
  grade: number | null;
  status: CellStatus;
  /** ไม่ผ่านรายวิชา (ได้ 0) */
  failed: boolean;
}

export type DecisionTone = 'pass' | 'fail' | 'wait';

export interface DecisionRow {
  cells: DecisionCell[];
  failedCount: number;
  msCount: number;
  rCount: number;
  activityFailed: string[];
  gpa: number;
  decision: string;
  tone: DecisionTone;
}

export const gradeText = (g: number): string => (g === 0 ? '0' : g.toFixed(1).replace('.0', ''));

const matchesSubject = (recordSubject: string, s: { name: string; shortName: string }): boolean => {
  const r = (recordSubject || '').trim();
  if (!r) return false;
  return r === s.name || r === s.shortName || s.name.includes(r) || r.includes(s.name);
};

export const decideStudent = (params: {
  studentId: string;
  subjects: SubjectScoreInput[];
  passCriteria: number;
  attendance?: StudentAttendanceResult;
  activity?: StudentActivityResult;
  fixes: FixRecordLite[];
}): DecisionRow => {
  const { studentId, subjects, passCriteria, attendance, activity, fixes } = params;
  const myFixes = fixes.filter(f => f.studentId === studentId);

  const cells: DecisionCell[] = subjects.map(s => {
    const fix = myFixes.find(f => matchesSubject(f.subject, s));
    const resolved = fix && fix.resultGrade.trim() !== '' ? parseFloat(fix.resultGrade) : NaN;

    // 1) แก้ผลการเรียนแล้ว (ใส่ระดับผลหลังแก้เป็นตัวเลข) ใช้ค่านั้นแทนทุกกรณี
    if (Number.isFinite(resolved)) {
      return { display: gradeText(resolved), grade: resolved, status: null, failed: resolved === 0 };
    }
    // 2) รายการแก้ที่ยังค้างอยู่: ร / มส
    if (fix && (fix.status === 'ร' || fix.status === 'มส')) {
      return { display: fix.status, grade: null, status: fix.status as CellStatus, failed: false };
    }
    // 3) เวลาเรียนต่ำกว่า 80% ได้ มส. ทุกรายวิชา
    if (attendance?.failed) {
      return { display: 'มส', grade: null, status: 'มส', failed: false };
    }
    // 4) ผลจากคะแนน
    const failed = s.score100 < passCriteria;
    return { display: gradeText(s.grade), grade: s.grade, status: null, failed };
  });

  const failedCount = cells.filter(c => c.failed).length;
  const msCount = cells.filter(c => c.status === 'มส').length;
  const rCount = cells.filter(c => c.status === 'ร').length;
  const activityFailed = activity?.failedShortNames ?? [];

  let creditSum = 0;
  let weighted = 0;
  cells.forEach((c, i) => {
    if (c.grade === null) return;
    creditSum += subjects[i].credit;
    weighted += c.grade * subjects[i].credit;
  });
  const gpa = creditSum > 0 ? parseFloat((weighted / creditSum).toFixed(2)) : 0;

  let decision = 'ผ่านการตัดสิน';
  let tone: DecisionTone = 'pass';
  if (failedCount > 0 || msCount > 0 || activityFailed.length > 0) {
    decision = 'ไม่ผ่าน (ต้องซ่อมเสริม)';
    tone = 'fail';
  } else if (rCount > 0) {
    decision = 'รอการตัดสิน (ร)';
    tone = 'wait';
  }

  return { cells, failedCount, msCount, rCount, activityFailed, gpa, decision, tone };
};
