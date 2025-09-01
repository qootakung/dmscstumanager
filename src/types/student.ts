export interface Student {
  id: string;
  academicYear: string;
  citizenId: string;
  studentId: string;
  grade: string;
  gender: 'ชาย' | 'หญิง' | 'ช' | 'ญ';
  titleTh: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn?: string;
  lastNameEn?: string;
  birthDate: string;
  
  // Father information
  fatherTitle: string;
  fatherFirstName: string;
  fatherLastName: string;
  
  // Mother information
  motherTitle: string;
  motherFirstName: string;
  motherLastName: string;
  
  // Guardian information
  guardianTitle: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianPhone: string;
  
  // Address
  houseNumber: string;
  moo: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface ReportOptions {
  reportType: '1' | '2' | '3';
  classLevel: string;
  academicYear: string;
  additionalFields: {
    gender: boolean;
    citizenId: boolean;
    signature: boolean;
    guardianSignature: boolean;
    timeIn: boolean;
    timeOut: boolean;
    phone: boolean;
    note: boolean;
    gradeLevel: boolean;
    address: boolean;
    age: boolean;
  };
  customColumns: number;
  customColumn1?: string;
  customColumn2?: string;
}

export interface StudentHealthRecord {
  id: string;
  student_id: string;
  measurement_date: string;
  weight_kg: number | null;
  height_cm: number | null;
  academic_year: string;
  created_at: string;
  updated_at: string;
}

export interface StudentHealthDetails {
  record_id: string;
  student_record_id: string;
  student_code: string;
  full_name: string;
  age_years: number;
  age_months: number;
  age_days: number;
  weight_kg: number | null;
  height_cm: number | null;
  measurement_date: string;
}
