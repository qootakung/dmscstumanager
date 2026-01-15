
export interface TeacherReportOptions {
  reportType: '1' | '2' | '3';
  academicYear: string;
  pageOrientation: 'portrait' | 'landscape';
  additionalFields: {
    email: boolean;
    citizenId: boolean;
    salary: boolean;
    birthDate: boolean;
    position: boolean;
    education: boolean;
    major: boolean;
    phone: boolean;
    lineId: boolean;
    appointmentDate: boolean;
    signature: boolean;
    signature2: boolean;
    timeIn: boolean;
    timeOut: boolean;
    note: boolean;
  };
  fieldOrder: string[];
  customColumns: number;
  showDate: boolean;
  selectedDate: string;
  customTitle1?: string;
  customTitle2?: string;
}
