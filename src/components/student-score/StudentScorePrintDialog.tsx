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
              font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', Arial, sans-serif;
              font-size: 21px;
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
            .mt-8 { margin-top: 32px; }
            .mt-12 { margin-top: 48px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .gap-4 { gap: 16px; }
            .inline-block { display: inline-block; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .justify-center { justify-content: center; }
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

        <div className="border rounded-lg p-4 bg-gray-50" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
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
