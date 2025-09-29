import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getTeachers } from '@/utils/teacherStorage';
import { getStudents } from '@/utils/studentStorage';
import { Teacher } from '@/types/teacher';
import { Student } from '@/types/student';
import { Save, FileText, Printer } from 'lucide-react';
import { StudentScorePrintPreview } from './student-score/StudentScorePrintPreview';
import { StudentScorePrintDialog } from './student-score/StudentScorePrintDialog';

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

const SUBJECTS_BY_GRADE: Record<string, Subject[]> = {
  'ป.1': [
    { code: 'ท11101', name: 'ภาษาไทย' },
    { code: 'ค11101', name: 'คณิตศาสตร์' },
    { code: 'ว11101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
    { code: 'ส11101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
    { code: 'ส11102', name: 'ประวัติศาสตร์' },
    { code: 'พ11101', name: 'สุขศึกษาและพลศึกษา' },
    { code: 'ศ11101', name: 'ศิลปะ' },
    { code: 'ง11101', name: 'การงานอาชีพ' },
    { code: 'อ11101', name: 'ภาษาอังกฤษ' },
    { code: 'อ11201', name: 'ภาษาอังกฤษเพื่อการสื่อสาร' },
    { code: 'ส11202', name: 'ป้องกันการทุจริต' },
    { code: 'ว11101', name: 'วิทยาการคำนวณ' }
  ],
  'ป.2': [
    { code: 'ท12101', name: 'ภาษาไทย' },
    { code: 'ค12101', name: 'คณิตศาสตร์' },
    { code: 'ว12101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
    { code: 'ส12101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
    { code: 'ส12102', name: 'ประวัติศาสตร์' },
    { code: 'พ12101', name: 'สุขศึกษาและพลศึกษา' },
    { code: 'ศ12101', name: 'ศิลปะ' },
    { code: 'ง12101', name: 'การงานอาชีพ' },
    { code: 'อ12101', name: 'ภาษาอังกฤษ' },
    { code: 'อ12201', name: 'ภาษาอังกฤษเพื่อการสื่อสาร' },
    { code: 'ส12202', name: 'ป้องกันการทุจริต' },
    { code: 'ว12101', name: 'วิทยาการคำนวณ' }
  ],
  'ป.3': [
    { code: 'ท13101', name: 'ภาษาไทย' },
    { code: 'ค13101', name: 'คณิตศาสตร์' },
    { code: 'ว13101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
    { code: 'ส13101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
    { code: 'ส13102', name: 'ประวัติศาสตร์' },
    { code: 'พ13101', name: 'สุขศึกษาและพลศึกษา' },
    { code: 'ศ13101', name: 'ศิลปะ' },
    { code: 'ง13101', name: 'การงานอาชีพ' },
    { code: 'อ13101', name: 'ภาษาอังกฤษ' },
    { code: 'อ13201', name: 'ภาษาอังกฤษเพื่อการสื่อสาร' },
    { code: 'ส13202', name: 'ป้องกันการทุจริต' },
    { code: 'ว13101', name: 'วิทยาการคำนวณ' }
  ],
  'ป.4': [
    { code: 'ท14101', name: 'ภาษาไทย' },
    { code: 'ค14101', name: 'คณิตศาสตร์' },
    { code: 'ว14101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
    { code: 'ส14101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
    { code: 'ส14102', name: 'ประวัติศาสตร์' },
    { code: 'พ14101', name: 'สุขศึกษาและพลศึกษา' },
    { code: 'ศ14101', name: 'ศิลปะ' },
    { code: 'ง14101', name: 'การงานอาชีพ' },
    { code: 'อ14101', name: 'ภาษาอังกฤษ' },
    { code: 'อ14201', name: 'ภาษาอังกฤษเพื่อการสื่อสาร' },
    { code: 'ส14202', name: 'ป้องกันการทุจริต' },
    { code: 'ว14101', name: 'วิทยาการคำนวณ' }
  ],
  'ป.5': [
    { code: 'ท15101', name: 'ภาษาไทย' },
    { code: 'ค15101', name: 'คณิตศาสตร์' },
    { code: 'ว15101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
    { code: 'ส15101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
    { code: 'ส15102', name: 'ประวัติศาสตร์' },
    { code: 'พ15101', name: 'สุขศึกษาและพลศึกษา' },
    { code: 'ศ15101', name: 'ศิลปะ' },
    { code: 'ง15101', name: 'การงานอาชีพ' },
    { code: 'อ15101', name: 'ภาษาอังกฤษ' },
    { code: 'อ15201', name: 'ภาษาอังกฤษเพื่อการสื่อสาร' },
    { code: 'ส15202', name: 'ป้องกันการทุจริต' },
    { code: 'ว15101', name: 'วิทยาการคำนวณ' }
  ],
  'ป.6': [
    { code: 'ท16101', name: 'ภาษาไทย' },
    { code: 'ค16101', name: 'คณิตศาสตร์' },
    { code: 'ว16101', name: 'วิทยาศาสตร์และเทคโนโลยี' },
    { code: 'ส16101', name: 'สังคมศึกษา ศาสนาและวัฒนธรรม' },
    { code: 'ส16102', name: 'ประวัติศาสตร์' },
    { code: 'พ16101', name: 'สุขศึกษาและพลศึกษา' },
    { code: 'ศ16101', name: 'ศิลปะ' },
    { code: 'ง16101', name: 'การงานอาชีพ' },
    { code: 'อ16101', name: 'ภาษาอังกฤษ' },
    { code: 'อ16201', name: 'ภาษาอังกฤษเพื่อการสื่อสาร' },
    { code: 'ส16202', name: 'ป้องกันการทุจริต' },
    { code: 'ว16101', name: 'วิทยาการคำนวณ' }
  ]
};

const GRADE_LEVELS = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

export const StudentScoreManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [academicYear, setAcademicYear] = useState<string>(new Date().getFullYear() + 543 + '');
  const [studentScores, setStudentScores] = useState<StudentScore[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [allScoresForGrade, setAllScoresForGrade] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  useEffect(() => {
    loadTeachers();
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      const filtered = students.filter(student => student.grade === selectedGrade);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedGrade, students]);

  useEffect(() => {
    if (selectedTeacher && selectedGrade && selectedSubject) {
      loadStudentScores();
    } else {
      setStudentScores([]);
    }
  }, [selectedTeacher, selectedGrade, selectedSubject]);

  useEffect(() => {
    if (selectedGrade) {
      loadAllScoresForGrade();
    } else {
      setAllScoresForGrade([]);
    }
  }, [selectedGrade, academicYear]);

  const loadTeachers = async () => {
    const teacherData = await getTeachers();
    setTeachers(teacherData);
  };

  const loadStudents = async () => {
    const studentData = await getStudents();
    setStudents(studentData);
  };

  const loadAllScoresForGrade = async () => {
    if (!selectedGrade) return;

    try {
      const { data, error } = await supabase
        .from('student_scores')
        .select('*')
        .eq('grade_level', selectedGrade)
        .eq('academic_year', academicYear);

      if (error) {
        console.error('Error loading all scores for grade:', error);
        return;
      }

      setAllScoresForGrade(data || []);
    } catch (error) {
      console.error('Error loading all scores for grade:', error);
    }
  };

  const loadStudentScores = async () => {
    if (!selectedTeacher || !selectedGrade || !selectedSubject) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_scores')
        .select('*')
        .eq('teacher_id', selectedTeacher)
        .eq('grade_level', selectedGrade)
        .eq('subject_code', selectedSubject.code)
        .eq('academic_year', academicYear);

      if (error) {
        console.error('Error loading student scores:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลคะแนนได้",
          variant: "destructive",
        });
        return;
      }

      // Create scores for all students in the grade if they don't exist
      const existingScores = data || [];
      const scoresMap = existingScores.reduce((acc, score) => {
        acc[score.student_id] = score;
        return acc;
      }, {} as Record<string, any>);

      const allScores = filteredStudents.map(student => {
        const existingScore = scoresMap[student.id];
        if (existingScore) {
          return existingScore;
        }
        return {
          student_id: student.id,
          teacher_id: selectedTeacher,
          subject_code: selectedSubject.code,
          subject_name: selectedSubject.name,
          grade_level: selectedGrade,
          max_score: 100,
          score: 0,
          academic_year: academicYear,
        };
      });

      setStudentScores(allScores);
    } catch (error) {
      console.error('Error loading student scores:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลคะแนนได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, field: 'max_score' | 'score', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setStudentScores(prev => 
      prev.map(score => 
        score.student_id === studentId 
          ? { ...score, [field]: numericValue }
          : score
      )
    );
    setHasUnsavedChanges(true);
  };

  const saveScores = async () => {
    if (!selectedTeacher || !selectedGrade || !selectedSubject) return;

    setLoading(true);
    try {
      const scoresWithIds = studentScores.filter(score => score.id);
      const scoresWithoutIds = studentScores.filter(score => !score.id);

      // Update existing scores
      if (scoresWithIds.length > 0) {
        for (const score of scoresWithIds) {
          const { error } = await supabase
            .from('student_scores')
            .update({
              max_score: score.max_score,
              score: score.score,
              updated_at: new Date().toISOString()
            })
            .eq('id', score.id);

          if (error) {
            console.error('Error updating score:', error);
            throw error;
          }
        }
      }

      // Insert new scores
      if (scoresWithoutIds.length > 0) {
        const { error } = await supabase
          .from('student_scores')
          .insert(scoresWithoutIds);

        if (error) {
          console.error('Error inserting scores:', error);
          throw error;
        }
      }

      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกคะแนนนักเรียนเรียบร้อยแล้ว",
      });

      setHasUnsavedChanges(false);
      loadStudentScores(); // Reload to get updated data with IDs
    } catch (error) {
      console.error('Error saving scores:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกคะแนนได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return '';
    return `${student.titleTh}${student.firstNameTh} ${student.lastNameTh}`;
  };

  const getStudentId = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.studentId || '';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return '';
    return `${teacher.firstName} ${teacher.lastName}`;
  };

  const canShowScores = selectedTeacher && selectedGrade && selectedSubject && filteredStudents.length > 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            ระบบเก็บคะแนนนักเรียน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="academicYear">ปีการศึกษา</Label>
              <Input
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2567"
              />
            </div>

            <div>
              <Label htmlFor="teacher">เลือกครูผู้สอน</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกครู" />
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

            <div>
              <Label htmlFor="grade">เลือกชั้นเรียน</Label>
              <Select value={selectedGrade} onValueChange={(value) => {
                setSelectedGrade(value);
                setSelectedSubject(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกชั้น" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">เลือกรายวิชา</Label>
              <Select 
                value={selectedSubject?.code || ''} 
                onValueChange={(value) => {
                  const subject = selectedGrade ? 
                    SUBJECTS_BY_GRADE[selectedGrade]?.find(s => s.code === value) : null;
                  setSelectedSubject(subject || null);
                }}
                disabled={!selectedGrade}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกวิชา" />
                </SelectTrigger>
                <SelectContent>
                  {selectedGrade && SUBJECTS_BY_GRADE[selectedGrade]?.map((subject) => (
                    <SelectItem key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {canShowScores && (
            <div className="flex gap-2">
              <Button
                onClick={saveScores}
                disabled={loading || !hasUnsavedChanges}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? 'กำลังบันทึก...' : 'บันทึกคะแนน'}
              </Button>
              
              <Button
                onClick={() => setShowPrintDialog(true)}
                variant="outline"
                className="flex items-center gap-2"
                disabled={allScoresForGrade.length === 0}
              >
                <Printer className="h-4 w-4" />
                ตัวอย่างก่อนพิมพ์
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {canShowScores && (
        <Card>
          <CardHeader>
            <CardTitle>
              คะแนนนักเรียน {selectedGrade} - {selectedSubject?.name}
              {selectedTeacher && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ครูผู้สอน: {getTeacherName(selectedTeacher)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสนักเรียน</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>คะแนนเต็ม</TableHead>
                      <TableHead>คะแนนที่ได้</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentScores.map((score) => (
                      <TableRow key={score.student_id}>
                        <TableCell>{getStudentId(score.student_id)}</TableCell>
                        <TableCell>{getStudentName(score.student_id)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={score.max_score}
                            onChange={(e) => handleScoreChange(score.student_id, 'max_score', e.target.value)}
                            min="0"
                            max="1000"
                            step="0.01"
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={score.score}
                            onChange={(e) => handleScoreChange(score.student_id, 'score', e.target.value)}
                            min="0"
                            max={score.max_score}
                            step="0.01"
                            className="w-24"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <StudentScorePrintDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        scores={allScoresForGrade}
        students={students}
        teachers={teachers}
        gradeLevel={selectedGrade}
        academicYear={academicYear}
        principalName="นางสาวสุทิตา ใจดี"
        homeRoomTeacher={teachers.find(t => t.position?.includes('ครูประจำชั้น'))}
      />
    </div>
  );
};