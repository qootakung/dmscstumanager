
import type { Student } from '@/types/student';
import type { Teacher } from '@/types/teacher';

export interface PaymentVoucherData {
  paymentTypes: string[];
  academicYear: string;
  semester: string;
  grade: string;
  students: Student[];
  schoolName: string;
  principalName: string;
  managerName: string;
  selectedTeacher: Teacher | null;
  payerName: string;
}
