import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@/types/student';
import { Teacher } from '@/types/teacher';
import { StudentScorePrintPreview } from './StudentScorePrintPreview';
import { Printer } from 'lucide-react';

interface StudentScore {
  id?: string;
  student_id: string;
  teacher_id: string;
  subject_code: string;
  subject_name: string;
  grade_level: string;
  max_score: number;
  score: number;
  academic_year: string;
}

interface Subject {
  code: string;
  name: string;
}

interface StudentScorePrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scores: StudentScore[];
  students: Student[];
  teachers: Teacher[];
  gradeLevel: string;
  academicYear: string;
  principalName?: string;
  homeRoomTeacher?: Teacher;
}

export const StudentScorePrintDialog: React.FC<StudentScorePrintDialogProps> = ({
  open,
  onOpenChange,
  scores,
  students,
  teachers,
  gradeLevel,
  academicYear,
  principalName = "นายธนภูมิ ต๊ะสินธุ",
  homeRoomTeacher
}) => {
  const [editablePrincipalName, setEditablePrincipalName] = useState(principalName);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>(homeRoomTeacher);
  const handlePrint = () => {
    const printContent = document.querySelector('.print-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>บันทึกคะแนนนักเรียน</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 1cm;
            }
            body {
              font-family: 'Sarabun', 'Arial', sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 0;
              background: white;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-6 { margin-top: 24px; }
            .mt-12 { margin-top: 48px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .gap-4 { gap: 16px; }
            .inline-block { display: inline-block; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ตัวอย่างก่อนพิมพ์</DialogTitle>
          <DialogDescription>
            ตรวจสอบข้อมูลก่อนพิมพ์รายงานคะแนนนักเรียน
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="principalName">ชื่อผู้อำนวยการ</Label>
            <Input
              id="principalName"
              value={editablePrincipalName}
              onChange={(e) => setEditablePrincipalName(e.target.value)}
              placeholder="กรอกชื่อผู้อำนวยการ"
            />
          </div>
          <div>
            <Label htmlFor="homeRoomTeacher">ครูประจำชั้น</Label>
            <Select
              value={selectedTeacher?.id || ""}
              onValueChange={(value) => {
                const teacher = teachers.find(t => t.id === value);
                setSelectedTeacher(teacher);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกครูประจำชั้น" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id || ""}>
                    {teacher.firstName} {teacher.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
          <StudentScorePrintPreview
            scores={scores}
            students={students}
            teachers={teachers}
            gradeLevel={gradeLevel}
            academicYear={academicYear}
            principalName={editablePrincipalName}
            homeRoomTeacher={selectedTeacher}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            พิมพ์รายงาน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};