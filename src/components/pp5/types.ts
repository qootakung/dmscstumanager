
export interface PP5BasicInfo {
  // General Info
  level: string;
  semester: string;
  yearNumber: string;
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

export const DEFAULT_SUBJECTS: Omit<SubjectInfo, 'teacherId' | 'teacherName'>[] = [
  // Core subjects (สาระการเรียนรู้พื้นฐาน)
  { id: 'thai', code: 'ท', name: 'ภาษาไทย', shortName: 'ภาษาไทย', hoursPerWeek: 5, hoursPerYear: 200, passingCriteria: 50, subjectCode: 'ท11101', endTermRatio: 100, midTermRatio: 0, category: 'core' },
  { id: 'math', code: 'ค', name: 'คณิตศาสตร์', shortName: 'คณิตศาสตร์', hoursPerWeek: 5, hoursPerYear: 200, passingCriteria: 50, subjectCode: 'ค11101', endTermRatio: 100, midTermRatio: 0, category: 'core' },
  { id: 'science', code: 'ว', name: 'วิทยาศาสตร์และเทคโนโลยี', shortName: 'วิทยาศาสตร์ฯ', hoursPerWeek: 2, hoursPerYear: 80, passingCriteria: 50, subjectCode: 'ว11101', endTermRatio: 100, midTermRatio: 0, category: 'core' },
  { id: 'social', code: 'ส', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม', shortName: 'สังคมศึกษาฯ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: 'ส11101', endTermRatio: 0, midTermRatio: 0, category: 'core' },
  { id: 'history', code: 'ส', name: 'ประวัติศาสตร์', shortName: 'ประวัติศาสตร์', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: 'ส11102', endTermRatio: 0, midTermRatio: 0, category: 'core' },
  { id: 'health', code: 'พ', name: 'สุขศึกษาและพลศึกษา', shortName: 'สุขศึกษาฯ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: 'พ11101', endTermRatio: 0, midTermRatio: 0, category: 'core' },
  { id: 'art', code: 'ศ', name: 'ศิลปะ', shortName: 'ศิลปะ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: 'ศ11101', endTermRatio: 0, midTermRatio: 0, category: 'core' },
  { id: 'career', code: 'ง', name: 'การงานอาชีพ', shortName: 'การงานอาชีพ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: 'ง11101', endTermRatio: 0, midTermRatio: 0, category: 'core' },
  { id: 'english', code: 'อ', name: 'ภาษาอังกฤษ', shortName: 'ภาษาอังกฤษ', hoursPerWeek: 4, hoursPerYear: 160, passingCriteria: 50, subjectCode: 'อ11101', endTermRatio: 100, midTermRatio: 0, category: 'core' },
  
  // Elective subjects (สาระการเรียนรู้เพิ่มเติม)
  { id: 'english2', code: 'อ', name: 'ภาษาอังกฤษเพื่อการสื่อสาร', shortName: 'อังกฤษสื่อสาร', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: 'อ11201', endTermRatio: 0, midTermRatio: 0, category: 'elective' },
  { id: 'anticorrupt', code: 'ส', name: 'ป้องกันการทุจริต', shortName: 'ป้องกันทุจริต', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 50, subjectCode: 'ส11202', endTermRatio: 0, midTermRatio: 0, category: 'elective' },
  
  // Activities (กิจกรรมพัฒนาผู้เรียน)
  { id: 'guidance', code: 'ก', name: 'แนะแนว', shortName: 'แนะแนว', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 0, subjectCode: '', endTermRatio: 0, midTermRatio: 0, category: 'activity' },
  { id: 'scout', code: 'ก', name: 'ลูกเสือ เนตรนารี', shortName: 'ลูกเสือฯ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 0, subjectCode: '', endTermRatio: 0, midTermRatio: 0, category: 'activity' },
  { id: 'club', code: 'ก', name: 'ชมรม ชุมนุม', shortName: 'ชมรมฯ', hoursPerWeek: 1, hoursPerYear: 40, passingCriteria: 0, subjectCode: '', endTermRatio: 0, midTermRatio: 0, category: 'activity' },
];

export const DEFAULT_CALENDAR: AcademicCalendar = {
  semester1Months: ['พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม'],
  semester2Months: ['พฤศจิกายน', 'ธันวาคม', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน'],
};
