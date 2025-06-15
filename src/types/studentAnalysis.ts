
export interface StudentScore {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  scores: { [subject: string]: number };
  totalScore: number;
  averageScore: number;
  group: 'เก่ง' | 'ปานกลาง' | 'อ่อน';
}
