
export interface PP5BasicInfo {
  // General Info - simplified
  gradeLevel: string; // ประถมศึกษาปีที่ 1-6
  semester: string;
  room: string;
  academicYear: string;
  approvalDate: string;
  homeTeacher1: string;
  homeTeacher2: string;
  
  // School Info
  schoolName: string;
  subDistrict: string;
  district: string;
  province: string;
  educationCenter: string;
  primaryEducationArea: string;
  supervisor: string;
  assessmentEvaluator: string;
  academicHead: string;
  administratorName: string;
  administratorPosition: string;
}

export interface SubjectInfo {
  id: string;
  code: string;
  name: string;
  shortName: string;
  hoursPerWeek: number;
  hoursPerYear: number;
  passingCriteria: number;
  teacherId: string;
  teacherName: string;
  subjectCode: string;
  endTermRatio: number;
  midTermRatio: number;
  category: 'core' | 'elective' | 'activity';
}

export interface AcademicCalendar {
  semester1Months: string[];
  semester2Months: string[];
}

// Grade level options for ป.1-6
export const GRADE_LEVEL_OPTIONS = [
  { value: '1', label: 'ประถมศึกษาปีที่ 1' },
  { value: '2', label: 'ประถมศึกษาปีที่ 2' },
  { value: '3', label: 'ประถมศึกษาปีที่ 3' },
  { value: '4', label: 'ประถมศึกษาปีที่ 4' },
  { value: '5', label: 'ประถมศึกษาปีที่ 5' },
  { value: '6', label: 'ประถมศึกษาปีที่ 6' },
];

// Subject code mapping based on 2551 Basic Education Core Curriculum
// Format: [prefix][grade level][subject type][sequence]
// Example: ท11101 = ภาษาไทย, ป.1, พื้นฐาน, ลำดับที่ 1
export const getSubjectCodeForGrade = (subjectId: string, gradeLevel: string): string => {
  const gradeNum = gradeLevel;
  
  const subjectCodeMap: Record<string, { prefix: string; suffix: string }> = {
    // Core subjects - พื้นฐาน (101)
    'thai': { prefix: 'ท', suffix: '101' },
    'math': { prefix: 'ค', suffix: '101' },
    'science': { prefix: 'ว', suffix: '101' },
    'social': { prefix: 'ส', suffix: '101' },
    'history': { prefix: 'ส', suffix: '102' },
    'health': { prefix: 'พ', suffix: '101' },
    'art': { prefix: 'ศ', suffix: '101' },
    'career': { prefix: 'ง', suffix: '101' },
    'english': { prefix: 'อ', suffix: '101' },
    // Elective subjects - เพิ่มเติม (201, 202, etc.)
    'english2': { prefix: 'อ', suffix: '201' },
    'anticorrupt': { prefix: 'ส', suffix: '202' },
  };
  
  const mapping = subjectCodeMap[subjectId];
  if (!mapping) return '';
  
  // Format: prefix + grade + 1 + suffix (e.g., ท11101, ท21101, etc.)
  return `${mapping.prefix}${gradeNum}1${mapping.suffix}`;
};

// Get default subjects with grade-specific codes
export const getDefaultSubjectsForGrade = (gradeLevel: string): Omit<SubjectInfo, 'teacherId' | 'teacherName'>[] => {
  return [
    // Core subjects (สาระการเรียนรู้พื้นฐาน)
    { id: 'thai', code: 'ท', name: 'ภาษาไทย', shortName: 'ภาษาไทย', hoursPerWeek: 5, hoursPerYear: 200, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('thai', gradeLevel), endTermRatio: 100, midTermRatio: 0, category: 'core' },
    { id: 'math', code: 'ค', name: 'คณิตศาสตร์', shortName: 'คณิตศาสตร์', hoursPerWeek: 5, hoursPerYear: 200, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('math', gradeLevel), endTermRatio: 100, midTermRatio: 0, category: 'core' },
    { id: 'science', code: 'ว', name: 'วิทยาศาสตร์และเทคโนโลยี', shortName: 'วิทยาศาสตร์ฯ', hoursPerWeek: 2, hoursPerYear: 80, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('science', gradeLevel), endTermRatio: 100, midTermRatio: 0, category: 'core' },
    { id: 'social', code: 'ส', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม', shortName: 'สังคมศึกษาฯ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('social', gradeLevel), endTermRatio: 0, midTermRatio: 0, category: 'core' },
    { id: 'history', code: 'ส', name: 'ประวัติศาสตร์', shortName: 'ประวัติศาสตร์', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('history', gradeLevel), endTermRatio: 0, midTermRatio: 0, category: 'core' },
    { id: 'health', code: 'พ', name: 'สุขศึกษาและพลศึกษา', shortName: 'สุขศึกษาฯ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('health', gradeLevel), endTermRatio: 0, midTermRatio: 0, category: 'core' },
    { id: 'art', code: 'ศ', name: 'ศิลปะ', shortName: 'ศิลปะ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('art', gradeLevel), endTermRatio: 0, midTermRatio: 0, category: 'core' },
    { id: 'career', code: 'ง', name: 'การงานอาชีพ', shortName: 'การงานอาชีพ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('career', gradeLevel), endTermRatio: 0, midTermRatio: 0, category: 'core' },
    { id: 'english', code: 'อ', name: 'ภาษาอังกฤษ', shortName: 'ภาษาอังกฤษ', hoursPerWeek: 4, hoursPerYear: 160, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('english', gradeLevel), endTermRatio: 100, midTermRatio: 0, category: 'core' },
    
    // Elective subjects (สาระการเรียนรู้เพิ่มเติม)
    { id: 'english2', code: 'อ', name: 'ภาษาอังกฤษเพื่อการสื่อสาร', shortName: 'อังกฤษสื่อสาร', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('english2', gradeLevel), endTermRatio: 0, midTermRatio: 0, category: 'elective' },
    { id: 'anticorrupt', code: 'ส', name: 'ป้องกันการทุจริต', shortName: 'ป้องกันทุจริต', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: getSubjectCodeForGrade('anticorrupt', gradeLevel), endTermRatio: 0, midTermRatio: 0, category: 'elective' },
    
    // Activities (กิจกรรมพัฒนาผู้เรียน) - no subject codes
    { id: 'guidance', code: 'ก', name: 'แนะแนว', shortName: 'แนะแนว', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 0, subjectCode: '', endTermRatio: 0, midTermRatio: 0, category: 'activity' },
    { id: 'scout', code: 'ก', name: 'ลูกเสือ เนตรนารี', shortName: 'ลูกเสือฯ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 0, subjectCode: '', endTermRatio: 0, midTermRatio: 0, category: 'activity' },
    { id: 'club', code: 'ก', name: 'ชมรม ชุมนุม', shortName: 'ชมรมฯ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 0, subjectCode: '', endTermRatio: 0, midTermRatio: 0, category: 'activity' },
  ];
};

// Keep for backward compatibility
export const DEFAULT_SUBJECTS = getDefaultSubjectsForGrade('1');

export const DEFAULT_CALENDAR: AcademicCalendar = {
  semester1Months: ['พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม'],
  semester2Months: ['พฤศจิกายน', 'ธันวาคม', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน'],
};
