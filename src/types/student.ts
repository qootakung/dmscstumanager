
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
  reportType: '1' | '2';
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
  };
  customColumns?: number;
}
