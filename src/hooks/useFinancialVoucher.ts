
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getStudents } from '@/utils/studentStorage';
import { getTeachers } from '@/utils/teacherStorage';
import type { Student } from '@/types/student';
import type { Teacher } from '@/types/teacher';
import type { PaymentVoucherData } from '@/types/finance';

export const useFinancialVoucher = () => {
  const { toast } = useToast();
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
    payerName: '',
    amountPerStudent: '',
    paymentDate: ''
  });

  const paymentOptions = [
    'ค่าอุปกรณ์การเรียน',
    'ค่าเครื่องแบบนักเรียน',
    'ค่าจัดการเรียนการสอน (ปัจจัยพื้นฐานสำหรับการรับนักเรียนยากจน)',
    'ค่าเครื่องแบบนักเรียน (เพิ่มเติม)',
    'ค่าอุปกรณ์การเรียน (เพิ่มเติม)'
  ];

  const grades = ['ทุกระดับชั้น', 'อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  useEffect(() => {
    loadStudents();
    loadTeachers();
  }, []);

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
  }, [teachers]);

  const loadStudents = async () => {
    const studentData = await getStudents();
    setStudents(studentData);
  };

  const loadTeachers = async () => {
    const teacherData = await getTeachers();
    setTeachers(teacherData);
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
    
    const sortedStudents = [...gradeStudents].sort((a, b) => {
      const aId = a.studentId || '';
      const bId = b.studentId || '';

      if (aId.length !== bId.length) {
        return aId.length - bId.length;
      }
      return aId.localeCompare(bId, undefined, { numeric: true });
    });
      
    setVoucherData(prev => ({
      ...prev,
      grade,
      students: sortedStudents
    }));
  };

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

  const handlePreview = () => {
    if (voucherData.paymentTypes.length === 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกประเภทการจ่ายเงินอย่างน้อย 1 รายการ",
        variant: "destructive",
      });
      return false;
    }
    if (!voucherData.grade) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกชั้นเรียน",
        variant: "destructive",
      });
      return false;
    }
    if (!voucherData.paymentDate) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณาระบุวันที่จ่ายเงิน",
          variant: "destructive",
        });
        return false;
    }
    if (!voucherData.amountPerStudent || parseFloat(voucherData.amountPerStudent) <= 0) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณาระบุจำนวนเงิน (ต่อคน) ให้ถูกต้อง",
          variant: "destructive",
        });
        return false;
    }
    return true;
  };

  return {
    teachers,
    selectedGrade,
    voucherData,
    paymentOptions,
    grades,
    setVoucherData,
    handlePaymentTypeChange,
    handleGradeChange,
    handleTeacherSelect,
    handleAutoFillPrincipal,
    handlePreview,
  };
};
