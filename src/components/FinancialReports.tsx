import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudents } from '@/utils/studentStorage';
import { getTeachers } from '@/utils/teacherStorage';
import type { Student } from '@/types/student';
import type { Teacher } from '@/types/teacher';
import PrintPreviewStatic from "./Finance/PrintPreviewStatic";
import PaymentTypeSelection from './Finance/form/PaymentTypeSelection';
import AcademicInfoSection from './Finance/form/AcademicInfoSection';
import GradeSelection from './Finance/form/GradeSelection';
import SignatureFields from './Finance/form/SignatureFields';
import SchoolInfoSection from './Finance/form/SchoolInfoSection';

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

const FinancialReports = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [voucherData, setVoucherData] = useState<PaymentVoucherData>({
    paymentTypes: [],
    academicYear: '2567',
    semester: '1',
    grade: '',
    students: [],
    schoolName: 'โรงเรียนบ้านดอนมูล',
    principalName: '',
    managerName: '',
    selectedTeacher: null,
    payerName: ''
  });

  const paymentOptions = [
    'ค่าอุปกรณ์การเรียน',
    'ค่าเครื่องแบบนักเรียน',
    'ค่าจัดการเรียนการสอน (ปัจจัยพื้นฐานสำหรับการรับนักเรียนยากจน)',
    'ค่าเครื่องแบบนักเรียน (เพิ่มเติม)',
    'ค่าอุปกรณ์การเรียน (เพิ่มเติม)'
  ];

  // เพิ่ม "ทุกระดับชั้น" เป็นตัวเลือกแรก
  const grades = ['ทุกระดับชั้น', 'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  useEffect(() => {
    loadStudents();
    loadTeachers();
  }, []);

  // เมื่อมีการโหลด/เปลี่ยนครู จะเซ็ต principalName อัตโนมัติ
  useEffect(() => {
    if (teachers.length > 0) {
      const principal = teachers.find((t) => t.position === "ผู้อำนวยการโรงเรียน");
      if (principal && !voucherData.principalName) {
        setVoucherData(prev => ({
          ...prev,
          principalName: `${principal.firstName} ${principal.lastName}`
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teachers]); // ไม่รวม voucherData.principalName เพื่อกันวนลูป

  const loadStudents = async () => {
    const studentData = await getStudents();
    setStudents(studentData);
  };

  const loadTeachers = async () => {
    const teacherData = await getTeachers();
    setTeachers(teacherData);
    // หลังโหลดจะเซ็ต director อัตโนมัติถ้ายังไม่ได้เซต
    const principal = teacherData.find((t) => t.position === "ผู้อำนวยการโรงเรียน");
    if (principal && !voucherData.principalName) {
      setVoucherData(prev => ({
        ...prev,
        principalName: `${principal.firstName} ${principal.lastName}`
      }));
    }
  };

  const handlePaymentTypeChange = (paymentType: string, checked: boolean) => {
    setVoucherData(prev => ({
      ...prev,
      paymentTypes: checked 
        ? [...prev.paymentTypes, paymentType]
        : prev.paymentTypes.filter(type => type !== paymentType)
    }));
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    let gradeStudents: Student[];
    if (grade === "ทุกระดับชั้น") {
      gradeStudents = students;
    } else {
      gradeStudents = students.filter(student => student.grade === grade);
    }
    setVoucherData(prev => ({
      ...prev,
      grade,
      students: gradeStudents
    }));
  };

  // ปรับปรุง handleTeacherSelect ให้รับแค่ teacherId (เพราะจะใช้ dropdown ธรรมดา)
  const handleTeacherSelect = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId) || null;
    setVoucherData(prev => ({
      ...prev,
      selectedTeacher: teacher
    }));
  };
  
  const handleAutoFillPrincipal = () => {
    const principal = teachers.find((t) => t.position === "ผู้อำนวยการโรงเรียน");
    if (principal) {
      setVoucherData(prev => ({
        ...prev,
        principalName: `${principal.firstName} ${principal.lastName}`
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">รายงานการเงิน</h2>
          <p className="text-muted-foreground">
            ระบบพิมพ์หลักฐานการจ่ายเงิน
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>หลักฐานการจ่ายเงิน</CardTitle>
          <CardDescription>
            เลือกประเภทการจ่ายเงินและข้อมูลที่ต้องการพิมพ์
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentTypeSelection
            paymentOptions={paymentOptions}
            selectedPaymentTypes={voucherData.paymentTypes}
            onPaymentTypeChange={handlePaymentTypeChange}
          />
          
          <AcademicInfoSection
            academicYear={voucherData.academicYear}
            semester={voucherData.semester}
            onAcademicYearChange={(value) => setVoucherData(prev => ({ ...prev, academicYear: value }))}
            onSemesterChange={(value) => setVoucherData(prev => ({ ...prev, semester: value }))}
          />

          <GradeSelection
            grades={grades}
            selectedGrade={selectedGrade}
            onGradeChange={handleGradeChange}
          />

          {voucherData.students.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                {voucherData.grade === "ทุกระดับชั้น" ? (
                  <>จำนวนนักเรียนทั้งหมด: {voucherData.students.length} คน</>
                ) : (
                  <>จำนวนนักเรียนในชั้น {voucherData.grade}: {voucherData.students.length} คน</>
                )}
              </p>
            </div>
          )}

          <SignatureFields
            teachers={teachers}
            payerName={voucherData.payerName}
            selectedTeacher={voucherData.selectedTeacher}
            onPayerNameChange={(value) => setVoucherData(prev => ({ ...prev, payerName: value }))}
            onTeacherChange={handleTeacherSelect}
          />

          <SchoolInfoSection
            principalName={voucherData.principalName}
            onPrincipalNameChange={(value) => setVoucherData(prev => ({ ...prev, principalName: value }))}
            onAutoFillPrincipal={handleAutoFillPrincipal}
          />

        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;
