import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  studentId: string;
  firstNameTh: string;
  lastNameTh: string;
  titleTh: string;
  grade: string;
  academicYear: string;
}

interface CompetencyAssessment {
  student_id: string;
  total_score: number;
  grade: string;
}

interface StudentWithAssessment {
  id: string;
  studentId: string;
  studentName: string;
  totalScore: number;
  grade: string;
}

export const StudentReportPage = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<CompetencyAssessment[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [teacher, setTeacher] = useState('');
  const [principal, setPrincipal] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available academic years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('academicYear')
          .not('academicYear', 'is', null);
        
        if (error) throw error;
        
        const years = [...new Set(data.map(d => d.academicYear))].sort().reverse();
        setAvailableYears(years);
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };
    
    fetchAcademicYears();
  }, []);

  // Fetch available grades when academic year changes
  useEffect(() => {
    if (!academicYear) {
      setAvailableGrades([]);
      return;
    }

    const fetchGrades = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('grade')
          .eq('academicYear', academicYear)
          .not('grade', 'is', null);
        
        if (error) throw error;
        
        const grades = [...new Set(data.map(d => d.grade))].sort();
        setAvailableGrades(grades);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
    
    fetchGrades();
  }, [academicYear]);

  // Fetch students and assessments when both year and grade are selected
  useEffect(() => {
    if (!academicYear || !gradeLevel) {
      setStudents([]);
      setAssessments([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, studentId, firstNameTh, lastNameTh, titleTh, grade, academicYear')
          .eq('academicYear', academicYear)
          .eq('grade', gradeLevel)
          .order('studentId');

        if (studentsError) throw studentsError;

        // Fetch competency assessments for these students
        const studentIds = studentsData.map(s => s.id);
        
        if (studentIds.length > 0) {
          const { data: assessmentsData, error: assessmentsError } = await supabase
            .from('competency_assessments')
            .select('student_id, total_score, grade')
            .in('student_id', studentIds)
            .eq('academic_year', academicYear);

          if (assessmentsError) throw assessmentsError;

          setAssessments(assessmentsData || []);
        } else {
          setAssessments([]);
        }

        setStudents(studentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [academicYear, gradeLevel]);

  // Combine students with their assessments
  const studentsWithAssessments = useMemo(() => {
    return students.map(student => {
      // Find the total score for this student across all competencies
      const studentAssessments = assessments.filter(a => a.student_id === student.id);
      
      let totalScore = 0;
      let grade = 'ไม่ผ่าน';
      
      if (studentAssessments.length > 0) {
        // Sum up all total scores from different competency assessments
        totalScore = studentAssessments.reduce((sum, assessment) => sum + assessment.total_score, 0);
        
        // Calculate grade based on total score (following the criteria: 13-15=ดีเยี่ยม, 9-12=ดี, 5-8=ผ่าน, 0=ไม่ผ่าน)
        if (totalScore >= 13) {
          grade = 'ดีเยี่ยม';
        } else if (totalScore >= 9) {
          grade = 'ดี';
        } else if (totalScore >= 5) {
          grade = 'ผ่าน';
        } else {
          grade = 'ไม่ผ่าน';
        }
      }

      return {
        id: student.id,
        studentId: student.studentId,
        studentName: `${student.titleTh || ''}${student.firstNameTh} ${student.lastNameTh}`.trim(),
        totalScore,
        grade
      };
    });
  }, [students, assessments]);

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


  const handlePreview = () => {
    window.open('', '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          สรุปผลการประเมินรายชั้นเรียน
        </h2>
        <p className="text-gray-600 text-lg">
          บันทึกและสรุปผลการประเมินสมรรถนะของนักเรียนในแต่ละชั้น
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-700">ข้อมูลพื้นฐาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academic-year">ปีการศึกษา</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="academic-year">
                  <SelectValue placeholder="เลือกปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade-level">ชั้น</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel} disabled={!academicYear}>
                <SelectTrigger id="grade-level">
                  <SelectValue placeholder="เลือกชั้นเรียน" />
                </SelectTrigger>
                <SelectContent>
                  {availableGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade.startsWith('ป.') ? `ประถมศึกษาปีที่ ${grade.slice(2)}` : grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {academicYear && gradeLevel && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {/* Report Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">สรุปผลการประเมินรายชั้นเรียน</h1>
              <p className="text-lg mb-1">
                ชั้น{gradeLevel.startsWith('ป.') ? `ประถมศึกษาปีที่ ${gradeLevel.slice(2)}` : gradeLevel}
              </p>
              <p className="text-lg">ปีการศึกษา {academicYear}</p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : studentsWithAssessments.length === 0 ? (
              <div className="text-center py-8">
                <p>ไม่พบข้อมูลนักเรียนในชั้นและปีการศึกษาที่เลือก</p>
              </div>
            ) : (
              <>
                {/* Student Table */}
                <div className="overflow-x-auto mb-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center border">ลำดับที่</TableHead>
                        <TableHead className="border">ชื่อ-สกุล</TableHead>
                        <TableHead className="text-center border">ผลการประเมิน</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsWithAssessments.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell className="text-center border">{index + 1}</TableCell>
                          <TableCell className="border">{student.studentName}</TableCell>
                          <TableCell className="text-center border">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              student.grade === 'ดีเยี่ยม' ? 'bg-green-100 text-green-800' :
                              student.grade === 'ดี' ? 'bg-blue-100 text-blue-800' :
                              student.grade === 'ผ่าน' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.grade}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary Statistics */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-4 text-lg">สรุปผลการประเมิน</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-green-600 font-medium text-lg">ดีเยี่ยม</div>
                      <div className="text-2xl font-bold">{stats.excellent}</div>
                      <div className="text-sm text-gray-600">({stats.excellentPercent}%)</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-blue-600 font-medium text-lg">ดี</div>
                      <div className="text-2xl font-bold">{stats.good}</div>
                      <div className="text-sm text-gray-600">({stats.goodPercent}%)</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-yellow-600 font-medium text-lg">ผ่าน</div>
                      <div className="text-2xl font-bold">{stats.pass}</div>
                      <div className="text-sm text-gray-600">({stats.passPercent}%)</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-red-600 font-medium text-lg">ไม่ผ่าน</div>
                      <div className="text-2xl font-bold">{stats.fail}</div>
                      <div className="text-sm text-gray-600">({stats.failPercent}%)</div>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pt-8 border-t">
                  <div className="text-center">
                    <p className="mb-16">ผู้ประเมิน (ครูประจำชั้น)</p>
                    <div className="border-b border-black w-48 mx-auto mb-2"></div>
                    <Input
                      value={teacher}
                      onChange={(e) => setTeacher(e.target.value)}
                      placeholder="ชื่อครูประจำชั้น"
                      className="text-center border-none text-sm"
                    />
                  </div>
                  <div className="text-center">
                    <p className="mb-16">ผู้รับรอง (ผู้อำนวยการ)</p>
                    <div className="border-b border-black w-48 mx-auto mb-2"></div>
                    <Input
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      placeholder="ชื่อผู้อำนวยการ"
                      className="text-center border-none text-sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-8 mt-8 border-t">
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    ตัวอย่างก่อนพิมพ์
                  </Button>
                  
                  <Button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Printer className="h-4 w-4" />
                    พิมพ์
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};