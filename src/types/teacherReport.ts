
export interface TeacherReportOptions {
  reportType: '1' | '2';
  academicYear: string;
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
  };
  customColumns: number;
  showDate: boolean;
  selectedDate: string;
}
