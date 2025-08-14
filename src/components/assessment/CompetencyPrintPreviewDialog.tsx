import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { getTeachers } from '@/utils/teacherStorage';
import type { Teacher } from '@/types/teacher';

interface StudentWithAssessment {
  id: string;
  studentId: string;
  studentName: string;
  competencyScores: number[];
  totalScore: number;
  grade: string;
}

interface CompetencyPrintPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  studentsWithAssessments: StudentWithAssessment[];
  academicYear: string;
  gradeLevel: string;
}

const CompetencyPrintPreviewDialog: React.FC<CompetencyPrintPreviewDialogProps> = ({
  isOpen,
  onOpenChange,
  studentsWithAssessments,
  academicYear,
  gradeLevel,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedPrincipal, setSelectedPrincipal] = useState<string>('');

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersData = await getTeachers();
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const getGradeStats = () => {
    const stats = {
      excellent: studentsWithAssessments.filter(s => s.grade === 'ดีเยี่ยม').length,
      good: studentsWithAssessments.filter(s => s.grade === 'ดี').length,
      pass: studentsWithAssessments.filter(s => s.grade === 'ผ่าน').length,
      fail: studentsWithAssessments.filter(s => s.grade === 'ไม่ผ่าน').length,
    };
    
    const total = studentsWithAssessments.length;
    return {
      ...stats,
      total,
      excellentPercent: total > 0 ? ((stats.excellent / total) * 100).toFixed(1) : '0',
      goodPercent: total > 0 ? ((stats.good / total) * 100).toFixed(1) : '0',
      passPercent: total > 0 ? ((stats.pass / total) * 100).toFixed(1) : '0',
      failPercent: total > 0 ? ((stats.fail / total) * 100).toFixed(1) : '0',
    };
  };

  const stats = getGradeStats();

  const totalScores = [
    studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[0] || 0), 0),
    studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[1] || 0), 0),
    studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[2] || 0), 0),
    studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[3] || 0), 0),
    studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[4] || 0), 0)
  ];

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `สรุปผลการประเมินรายชั้นเรียน-${gradeLevel}-${academicYear}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-family: 'Sarabun', sans-serif !important;
          font-size: 12px !important;
          line-height: 1.3 !important;
        }
        table, th, td {
          border: 1px solid #000000 !important;
          border-collapse: collapse !important;
        }
        th {
          background-color: #f8f9fa !important;
          font-weight: bold !important;
          padding: 4px !important;
        }
        td {
          padding: 4px !important;
        }
        .print-container {
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .signature-section {
          page-break-inside: avoid !important;
        }
        .summary-section {
          page-break-inside: avoid !important;
        }
      }
    `
  });

  const handlePrintClick = async () => {
    setPrinting(true);
    try {
      await handlePrint();
      toast({
        title: "พิมพ์เอกสารสำเร็จ",
        description: "สามารถนำเอกสารไปใช้งานต่อได้",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาดขณะพิมพ์",
        description: "ไม่สามารถพิมพ์เอกสารได้ โปรดลองใหม่",
        variant: "destructive",
      });
      console.error("Print Error:", error);
    } finally {
      setPrinting(false);
    }
  };

  // Only use students with actual data, filter out empty rows
  const allRows = studentsWithAssessments.filter(student => student.studentName && student.studentName.trim() !== '');

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>ตัวอย่างก่อนพิมพ์</DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="teacher">ครูผู้รับผิดชอบ</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกครูผู้รับผิดชอบ" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName} ({teacher.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="principal">ผู้อำนวยการ</Label>
              <Select value={selectedPrincipal} onValueChange={setSelectedPrincipal}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกผู้อำนวยการ" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.filter(t => t.position === 'ผู้อำนวยการโรงเรียน').map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="p-6 bg-white shadow-lg mx-auto" style={{ maxWidth: '210mm' }}>
            <div ref={componentRef} className="print-container" style={{ fontFamily: 'Sarabun, sans-serif', fontSize: '12px', lineHeight: '1.3' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                  สรุปผลการประเมินรายชั้นเรียน
                </div>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                  ชั้น{gradeLevel.startsWith('ป.') ? `ประถมศึกษาปีที่ ${gradeLevel.slice(2)}` : gradeLevel}
                </div>
                <div style={{ fontSize: '14px' }}>ปีการศึกษา {academicYear}</div>
              </div>

              {/* Table */}
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px', fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ width: '40px', border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                      ลำดับที่
                    </th>
                    <th rowSpan={2} style={{ width: '120px', border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                      ชื่อ-สกุล
                    </th>
                    <th colSpan={5} style={{ border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                      ผลการประเมินรายสมรรถนะ
                    </th>
                    <th rowSpan={2} style={{ width: '60px', border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                      สรุปผลการประเมิน
                    </th>
                  </tr>
                  <tr>
                    <th style={{ width: '60px', border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa', fontSize: '10px' }}>สมรรถนะด้านที่ 1: ความสามารถในการสื่อสาร</th>
                    <th style={{ width: '60px', border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa', fontSize: '10px' }}>สมรรถนะด้านที่ 2: ความสามารถในการคิด</th>
                    <th style={{ width: '60px', border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa', fontSize: '10px' }}>สมรรถนะด้านที่ 3: ความสามารถในการแก้ปัญหา</th>
                    <th style={{ width: '60px', border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa', fontSize: '10px' }}>สมรรถนะด้านที่ 4: ความสามารถในการใช้ทักษะชีวิต</th>
                    <th style={{ width: '60px', border: '1px solid black', padding: '4px', textAlign: 'center', backgroundColor: '#f8f9fa', fontSize: '10px' }}>สมรรถนะด้านที่ 5: ความสามารถในการใช้เทคโนโลยี</th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((student, index) => (
                    <tr key={student.id}>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>
                        {index + 1}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px', fontSize: '10px' }}>
                        {student.studentName}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>
                        {student.competencyScores[0] || ''}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>
                        {student.competencyScores[1] || ''}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>
                        {student.competencyScores[2] || ''}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>
                        {student.competencyScores[3] || ''}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>
                        {student.competencyScores[4] || ''}
                      </td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
                        {student.grade && student.grade !== 'ไม่ผ่าน' ? student.grade : (student.grade || '')}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold' }}>
                    <td colSpan={2} style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>รวม</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{totalScores[0]}</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{totalScores[1]}</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{totalScores[2]}</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{totalScores[3]}</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{totalScores[4]}</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>-</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary Section */}
              <div className="summary-section" style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>สรุปผลการประเมิน</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <div style={{ fontWeight: '500', fontSize: '12px', marginBottom: '2px', color: '#10b981' }}>ดีเยี่ยม</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.excellent}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>({stats.excellentPercent}%)</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <div style={{ fontWeight: '500', fontSize: '12px', marginBottom: '2px', color: '#3b82f6' }}>ดี</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.good}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>({stats.goodPercent}%)</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <div style={{ fontWeight: '500', fontSize: '12px', marginBottom: '2px', color: '#f59e0b' }}>ผ่าน</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.pass}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>({stats.passPercent}%)</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <div style={{ fontWeight: '500', fontSize: '12px', marginBottom: '2px', color: '#ef4444' }}>ไม่ผ่าน</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.fail}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>({stats.failPercent}%)</div>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="signature-section" style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ marginBottom: '20px', fontSize: '12px' }}>รับรองข้อมูลถูกต้อง</div>
                    <div style={{ borderBottom: '1px dotted black', width: '200px', margin: '0 auto 15px', height: '20px' }}></div>
                    <div style={{ fontSize: '11px' }}>
                      {selectedPrincipal ? teachers.find(t => t.id === selectedPrincipal)?.firstName + ' ' + teachers.find(t => t.id === selectedPrincipal)?.lastName : 'ผู้อำนวยการโรงเรียนบ้านดอนมูล'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ marginBottom: '20px', fontSize: '12px' }}>ตรวจสอบข้อมูลถูกต้อง</div>
                    <div style={{ borderBottom: '1px dotted black', width: '200px', margin: '0 auto 15px', height: '20px' }}></div>
                    <div style={{ fontSize: '11px' }}>
                      {selectedTeacher ? teachers.find(t => t.id === selectedTeacher)?.firstName + ' ' + teachers.find(t => t.id === selectedTeacher)?.lastName : 'ครูประจำชั้น'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="p-4 border-t bg-background flex-row justify-end items-center space-x-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={printing}>ปิด</Button>
          </DialogClose>
          <Button onClick={handlePrintClick} disabled={printing}>
            <Printer className="mr-2 h-4 w-4" />
            {printing ? "กำลังพิมพ์..." : "พิมพ์เอกสาร"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompetencyPrintPreviewDialog;