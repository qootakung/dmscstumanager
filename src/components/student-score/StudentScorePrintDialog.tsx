import React, { useState, useMemo, useEffect } from 'react';
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
import { Printer, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface StudentScorePrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scores: StudentScore[];
  students: Student[];
  teachers: Teacher[];
  gradeLevel: string;
  academicYear: string;
  semester?: string;
  principalName?: string;
  homeRoomTeacher?: Teacher;
}

export const StudentScorePrintDialog: React.FC<StudentScorePrintDialogProps> = ({
  open,
  onOpenChange,
  scores: propScores,
  students,
  teachers,
  gradeLevel,
  academicYear: propAcademicYear,
  semester: propSemester = '1',
  principalName = "นายธนภูมิ ต๊ะสินธุ",
  homeRoomTeacher
}) => {
  const [editablePrincipalName, setEditablePrincipalName] = useState(principalName);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>(homeRoomTeacher);
  const [selectedGrade, setSelectedGrade] = useState<string>(gradeLevel || 'all');
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>(propSemester);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(propAcademicYear || '');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  
  // DB-loaded scores
  const [dbScores, setDbScores] = useState<StudentScore[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);

  // Load available academic years when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableYears();
    }
  }, [open]);

  // Load scores from DB when filters change
  useEffect(() => {
    if (open && selectedAcademicYear) {
      loadScoresFromDB();
    }
  }, [open, selectedGrade, selectedAcademicYear, selectedSemester]);

  const loadAvailableYears = async () => {
    try {
      const { data: scoreYears } = await supabase
        .from('student_scores')
        .select('academic_year')
        .order('academic_year', { ascending: false });

      const { data: studentYears } = await supabase
        .from('students')
        .select('academicYear')
        .order('academicYear', { ascending: false });

      const allYears = new Set<string>();
      scoreYears?.forEach(item => { if (item.academic_year) allYears.add(item.academic_year); });
      studentYears?.forEach(item => { if (item.academicYear) allYears.add(item.academicYear); });

      const sorted = Array.from(allYears).sort((a, b) => parseInt(b) - parseInt(a));
      setAvailableYears(sorted);

      if (!selectedAcademicYear && sorted.length > 0) {
        setSelectedAcademicYear(sorted[0]);
      }
    } catch (error) {
      console.error('Error loading academic years:', error);
    }
  };

  const loadScoresFromDB = async () => {
    setLoadingScores(true);
    try {
      let query = supabase
        .from('student_scores')
        .select('*')
        .eq('academic_year', selectedAcademicYear)
        .eq('semester', selectedSemester);

      if (selectedGrade && selectedGrade !== 'all') {
        query = query.eq('grade_level', selectedGrade);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading scores from DB:', error);
        return;
      }

      const scoresWithFixedMax = (data || []).map(score => ({
        ...score,
        max_score: 50
      }));

      console.log('Loaded scores from DB:', {
        count: scoresWithFixedMax.length,
        grade: selectedGrade,
        year: selectedAcademicYear,
        semester: selectedSemester,
        sample: scoresWithFixedMax.slice(0, 3).map(s => ({
          subject: s.subject_code,
          score: s.score,
          student: s.student_id
        }))
      });

      setDbScores(scoresWithFixedMax);
    } catch (error) {
      console.error('Error loading scores:', error);
    } finally {
      setLoadingScores(false);
    }
  };

  const scores = dbScores.length > 0 || loadingScores ? dbScores : propScores;

  useEffect(() => {
    if (principalName) {
      setEditablePrincipalName(principalName);
    }
  }, [principalName]);

  useEffect(() => {
    setSelectedGrade(gradeLevel || 'all');
  }, [gradeLevel]);

  useEffect(() => {
    setSelectedAcademicYear(propAcademicYear || '');
  }, [propAcademicYear]);

  useEffect(() => {
    setSelectedSemester(propSemester);
  }, [propSemester]);

  useEffect(() => {
    setCurrentStudentIndex(0);
  }, [selectedGrade, selectedSemester, selectedAcademicYear]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Get unique grade levels from students - filter by semester and year
  const availableGrades = useMemo(() => {
    const filtered = students.filter(s => 
      s.semester === selectedSemester && 
      s.academicYear === selectedAcademicYear
    );
    const grades = [...new Set(filtered.map(s => s.grade))].filter(Boolean).sort();
    return grades;
  }, [students, selectedSemester, selectedAcademicYear]);

  // Filter students by selected grade, semester, and year - deduplicate
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(s => 
      s.semester === selectedSemester &&
      s.academicYear === selectedAcademicYear
    );
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(s => s.grade === selectedGrade);
    }
    const seen = new Set<string>();
    return filtered.filter(s => {
      const key = s.studentId || s.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [students, selectedGrade, selectedSemester, selectedAcademicYear]);

  const selectedStudent = useMemo(() => {
    if (filteredStudents.length === 0) return undefined;
    return filteredStudents[Math.min(currentStudentIndex, filteredStudents.length - 1)];
  }, [filteredStudents, currentStudentIndex]);

  const filteredScores = useMemo(() => {
    const targetGrade = selectedStudent?.grade || selectedGrade;
    if (targetGrade === 'all') return scores;
    const normalizedTargetGrade = targetGrade.trim();
    return scores.filter(s => s.grade_level?.trim() === normalizedTargetGrade);
  }, [scores, selectedGrade, selectedStudent]);

  const handlePrevious = () => {
    setCurrentStudentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStudentIndex(prev => Math.min(filteredStudents.length - 1, prev + 1));
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setCurrentStudentIndex(0);
  };

  const handlePrint = async () => {
    const printContent = document.querySelector('.print-content');
    if (!printContent) return;

    // ต้องเปิดหน้าต่างทันทีในจังหวะที่ผู้ใช้คลิก ไม่เช่นนั้นเบราว์เซอร์จะบล็อกป๊อปอัป
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="utf-8" />
          <title>รายงานผลคะแนนผู้เรียนรายบุคคล</title>
          <!-- ฟอนต์สำรอง: เครื่องที่ไม่มี TH Sarabun จะได้ตัวอักษรไทยหน้าตาใกล้เคียงกัน -->
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet" />
          <style>
            /*
              margin: 0 เพื่อตัดหัว/ท้ายกระดาษของเบราว์เซอร์ (วันที่, URL, เลขหน้า)
              ขอบกระดาษจริงควบคุมด้วย padding ของ .sheet แทน จึงเหมือนกันทุกเครื่อง
            */
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            body {
              font-family: 'TH SarabunPSK', 'TH Sarabun New', 'TH Sarabun', 'Sarabun', Arial, sans-serif;
              font-size: 16pt;
              line-height: 1.3;
              color: #000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* แผ่น A4 ความสูงคงที่ ต่ำกว่า 297mm เล็กน้อย กันการปัดเศษจนล้นไปหน้าที่ 2 */
            .sheet {
              width: 210mm;
              height: 296mm;
              padding: 10mm 12mm;
              margin: 0 auto;
              overflow: hidden;
              page-break-after: avoid;
              break-after: avoid;
            }
            /* พื้นที่เนื้อหา 186mm x 276mm ถ้าล้นจะถูกย่ออัตโนมัติด้วยสคริปต์ */
            .fit {
              width: 186mm;
              transform-origin: top center;
            }
            .print-content {
              width: 186mm;
              max-width: 186mm;
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; break-inside: avoid; }
            th, td {
              border: 1px solid #000;
              padding: 2px 4px;
              line-height: 1.25;
              vertical-align: middle;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            img {
              max-width: 26mm;
              max-height: 26mm;
            }
            /* utility classes used by the preview markup */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 16px; }
            .mt-6 { margin-top: 20px; }
            .mt-8 { margin-top: 20px; }
            .mt-12 { margin-top: 32px; }
            .flex { display: flex; }
            .inline-block { display: inline-block; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-start { align-items: flex-start; }
            .flex-1 { flex: 1 1 0%; }
            .w-full { width: 100%; }
            @media screen {
              body { background: #e5e7eb; }
              .sheet { background: #ffffff; margin: 8px auto; box-shadow: 0 0 6px rgba(0, 0, 0, 0.25); }
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="sheet" id="sheet">
            <div class="fit" id="fit">
              ${printContent.outerHTML}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // รอให้ฟอนต์และรูปโลโก้โหลดเสร็จก่อน ไม่งั้นการจัดหน้าจะเพี้ยนและวัดความสูงผิด
    const waitForPrintAssets = async (win: Window) => {
      const doc = win.document;
      const pending: Promise<unknown>[] = [];

      doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        if (!(link as HTMLLinkElement).sheet) {
          pending.push(
            new Promise((resolve) => {
              link.addEventListener('load', resolve, { once: true });
              link.addEventListener('error', resolve, { once: true });
            })
          );
        }
      });

      doc.querySelectorAll('img').forEach((img) => {
        if (!img.complete) {
          pending.push(
            new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
          );
        }
      });

      const timeout = new Promise((resolve) => setTimeout(resolve, 3000));

      // 1) รอ stylesheet/รูป  2) สั่งโหลดฟอนต์ที่ใช้จริง  3) รอให้เบราว์เซอร์จัดวางใหม่
      await Promise.race([Promise.all(pending), timeout]);
      if (doc.fonts) {
        await Promise.race([
          Promise.all([
            doc.fonts.load('16pt "Sarabun"', 'ก'),
            doc.fonts.load('bold 16pt "Sarabun"', 'ก'),
          ]).then(() => doc.fonts.ready),
          timeout,
        ]);
      }
      await new Promise((resolve) => win.requestAnimationFrame(() => resolve(null)));
    };

    // ถ้าเนื้อหาสูง/กว้างเกินพื้นที่ A4 ให้ย่ออัตโนมัติให้พอดี 1 หน้า (ไม่ขยายเมื่อพื้นที่เหลือ)
    const fitToA4 = (win: Window) => {
      const doc = win.document;
      const sheet = doc.getElementById('sheet');
      const fit = doc.getElementById('fit');
      if (!sheet || !fit) return;

      const style = win.getComputedStyle(sheet);
      const availH =
        sheet.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const availW =
        sheet.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

      const needH = fit.offsetHeight;
      const needW = fit.scrollWidth;
      if (!needH || !needW) return;

      const ratioH = availH / needH;
      const ratioW = availW / needW;
      // เผื่อ 1% กันเศษทศนิยมของเครื่องพิมพ์แต่ละรุ่น
      const scaleH = ratioH >= 1 ? 1 : ratioH * 0.99;
      const scaleW = ratioW >= 1 ? 1 : ratioW * 0.99;
      const scale = Math.min(scaleH, scaleW);

      if (scale < 1) {
        fit.style.transform = `scale(${scale})`;
        fit.style.transformOrigin = 'top center';
      }
    };

    try {
      await waitForPrintAssets(printWindow);
      fitToA4(printWindow);
    } catch (error) {
      console.error('Error preparing print layout:', error);
    }

    // ปิดหน้าต่างหลังพิมพ์เสร็จเท่านั้น กันการพิมพ์หลุด/ขาดหน้าบนไดรเวอร์บางรุ่น
    printWindow.onafterprint = () => printWindow.close();
    printWindow.print();
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

        <div className="space-y-4 mb-4">
          {/* Academic Year and Semester Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ปีการศึกษา</Label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ภาคเรียน</Label>
              <Select value={selectedSemester} onValueChange={(val) => { setSelectedSemester(val); setCurrentStudentIndex(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกภาคเรียน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ภาคเรียนที่ 1</SelectItem>
                  <SelectItem value="2">ภาคเรียนที่ 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                value={selectedTeacher?.id || "none"}
                onValueChange={(value) => {
                  const teacher = value === "none" ? undefined : teachers.find(t => t.id === value);
                  setSelectedTeacher(teacher);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกครูประจำชั้น" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- ไม่ระบุ --</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id || `teacher-${teacher.firstName}-${teacher.lastName}`}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="gradeLevel">เลือกชั้น</Label>
            <Select
              value={selectedGrade}
              onValueChange={handleGradeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกชั้นเรียน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกชั้น</SelectItem>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade!}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="logoUpload">เลือกรูป Logo โรงเรียน</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="flex-1"
              />
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo preview" 
                  className="h-12 w-12 object-contain border rounded"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>เลือกนักเรียน ({filteredStudents.length > 0 ? `${currentStudentIndex + 1} / ${filteredStudents.length}` : '0 / 0'})</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentStudentIndex === 0}
                className="h-10 w-10 shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 text-center py-2 px-4 bg-muted rounded-md font-medium">
                {selectedStudent ? `${selectedStudent.firstNameTh} ${selectedStudent.lastNameTh}` : 'ไม่มีนักเรียน'}
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentStudentIndex >= filteredStudents.length - 1}
                className="h-10 w-10 shrink-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {loadingScores && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังโหลดข้อมูลคะแนน...</span>
            </div>
          )}

          {!loadingScores && scores.length === 0 && selectedGrade !== 'all' && (
            <div className="text-center text-amber-600 text-sm">
              ไม่พบข้อมูลคะแนนสำหรับชั้น {selectedGrade} ปีการศึกษา {selectedAcademicYear} ภาคเรียนที่ {selectedSemester}
            </div>
          )}
        </div>

        <div className="border rounded-lg bg-gray-50" style={{ boxSizing: 'border-box', width: '210mm', minHeight: '297mm', padding: '10mm 12mm', margin: '0 auto', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
          <StudentScorePrintPreview
            scores={filteredScores}
            students={filteredStudents}
            teachers={teachers}
            gradeLevel={selectedStudent?.grade || selectedGrade}
            academicYear={selectedAcademicYear}
            semester={selectedSemester}
            principalName={editablePrincipalName}
            homeRoomTeacher={selectedTeacher}
            selectedStudent={selectedStudent}
            logoUrl={logoUrl}
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
