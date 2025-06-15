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

  const handlePrint = () => {
    if (voucherData.paymentTypes.length === 0) {
      alert('กรุณาเลือกประเภทการจ่ายเงิน');
      return;
    }
    if (!voucherData.grade) {
      alert('กรุณาเลือกชั้นเรียน');
      return;
    }

    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>หลักฐานการจ่ายเงิน</title>
          <style>
            body { 
              font-family: 'Sarabun', Arial, sans-serif; 
              font-size: 14px; 
              margin: 20px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
            }
            .form-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .school-info { 
              margin-bottom: 20px; 
            }
            .payment-types { 
              margin-bottom: 20px; 
            }
            .checkbox-item { 
              margin: 5px 0; 
            }
            .details { 
              margin-bottom: 20px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: center; 
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold; 
            }
            .signatures { 
              display: flex; 
              justify-content: space-between; 
              margin-top: 30px; 
            }
            .signature { 
              text-align: center; 
              width: 30%; 
            }
            .signature-line { 
              border-bottom: 1px dotted #000; 
              margin-bottom: 5px; 
              height: 20px; 
            }
            .checkbox { 
              width: 15px; 
              height: 15px; 
              border: 1px solid #000; 
              display: inline-block; 
              margin-right: 5px; 
            }
            .checked { 
              background-color: #000; 
            }
            .dotted-line { 
              border-bottom: 1px dotted #000; 
              display: inline-block; 
              min-width: 100px; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="form-title">แบบหลักฐานการจ่ายเงิน</div>
            <div>ภาคเรียนที่<span class="dotted-line">${voucherData.semester}</span>ปีการศึกษา<span class="dotted-line">${voucherData.academicYear}</span></div>
          </div>

          <div class="payment-types">
            ${paymentOptions.map(option => `
              <div class="checkbox-item">
                <span class="checkbox ${voucherData.paymentTypes.includes(option) ? 'checked' : ''}"></span>
                ${option}
              </div>
            `).join('')}
          </div>

          <div class="details">
            <p>
              ระดับชั้น <span class="checkbox ${voucherData.paymentTypes.length > 0 ? 'checked' : ''}"></span> อนุบาลปีที่<span class="dotted-line"></span>
              <span class="checkbox"></span> ประถมศึกษาปีที่<span class="dotted-line"></span>
            </p>
            <p>
              <span class="checkbox"></span> มัธยมศึกษาปีที่<span class="dotted-line"></span>
              <span class="checkbox"></span> ปวช. ที่สังเคยศตสหกรณ์ การปีที่<span class="dotted-line"></span>
            </p>
            <p>นักเรียนจำนวนทั้งสิ้น<span class="dotted-line">${voucherData.students.length}</span>คน ได้รับเงินจากโรงเรียน<span class="dotted-line">${voucherData.students.length}</span>นาย คนตอนฯ<span class="dotted-line"></span></p>
            <p>สังกัดสำนักงานเขตพื้นที่การศึกษา ประถมศึกษาจังหวัดเขต 2 ข้าพเจ้าขอรับรองว่าเงินเจ้านี้เงิน</p>
            <p>ที่ได้รับไปตำลินมาครอบครัวผู้ประสบความเดือดร้อนทางการทำการ หากไม่ดำเนินการดังกล่าวข้าพเจ้ายอมยอมเคยใช้เงินคืน</p>
            <p>ให้กับโรงเรียนต่อไป</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>ที่</th>
                <th>ชื่อ - สกุลนักเรียน</th>
                <th>หมายเลขประจำตัว<br>ประชาชน 13 หลัก</th>
                <th>จำนวนเงิน<br>(บาท)</th>
                <th>วันที่รับเงิน</th>
                <th>ลายมือชื่อ<br>ผู้ปกครอง/<br>นักเรียน</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              ${voucherData.students.map((student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.titleTh || ''} ${student.firstNameTh} ${student.lastNameTh}</td>
                  <td>${student.citizenId || ''}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              `).join('')}
              ${Array.from({ length: Math.max(0, 15 - voucherData.students.length) }, (_, index) => `
                <tr>
                  <td>${voucherData.students.length + index + 1}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" style="text-align: center; font-weight: bold;">รวมทั้งสิ้น</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="signature">
              <div>ลงชื่อ<span class="dotted-line">${voucherData.payerName || '..........................................'}</span>ผู้จ่ายเงิน</div>
              <div>(<span class="dotted-line">${voucherData.payerName || '..........................................'}</span>)</div>
            </div>
            <div class="signature">
              <div>ลงชื่อ<span class="dotted-line">${voucherData.selectedTeacher ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}` : '..........................................'}</span>ครูประจำชั้น</div>
              <div>(<span class="dotted-line">${voucherData.selectedTeacher ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}` : '..........................................'}</span>)</div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <div>ตรวจสอบแล้วถูกต้อง</div>
            <br>
            <div>ลงชื่อ<span class="dotted-line">${voucherData.principalName || '..........................................'}</span>ผู้อำนวยการโรงเรียน</div>
            <div>(<span class="dotted-line">${voucherData.principalName || '..........................................'}</span>)</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
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
              {/* เปลี่ยนจาก Input เป็น Select */}
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
                  <SelectValue placeholder="เลือกผู้จ่ายเงิน" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem
                      key={teacher.id}
                      value={`${teacher.firstName} ${teacher.lastName}`}
                    >
                      {teacher.firstName} {teacher.lastName} - {teacher.position}
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
                  <SelectValue placeholder="เลือกครูประจำชั้น" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName} - {teacher.position}
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
          <div className="flex justify-end">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              พิมพ์หลักฐานการจ่ายเงิน
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;
