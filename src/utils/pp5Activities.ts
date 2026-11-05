// กิจกรรมพัฒนาผู้เรียน (ปพ.5) — ค่าคงที่และตัวประเมินผ่าน/ไม่ผ่านที่ใช้ร่วมกันทุกหน้า
// หน้าประเมินกิจกรรม (StudentActivityAssessment) และหน้าตัดสินผลการเรียน ต้องใช้กติกาเดียวกัน

export type ActivityKeyName = 'guidance' | 'scout' | 'club' | 'social';

export interface ActivityDefinition {
  key: ActivityKeyName;
  name: string;
  short: string;
  hours: number;
}

export const ACTIVITY_DEFS: ActivityDefinition[] = [
  { key: 'guidance', name: 'กิจกรรมแนะแนว', short: 'แนะแนว', hours: 40 },
  { key: 'scout', name: 'กิจกรรมลูกเสือ เนตรนารี ยุวกาชาด', short: 'ลูกเสือฯ', hours: 40 },
  { key: 'club', name: 'กิจกรรมชุมนุม/ชมรม', short: 'ชุมนุม', hours: 40 },
  { key: 'social', name: 'กิจกรรมเพื่อสังคมและสาธารณประโยชน์', short: 'เพื่อสังคม', hours: 10 },
];

/** เข้าร่วมไม่น้อยกว่า 80% ของจำนวนชั่วโมง = ผ่าน (ผ.) */
export const ACTIVITY_PASS_THRESHOLD = 0.8;

export const activityStorageKey = (grade: string, academicYear: string, semester: string) =>
  `pp5-student-activity-${grade}-${academicYear}-${semester}`;

/** ผ่านหรือไม่ จากจำนวนชั่วโมงที่เข้าร่วม / ชั่วโมงทั้งหมด (สูตรเดียวกับหน้าประเมินกิจกรรม) */
export const isActivityPassed = (attended: number, total: number): boolean =>
  total > 0 && attended / total >= ACTIVITY_PASS_THRESHOLD;

export interface StudentActivityResult {
  /** key กิจกรรม -> ผ่านหรือไม่ */
  byActivity: Record<ActivityKeyName, boolean>;
  /** ชื่อสั้นของกิจกรรมที่ไม่ผ่าน (มผ.) */
  failedShortNames: string[];
  allPassed: boolean;
}

/**
 * อ่านผลกิจกรรมของนักเรียนจาก localStorage
 * นักเรียนที่ยังไม่มีข้อมูลรายชั่วโมง ถือว่าผ่าน (ตรงกับค่าเริ่มต้นของหน้าประเมินกิจกรรมที่ติ๊กผ่านทุกชั่วโมง)
 * @param studentKeys รายการ key ของนักเรียนตามที่หน้ากิจกรรมใช้ คือ studentId || id
 */
export const loadActivityResults = (
  grade: string,
  academicYear: string,
  semester: string,
  studentKeys: string[],
): Record<string, StudentActivityResult> => {
  let scores: Record<string, Record<string, number[]>> = {};
  try {
    const raw = localStorage.getItem(activityStorageKey(grade, academicYear, semester));
    if (raw) scores = JSON.parse(raw)?.scores || {};
  } catch {
    scores = {};
  }

  const out: Record<string, StudentActivityResult> = {};
  studentKeys.forEach(key => {
    const byActivity = {} as Record<ActivityKeyName, boolean>;
    const failedShortNames: string[] = [];
    ACTIVITY_DEFS.forEach(def => {
      const row = scores?.[def.key]?.[key];
      // แถวข้อมูลที่ความยาวไม่ตรงกับจำนวนชั่วโมง ถือว่ายังไม่ได้กรอก (หน้าประเมินกิจกรรมก็ทำแบบนี้)
      const valid = Array.isArray(row) && row.length === def.hours;
      const attended = valid ? row.reduce((a, b) => a + (b === 1 ? 1 : 0), 0) : def.hours;
      const pass = isActivityPassed(attended, def.hours);
      byActivity[def.key] = pass;
      if (!pass) failedShortNames.push(def.short);
    });
    out[key] = { byActivity, failedShortNames, allPassed: failedShortNames.length === 0 };
  });
  return out;
};
