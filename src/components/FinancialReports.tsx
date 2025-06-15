import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, User } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import { getTeachers } from '@/utils/teacherStorage';
import type { Student } from '@/types/student';
import type { Teacher } from '@/types/teacher';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import PrintPreview from "./Finance/PrintPreview";
import PrintPreviewStatic from "./Finance/PrintPreviewStatic";

interface PaymentVoucherData {
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
  const [previewOpen, setPreviewOpen] = useState(false);

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

  // ปรับปรุง handlePrint ให้เรียกใช้งาน PrintPreviewStatic แบบ import ปกติ
  const handlePrint = () => {
    if (voucherData.paymentTypes.length === 0) {
      alert('กรุณาเลือกประเภทการจ่ายเงิน');
      return;
    }
    if (!voucherData.grade) {
      alert('กรุณาเลือกชั้นเรียน');
      return;
    }

    // ใช้ renderToStaticMarkup เพื่อแปลง React > HTML string
    import('react-dom/server').then(({ renderToStaticMarkup }) => {
      // ไม่ต้อง require อีกต่อไป
      const htmlString = renderToStaticMarkup(
        <PrintPreviewStatic voucherData={voucherData} paymentOptions={paymentOptions} />
      );

      const printWindow = window.open('', '', 'height=900,width=1200');
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
          <head>
            <title>หลักฐานการจ่ายเงิน</title>
            <meta charset="utf-8" />
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin:0;padding:0;">
            ${htmlString}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 700);
    });
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
          {/* Payment Types Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">ประเภทการจ่ายเงิน</Label>
            <div className="space-y-2">
              {paymentOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={voucherData.paymentTypes.includes(option)}
                    onCheckedChange={(checked) => 
                      handlePaymentTypeChange(option, checked as boolean)
                    }
                  />
                  <Label htmlFor={option} className="text-sm">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Year and Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academicYear">ปีการศึกษา</Label>
              <Input
                id="academicYear"
                value={voucherData.academicYear}
                onChange={(e) => setVoucherData(prev => ({
                  ...prev,
                  academicYear: e.target.value
                }))}
              />
            </div>
            <div>
              <Label htmlFor="semester">ภาคเรียนที่</Label>
              <Select
                value={voucherData.semester}
                onValueChange={(value) => setVoucherData(prev => ({
                  ...prev,
                  semester: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grade Selection */}
          <div>
            <Label htmlFor="grade">เลือกชั้นเรียน</Label>
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกชั้นเรียน" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Count Display */}
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

          {/* Signature Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payerName">ชื่อผู้จ่ายเงิน</Label>
              {/* เปลี่ยน dropdown ให้แสดงแค่ชื่อ-นามสกุล */}
              <Select
                value={voucherData.payerName}
                onValueChange={(value) =>
                  setVoucherData((prev) => ({
                    ...prev,
                    payerName: value
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="เลือกผู้จ่ายเงิน"
                    {...(voucherData.payerName
                      ? {
                          children: voucherData.payerName
                        }
                      : {})}
                  />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem
                      key={teacher.id}
                      value={`${teacher.firstName} ${teacher.lastName}`}
                    >
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teacher">ครูประจำชั้น</Label>
              <Select
                value={voucherData.selectedTeacher ? voucherData.selectedTeacher.id : ''}
                onValueChange={handleTeacherSelect}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="เลือกครูประจำชั้น"
                    {...(voucherData.selectedTeacher
                      ? {
                          children: `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}`
                        }
                      : {})}
                  />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* School Information */}
          <div>
            <Label htmlFor="principalName">ชื่อผู้อำนวยการ</Label>
            <div className="flex items-center gap-2">
              <Input
                id="principalName"
                value={voucherData.principalName}
                onChange={(e) => setVoucherData(prev => ({
                  ...prev,
                  principalName: e.target.value
                }))}
                placeholder="ชื่อผู้อำนวยการโรงเรียน"
              />
              {/* ปุ่มเติมอัตโนมัติ หากอยากให้ user รีดึงชื่อใหม่ */}
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  const principal = teachers.find((t) => t.position === "ผู้อำนวยการโรงเรียน");
                  if (principal) {
                    setVoucherData(prev => ({
                      ...prev,
                      principalName: `${principal.firstName} ${principal.lastName}`
                    }));
                  }
                }}
                title="เติมชื่อผู้อำนวยการจากรายชื่อครู"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Print Button */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPreviewOpen(true)} className="flex items-center gap-2">
              👁️ ดูตัวอย่าง
            </Button>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              พิมพ์หลักฐานการจ่ายเงิน
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog สำหรับ preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>ตัวอย่างใบหลักฐานการจ่ายเงิน</DialogTitle>
          </DialogHeader>
          <PrintPreview voucherData={voucherData} paymentOptions={paymentOptions} />
          <DialogFooter>
            <Button
              onClick={() => {
                setPreviewOpen(false);
                setTimeout(() => handlePrint(), 200);
              }}
              className="bg-green-600 text-white"
            >
              พิมพ์จากตัวอย่างนี้
            </Button>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialReports;
