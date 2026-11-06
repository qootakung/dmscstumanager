// Shared PP.5 grade computation helpers
// Reads the same localStorage data written by IndicatorScoreEntry / ElectiveScoreEntry / ScoreRatioConfig
import { allSubjectGroups } from '@/data/curriculumIndicators';
import type { Student } from '@/types/student';

export interface PP5SubjectDef {
  menuId: string;
  groupId: string | null;
  strandFilter?: (s: string) => boolean;
  name: string;
  shortName: string;
  credit: number;
  category: 'core' | 'elective';
}

export const PP5_SUBJECTS: PP5SubjectDef[] = [
  { menuId: 'thai', groupId: 'thai', name: 'ภาษาไทย', shortName: 'ภาษาไทย', credit: 5.0, category: 'core' },
  { menuId: 'math', groupId: 'math', name: 'คณิตศาสตร์', shortName: 'คณิตศาสตร์', credit: 5.0, category: 'core' },
  { menuId: 'science', groupId: 'science', name: 'วิทยาศาสตร์และเทคโนโลยี', shortName: 'วิทยาศาสตร์ฯ', credit: 2.0, category: 'core' },
  { menuId: 'social', groupId: 'social', strandFilter: (s: string) => !s.includes('ประวัติศาสตร์'), name: 'สังคมศึกษา ศาสนาและวัฒนธรรม', shortName: 'สังคมศึกษาฯ', credit: 1.0, category: 'core' },
  { menuId: 'history', groupId: 'social', strandFilter: (s: string) => s.includes('ประวัติศาสตร์'), name: 'ประวัติศาสตร์', shortName: 'ประวัติศาสตร์', credit: 1.0, category: 'core' },
  { menuId: 'health', groupId: 'health', name: 'สุขศึกษาและพลศึกษา', shortName: 'สุขศึกษาฯ', credit: 1.0, category: 'core' },
  { menuId: 'art', groupId: 'arts', name: 'ศิลปะ', shortName: 'ศิลปะ', credit: 1.0, category: 'core' },
  { menuId: 'career', groupId: 'career', name: 'การงานอาชีพ', shortName: 'การงานอาชีพ', credit: 1.0, category: 'core' },
  { menuId: 'english', groupId: 'english', name: 'ภาษาอังกฤษ', shortName: 'ภาษาอังกฤษ', credit: 4.0, category: 'core' },
  { menuId: 'anti-corruption', groupId: null, name: 'ป้องกันการทุจริต', shortName: 'ป้องกันทุจริต', credit: 1.0, category: 'elective' },
  { menuId: 'english-comm', groupId: null, name: 'ภาษาอังกฤษเพื่อการสื่อสาร', shortName: 'อังกฤษสื่อสาร', credit: 1.0, category: 'elective' },
];

const ELECTIVE_RATIO_GROUP: Record<string, string> = {
  'anti-corruption': 'elective-anticorrupt',
  'english-comm': 'elective-english-comm',
};

/** สัดส่วนตั้งต้นของวิชาเพิ่มเติม (ระหว่างปี 80 + ปลายปี 20) ใช้เมื่อยังไม่เคยบันทึกสัดส่วนในหน้ากำหนดสัดส่วนคะแนน
 *  ต้องตรงกับค่าตั้งต้นใน ScoreRatioConfig (buildElectiveRatios) */
export const DEFAULT_ELECTIVE_RATIO = { midYear: 80, endYear: 20 };

export const indicatorScoreKey = (menuId: string, grade: string, year: string, semester: string) =>
  `pp5-indicator-scores-${menuId}-${grade}-${year}-${semester}`;

export const electiveScoreKey = (menuId: string, grade: string, year: string, semester: string) =>
  `pp5-elective-scores-${menuId}-${grade}-${year}-${semester}`;

export const ratioKey = (grade: string, year: string, semester: string) =>
  `pp5-score-ratio-${grade}-${year}-${semester}`;

export const calculateGradeLevel = (score100: number): number => {
  if (score100 >= 80) return 4;
  if (score100 >= 75) return 3.5;
  if (score100 >= 70) return 3;
  if (score100 >= 65) return 2.5;
  if (score100 >= 60) return 2;
  if (score100 >= 55) return 1.5;
  if (score100 >= 50) return 1;
  return 0;
};

/**
 * ปัดเศษแบบ "ครึ่งขึ้น" เหมือน ROUND ของ Excel (ใช้ toPrecision กันปัญหาทศนิยมฐานสอง เช่น 17.85 -> 17.9)
 */
export const roundHalfUp = (value: number, digits = 0): number => {
  if (!Number.isFinite(value)) return 0;
  const f = Math.pow(10, digits);
  return Math.round(Number((value * f).toPrecision(12))) / f;
};

