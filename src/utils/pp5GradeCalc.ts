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
  { menuId: 'english', groupId: 'english', name: 'ภาษาอังกฤษ', shortName: 'ภาษาอังกฤษ', credit: 1.0, category: 'core' },
  { menuId: 'anti-corruption', groupId: null, name: 'ป้องกันการทุจริต', shortName: 'ป้องกันทุจริต', credit: 1.0, category: 'elective' },
  { menuId: 'english-comm', groupId: null, name: 'ภาษาอังกฤษเพื่อการสื่อสาร', shortName: 'อังกฤษสื่อสาร', credit: 1.0, category: 'elective' },
];

const ELECTIVE_RATIO_GROUP: Record<string, string> = {
  'anti-corruption': 'elective-anticorrupt',
  'english-comm': 'elective-english-comm',
};

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

/** Compute the 100-based score and grade of every student for every PP.5 subject. */
export const computeSubjectResults = (
  students: Student[],
  gradeKey: string,
  academicYear: string,
  semester: string,
): PP5SubjectResult[] => {
  const ratioData = readJSON<any[]>(ratioKey(gradeKey, academicYear, semester), []);

  return PP5_SUBJECTS.map(def => {
    const results: Record<string, PP5StudentSubjectResult> = {};

    if (def.category === 'elective') {
      const data = readJSON<any>(electiveScoreKey(def.menuId, gradeKey, academicYear, semester), null);
      const group = ratioData.find((g: any) => g.groupId === ELECTIVE_RATIO_GROUP[def.menuId]);
      const midTarget = group?.midYearTotal || 0;
      const endTarget = group?.endYearScore || data?.endYearMaxScore || 0;
      const outcomes = data?.learningOutcomes || 8;
      const rawMax = outcomes * (data?.maxScorePerOutcome || 10);
      const totalMax = (midTarget || rawMax) + endTarget;

      students.forEach(st => {
        const s = data?.studentScores?.[st.id];
        if (!s) { results[st.id] = { score100: 0, grade: 0, hasData: false }; return; }
        let raw = 0;
        for (let i = 1; i <= outcomes; i++) raw += Number(s.outcomes?.[String(i)] ?? 0);
        const mid = midTarget && rawMax ? (raw * midTarget) / rawMax : raw;
        const total = mid + Number(s.endYearScore ?? 0);
        const score100 = totalMax > 0 ? (total / totalMax) * 100 : 0;
        results[st.id] = {
          score100: parseFloat(score100.toFixed(2)),
          grade: calculateGradeLevel(score100),
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
    const matchingGroup = ratioData.find((r: any) => r.groupId === def.groupId);
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
        const totalMax = ig.indicatorIds.length * (scoreData.maxScorePerIndicator || 10);
        if (!totalMax) return;
        const sum = ig.indicatorIds.reduce((acc, id) => acc + (ss.indicators?.[id] ?? 0), 0);
        midYearTotal += (sum / totalMax) * ig.weight;
      });
      const total = midYearTotal + (ss.endYearScore ?? 0);
      const score100 = grandTotalWeight > 0 ? (total / grandTotalWeight) * 100 : 0;
      results[st.id] = {
        score100: parseFloat(score100.toFixed(2)),
        grade: calculateGradeLevel(score100),
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
