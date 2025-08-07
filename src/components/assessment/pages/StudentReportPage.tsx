import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface StudentAssessment {
  id: string;
  studentId: string;
  studentName: string;
  score: number;
  grade: string;
}

export const StudentReportPage = () => {
  const [academicYear, setAcademicYear] = useState('2567');
  const [gradeLevel, setGradeLevel] = useState('');
  const [semester, setSemester] = useState('1');
  const [students, setStudents] = useState<StudentAssessment[]>([]);
  const [teacher, setTeacher] = useState('');
  const [principal, setPrincipal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Mock student data - replace with actual data from your system
  useEffect(() => {
    const mockStudents: StudentAssessment[] = [
      { id: '1', studentId: '001', studentName: 'เด็กชายจิรเมธ สายชล', score: 3, grade: 'ดีเยี่ยม' },
      { id: '2', studentId: '002', studentName: 'เด็กหญิงนภัสสร เสียงใส', score: 2, grade: 'ดี' },
      { id: '3', studentId: '003', studentName: 'เด็กชายพีรวัส มั่นใจ', score: 1, grade: 'ผ่าน' },
      { id: '4', studentId: '004', studentName: 'เด็กหญิงสุภางค์ ยอดเก่ง', score: 3, grade: 'ดีเยี่ยม' },
      { id: '5', studentId: '005', studentName: 'เด็กชายธนวัฒน์ คิดเก่ง', score: 2, grade: 'ดี' },
    ];
    setStudents(mockStudents);
  }, []);

  const updateStudentScore = (studentId: string, newScore: number) => {
    const getGrade = (score: number) => {
      switch (score) {
        case 3: return 'ดีเยี่ยม';
        case 2: return 'ดี';
        case 1: return 'ผ่าน';
        case 0: return 'ไม่ผ่าน';
        default: return 'ไม่ผ่าน';
      }
    };

    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, score: newScore, grade: getGrade(newScore) }
        : student
    ));
  };

  const getGradeStats = () => {
    const stats = {
      excellent: students.filter(s => s.score === 3).length,
      good: students.filter(s => s.score === 2).length,
      pass: students.filter(s => s.score === 1).length,
      fail: students.filter(s => s.score === 0).length,
    };
    
    const total = students.length;
    return {
      ...stats,
      total,
      excellentPercent: total > 0 ? ((stats.excellent / total) * 100).toFixed(1) : 0,
      goodPercent: total > 0 ? ((stats.good / total) * 100).toFixed(1) : 0,
      passPercent: total > 0 ? ((stats.pass / total) * 100).toFixed(1) : 0,
      failPercent: total > 0 ? ((stats.fail / total) * 100).toFixed(1) : 0,
    };
  };

  const stats = getGradeStats();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('บันทึกข้อมูลสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="academic-year">ปีการศึกษา</Label>
              <Input
                id="academic-year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="เช่น 2567"
              />
            </div>
            <div>
              <Label htmlFor="grade-level">ชั้น</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger id="grade-level">
                  <SelectValue placeholder="เลือกชั้นเรียน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ป.1">ประถมศึกษาปีที่ 1</SelectItem>
                  <SelectItem value="ป.2">ประถมศึกษาปีที่ 2</SelectItem>
                  <SelectItem value="ป.3">ประถมศึกษาปีที่ 3</SelectItem>
                  <SelectItem value="ป.4">ประถมศึกษาปีที่ 4</SelectItem>
                  <SelectItem value="ป.5">ประถมศึกษาปีที่ 5</SelectItem>
                  <SelectItem value="ป.6">ประถมศึกษาปีที่ 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="semester">ภาคเรียนที่</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="semester">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Assessment Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-blue-700">รายการนักเรียนและผลการประเมิน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">ลำดับที่</TableHead>
                  <TableHead>ชื่อ-สกุล</TableHead>
                  <TableHead className="text-center">ผลการประเมิน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell className="text-center">
                      <Select 
                        value={student.score.toString()} 
                        onValueChange={(value) => updateStudentScore(student.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">ดีเยี่ยม (3)</SelectItem>
                          <SelectItem value="2">ดี (2)</SelectItem>
                          <SelectItem value="1">ผ่าน (1)</SelectItem>
                          <SelectItem value="0">ไม่ผ่าน (0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">สรุปผลการประเมิน</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">ดีเยี่ยม</div>
                <div>{stats.excellent} คน ({stats.excellentPercent}%)</div>
              </div>
              <div className="text-center">
                <div className="font-medium">ดี</div>
                <div>{stats.good} คน ({stats.goodPercent}%)</div>
              </div>
              <div className="text-center">
                <div className="font-medium">ผ่าน</div>
                <div>{stats.pass} คน ({stats.passPercent}%)</div>
              </div>
              <div className="text-center">
                <div className="font-medium">ไม่ผ่าน</div>
                <div>{stats.fail} คน ({stats.failPercent}%)</div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-6 p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="teacher">ผู้ประเมิน (ครูประจำชั้น)</Label>
                <Input
                  id="teacher"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="ชื่อครูประจำชั้น"
                />
              </div>
              <div>
                <Label htmlFor="principal">ผู้รับรอง (ผู้อำนวยการ)</Label>
                <Input
                  id="principal"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="ชื่อผู้อำนวยการ"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t mt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
            
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
        </CardContent>
      </Card>
    </div>
  );
};