/**
 * คะแนนต่อ 1 มาตรฐาน = (คะแนนรวมตัวชี้วัด / (จำนวนตัวชี้วัด x คะแนนเต็มต่อตัวชี้วัด)) x น้ำหนัก ปัด 1 ตำแหน่ง
 * (ตรงกับสูตรชีต "ไทย." ใน Excel ต้นแบบ)
 */
export const standardScore = (sum: number, indicatorCount: number, maxPerIndicator: number, weight: number): number => {
  const totalMax = indicatorCount * maxPerIndicator;
  if (!weight || totalMax <= 0) return 0;
  return roundHalfUp((sum / totalMax) * weight, 1);
};

export interface FinalScore {
  mid: number;     // คะแนนระหว่างปี (ปัดเป็นจำนวนเต็ม)
  end: number;     // คะแนนปลายปี (ปัดเป็นจำนวนเต็ม)
  total: number;   // รวม
  percent: number; // ร้อยละของคะแนนเต็ม (grand)
  grade: number;   // ระดับผลการเรียน
}

/**
 * จุดคำนวณกลางของ ปพ.5: ทุกหน้าต้องเรียกฟังก์ชันนี้เพื่อให้ได้เกรดตรงกัน
 * กติกาเดียวกับ Excel: ปัดคะแนนระหว่างปีและปลายปีเป็นจำนวนเต็มก่อนรวม แล้วจึงตัดเกรด
 * ถ้าต้องการเปลี่ยนกติกาการปัดเศษ แก้ที่ฟังก์ชันนี้ที่เดียว
 */
export const finalizeScore = (midRaw: number, endRaw: number, grand: number): FinalScore => {
  const mid = roundHalfUp(midRaw, 0);
  const end = roundHalfUp(endRaw, 0);
  const total = mid + end;
  const percent = grand > 0 ? (total / grand) * 100 : 0;
  return { mid, end, total, percent, grade: grand > 0 ? calculateGradeLevel(percent) : 0 };
};

// ---------------------------------------------------------------------------
// สัดส่วนคะแนน: แยก "ประวัติศาสตร์" ออกจาก "สังคมศึกษาฯ" ให้แต่ละวิชารวมระหว่างปี + ปลายปี = 100
// ---------------------------------------------------------------------------
export const HISTORY_RATIO_GROUP_ID = 'history';

/** กระจายคะแนนให้รวมเป็น target (จำนวนเต็ม) ตามสัดส่วนเดิม ด้วยวิธี largest remainder */
const scaleWeights = (weights: number[], target: number): number[] => {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0 || target <= 0) return weights.map(() => 0);
  const exact = weights.map(w => (w * target) / sum);
  const floors = exact.map(Math.floor);
  let rest = target - floors.reduce((a, b) => a + b, 0);
  exact
    .map((v, i) => ({ i, frac: v - Math.floor(v), w: weights[i] }))
    .filter(x => x.w > 0)
    .sort((a, b) => b.frac - a.frac)
    .forEach(x => { if (rest > 0) { floors[x.i] += 1; rest -= 1; } });
  return floors;
};

const rescaleGroupToHundred = (group: any): any => {
  const stds = (group.strands || []).flatMap((st: any) => st.standards || []);
  const target = Math.max(0, 100 - (Number(group.endYearScore) || 0));
  const scaled = scaleWeights(stds.map((s: any) => Number(s.score) || 0), target);
  let k = 0;
  const strands = (group.strands || []).map((st: any) => ({
    ...st,
    standards: (st.standards || []).map((s: any) => ({ ...s, score: scaled[k++] })),
  }));
  return { ...group, strands, midYearTotal: scaled.reduce((a, b) => a + b, 0) };
};

/**
 * แยกกลุ่ม 'social' (ที่มีสาระประวัติศาสตร์ปนอยู่) เป็น 2 กลุ่ม: social และ history
 * แล้วปรับน้ำหนักของแต่ละกลุ่มให้ระหว่างปี = 100 - ปลายปี  คืนค่าเป็นอาร์เรย์ของกลุ่ม
 */
export const splitSocialRatioGroup = (social: any): any[] => {
  const isHistory = (st: any) => String(st.strandName || '').includes('ประวัติศาสตร์');
  const historyStrands = (social.strands || []).filter(isHistory);
  const socialStrands = (social.strands || []).filter((st: any) => !isHistory(st));
  const out: any[] = [];
  if (socialStrands.length > 0) {
    out.push(rescaleGroupToHundred({ ...social, strands: socialStrands }));
  }
  if (historyStrands.length > 0) {
    out.push(rescaleGroupToHundred({
      ...social,
      groupId: HISTORY_RATIO_GROUP_ID,
      groupName: 'ประวัติศาสตร์',
      strands: historyStrands,
    }));
  }
  return out;
};

/** รองรับข้อมูลเก่าที่ยังเก็บสังคม+ประวัติศาสตร์ไว้กลุ่มเดียว */
export const migrateRatioGroups = (ratios: any[]): any[] => {
  if (!Array.isArray(ratios)) return [];
  if (ratios.some(g => g?.groupId === HISTORY_RATIO_GROUP_ID)) return ratios;
  const out: any[] = [];
  ratios.forEach(g => {
    const hasHistory = g?.groupId === 'social' &&
      (g.strands || []).some((st: any) => String(st.strandName || '').includes('ประวัติศาสตร์'));
    if (hasHistory) out.push(...splitSocialRatioGroup(g));
    else out.push(g);
  });
  return out;
};

/** หากลุ่มสัดส่วนของรายวิชา (ประวัติศาสตร์ใช้กลุ่ม 'history' ของตัวเอง) */
export const findRatioGroup = (ratios: any[], menuId: string | undefined, groupId: string | null | undefined): any | undefined => {
  const id = menuId === 'history' ? HISTORY_RATIO_GROUP_ID : groupId;
  if (!id) return undefined;
  return migrateRatioGroups(ratios).find((g: any) => g?.groupId === id);
};

// ---------------------------------------------------------------------------
// หน่วยกิต = ชั่วโมงต่อปี / 40  (อ่านจากข้อมูลพื้นฐานของชั้นนั้น ถ้าไม่มีใช้ค่าตั้งต้นตาม Excel)
// ---------------------------------------------------------------------------
const BASIC_INFO_SUBJECT_ID: Record<string, string> = {
  'anti-corruption': 'anticorrupt',
  'english-comm': 'english2',
};

export const gradeLabel = (g: number): string => {
  if (g >= 4) return 'ดีเยี่ยม';
  if (g >= 3.5) return 'ดีมาก';
  if (g >= 3) return 'ดี';
  if (g >= 2.5) return 'ค่อนข้างดี';
  if (g >= 2) return 'พอใช้';
  if (g >= 1.5) return 'พอใช้';
  if (g >= 1) return 'ผ่านเกณฑ์ขั้นต่ำ';
  return 'ไม่ผ่าน';
};

const readJSON = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};

export interface PP5StudentSubjectResult {
  score100: number;
  grade: number;
  hasData: boolean;
}

export interface PP5SubjectResult {
  def: PP5SubjectDef;
  results: Record<string, PP5StudentSubjectResult>; // by student.id
}

/** หน่วยกิตของรายวิชา: ชั่วโมง/ปี (จากข้อมูลพื้นฐานของชั้น) หาร 40 ถ้าไม่มีข้อมูลใช้ค่าตั้งต้น */
export const resolveCredit = (def: PP5SubjectDef, grade: string, academicYear: string, semester: string): number => {
  const info = getBasicInfo(grade, academicYear, semester);
  const wantedId = BASIC_INFO_SUBJECT_ID[def.menuId] || def.menuId;
  const hours = Array.isArray(info?.subjects)
    ? Number(info.subjects.find((x: any) => x?.id === wantedId)?.hoursPerYear)
    : NaN;
  return Number.isFinite(hours) && hours > 0 ? hours / 40 : def.credit;
};

/** Compute the 100-based score and grade of every student for every PP.5 subject. */
export const computeSubjectResults = (
  students: Student[],
  gradeKey: string,
  academicYear: string,
  semester: string,
): PP5SubjectResult[] => {
  const ratioData = migrateRatioGroups(readJSON<any[]>(ratioKey(gradeKey, academicYear, semester), []));

  // วิชาเพิ่มเติมที่ครูเพิ่มเองในหน้าข้อมูลพื้นฐาน (เช่น วิทย์พลังสิบ) ให้รวมในการคำนวณ/สรุปผลด้วย
  const info = getBasicInfo(gradeKey, academicYear, semester);
  const customDefs: PP5SubjectDef[] = Array.isArray(info?.subjects)
    ? info.subjects
        .filter((x: any) => typeof x?.id === 'string' && x.id.startsWith('custom-elective-'))
        .map((x: any): PP5SubjectDef => ({
          menuId: x.id,
          groupId: null,
          name: x.name || 'รายวิชาเพิ่มเติม',
          shortName: x.shortName || x.name || 'วิชาเพิ่มเติม',
          credit: Number(x.hoursPerYear) > 0 ? Number(x.hoursPerYear) / 40 : 1.0,
          category: 'elective',
        }))
    : [];

  return [...PP5_SUBJECTS, ...customDefs].map(baseDef => {
    const def: PP5SubjectDef = { ...baseDef, credit: resolveCredit(baseDef, gradeKey, academicYear, semester) };
    const results: Record<string, PP5StudentSubjectResult> = {};

    if (def.category === 'elective') {
      const data = readJSON<any>(electiveScoreKey(def.menuId, gradeKey, academicYear, semester), null);
      const group = ratioData.find((g: any) => g.groupId === (ELECTIVE_RATIO_GROUP[def.menuId] ?? def.menuId));
      // คะแนนดิบ (จำนวนผลการเรียนรู้ × 10) ถูกปรับเป็นสัดส่วนระหว่างปีเสมอ เช่น สอน 4 หน่วย (เต็ม 40) → 80
      const midTarget = group?.midYearTotal || DEFAULT_ELECTIVE_RATIO.midYear;
      const endTarget = group?.endYearScore || data?.endYearMaxScore || DEFAULT_ELECTIVE_RATIO.endYear;
      const outcomes = data?.learningOutcomes || 8; // ต้องตรงกับค่าตั้งต้นในหน้ากรอกคะแนน
      const rawMax = outcomes * (data?.maxScorePerOutcome || 10);
      const totalMax = (midTarget || rawMax) + endTarget;

      students.forEach(st => {
        const s = data?.studentScores?.[st.id];
        if (!s) { results[st.id] = { score100: 0, grade: 0, hasData: false }; return; }
        let raw = 0;
        for (let i = 1; i <= outcomes; i++) raw += Number(s.outcomes?.[String(i)] ?? 0);
        const mid = midTarget && rawMax ? (raw * midTarget) / rawMax : raw;
        const fin = finalizeScore(mid, Number(s.endYearScore ?? 0), totalMax);
        results[st.id] = {
          score100: parseFloat(fin.percent.toFixed(2)),
          grade: fin.grade,
          hasData: true,
        };
      });
      return { def, results };
    }

    // Core subjects — indicator based
    const scoreData = readJSON<any>(indicatorScoreKey(def.menuId, gradeKey, academicYear, semester), {
      maxScorePerIndicator: 10,
      studentScores: {},
    });

    let midYearWeight = 0;
    let endYearWeight = 0;
    const standardWeights: Record<string, number> = {};
    const matchingGroup = findRatioGroup(ratioData, def.menuId, def.groupId);
    if (matchingGroup) {
      endYearWeight = matchingGroup.endYearScore || 0;
      matchingGroup.strands?.forEach((strand: any) => {
        if (def.strandFilter && !def.strandFilter(strand.strandName)) return;
        strand.standards?.forEach((std: any) => {
          standardWeights[std.standardCode] = std.score;
          midYearWeight += std.score;
        });
      });
    }
    const grandTotalWeight = midYearWeight + endYearWeight;

    const group = def.groupId ? allSubjectGroups.find(g => g.id === def.groupId) : null;
    const indicatorGroups: { weight: number; indicatorIds: string[] }[] = [];
    group?.subjects.forEach(sub => {
      if (def.strandFilter && !def.strandFilter(sub.strand)) return;
      sub.standards.forEach(standard => {
        const inds = standard.indicators[gradeKey];
        if (!inds || inds.length === 0) return;
        indicatorGroups.push({
          weight: standardWeights[standard.code] || 0,
          indicatorIds: inds.map(i => i.id),
        });
      });
    });

    students.forEach(st => {
      const ss = scoreData.studentScores?.[st.id];
      if (!ss) { results[st.id] = { score100: 0, grade: 0, hasData: false }; return; }
      let midYearTotal = 0;
      indicatorGroups.forEach(ig => {
        if (!ig.weight) return;
        const sum = ig.indicatorIds.reduce((acc, id) => acc + (ss.indicators?.[id] ?? 0), 0);
        midYearTotal += standardScore(sum, ig.indicatorIds.length, scoreData.maxScorePerIndicator || 10, ig.weight);
      });
      const fin = finalizeScore(midYearTotal, ss.endYearScore ?? 0, grandTotalWeight);
      results[st.id] = {
        score100: parseFloat(fin.percent.toFixed(2)),
        grade: fin.grade,
        hasData: true,
      };
    });

    return { def, results };
  });
};

/** Load the students of one class (deduplicated + sorted by student number). */
export const sortStudents = (list: Student[]): Student[] => {
  const seen = new Set<string>();
  const unique = list.filter(s => {
    const k = s.studentId || s.id;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return unique.sort((a, b) => (parseInt(a.studentId || '0') || 0) - (parseInt(b.studentId || '0') || 0));
};

export const fullName = (s: Student) => `${s.titleTh || ''}${s.firstNameTh || ''} ${s.lastNameTh || ''}`.trim();

/** School / class basic info saved by BasicInfoEntry */
export const getBasicInfo = (grade: string, academicYear: string, semester: string): any => {
  const gradeNum = grade.replace('ป.', '');
  return readJSON<any>(`pp5-basic-ป.${gradeNum}-${academicYear}-${semester}`, null);
};
