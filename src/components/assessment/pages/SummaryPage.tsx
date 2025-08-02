import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Save, Printer, FileText, TrendingUp, Users, Award, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface StudentAssessment {
  id: string;
  studentId: string;
  name: string;
  competency1: number;
  competency2: number;
  competency3: number;
  competency4: number;
  competency5: number;
  totalScore: number;
  grade: string;
}

const getGradeFromScore = (score: number): string => {
  if (score >= 65) return 'ดีเยี่ยม'; // 13*5 = 65
  if (score >= 45) return 'ดี';      // 9*5 = 45
  if (score >= 25) return 'ผ่าน';     // 5*5 = 25
  return 'ไม่ผ่าน';
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'ดีเยี่ยม': return 'bg-green-100 text-green-800';
    case 'ดี': return 'bg-blue-100 text-blue-800';
    case 'ผ่าน': return 'bg-yellow-100 text-yellow-800';
    case 'ไม่ผ่าน': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const SummaryPage = () => {
  const [summaryData, setSummaryData] = useState({
    academicYear: '',
    semester: '',
    grade: '',
    totalStudents: '',
    assessmentPeriod: '',
    summary: '',
    recommendations: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Mock student assessment data
  const [studentAssessments] = useState<StudentAssessment[]>([
    {
      id: '1',
      studentId: '001',
      name: 'นายสมชาย ใจดี',
      competency1: 12, competency2: 11, competency3: 13, competency4: 10, competency5: 14,
      totalScore: 60,
      grade: getGradeFromScore(60)
    },
    {
      id: '2',
      studentId: '002',
      name: 'นางสาวสมหญิง รักเรียน',
      competency1: 15, competency2: 14, competency3: 15, competency4: 13, competency5: 15,
      totalScore: 72,
      grade: getGradeFromScore(72)
    },
    {
      id: '3',
      studentId: '003',
      name: 'นายวิชาติ มีปัญญา',
      competency1: 8, competency2: 9, competency3: 7, competency4: 8, competency5: 9,
      totalScore: 41,
      grade: getGradeFromScore(41)
    }
  ]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = studentAssessments.length;
    const excellent = studentAssessments.filter(s => s.grade === 'ดีเยี่ยม').length;
    const good = studentAssessments.filter(s => s.grade === 'ดี').length;
    const pass = studentAssessments.filter(s => s.grade === 'ผ่าน').length;
    const fail = studentAssessments.filter(s => s.grade === 'ไม่ผ่าน').length;
    
    const averageScore = total > 0 ? studentAssessments.reduce((sum, s) => sum + s.totalScore, 0) / total : 0;
    
    return {
      total,
      excellent,
      good,
      pass,
      fail,
      averageScore: averageScore.toFixed(1),
      excellentPercentage: total > 0 ? ((excellent / total) * 100).toFixed(1) : '0',
      goodPercentage: total > 0 ? ((good / total) * 100).toFixed(1) : '0',
      passPercentage: total > 0 ? ((pass / total) * 100).toFixed(1) : '0',
      failPercentage: total > 0 ? ((fail / total) * 100).toFixed(1) : '0'
    };
  }, [studentAssessments]);

  const handleInputChange = (field: string, value: string) => {
    setSummaryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('บันทึกข้อมูลสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Mock data for demonstration
  const competencyStats = [
    { name: 'สมรรถนะด้านที่ 1', excellent: 25, good: 18, fair: 12, poor: 5 },
    { name: 'สมรรถนะด้านที่ 2', excellent: 22, good: 20, fair: 10, poor: 8 },
    { name: 'สมรรถนะด้านที่ 3', excellent: 28, good: 15, fair: 14, poor: 3 },
    { name: 'สมรรถนะด้านที่ 4', excellent: 20, good: 22, fair: 15, poor: 3 },
    { name: 'สมรรถนะด้านที่ 5', excellent: 26, good: 19, fair: 11, poor: 4 },
  ];

  const overallStats = {
    excellent: competencyStats.reduce((sum, stat) => sum + stat.excellent, 0),
    good: competencyStats.reduce((sum, stat) => sum + stat.good, 0),
    fair: competencyStats.reduce((sum, stat) => sum + stat.fair, 0),
    poor: competencyStats.reduce((sum, stat) => sum + stat.poor, 0),
  };

  const totalAssessments = overallStats.excellent + overallStats.good + overallStats.fair + overallStats.poor;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
          สรุปผลการประเมินรายชั้นปี
        </h2>
        <p className="text-gray-600 text-lg">
          สรุปและวิเคราะห์ผลการประเมินสมรรถนะของนักเรียนในระดับชั้นปี
        </p>
      </div>

      {/* Basic Information */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-emerald-700">
            <BarChart3 className="h-6 w-6" />
            ข้อมูลพื้นฐาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="academicYear" className="text-sm font-medium text-gray-700">
                  ปีการศึกษา
                </Label>
                <Input
                  id="academicYear"
                  value={summaryData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  placeholder="เช่น 2567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="semester" className="text-sm font-medium text-gray-700">
                  ภาคเรียน
                </Label>
                <Select value={summaryData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกภาคเรียน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">ภาคเรียนที่ 1</SelectItem>
                    <SelectItem value="2">ภาคเรียนที่ 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-sm font-medium text-gray-700">
                  ระดับชั้น
                </Label>
                <Select value={summaryData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกระดับชั้น" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m1">มัธยมศึกษาปีที่ 1</SelectItem>
                    <SelectItem value="m2">มัธยมศึกษาปีที่ 2</SelectItem>
                    <SelectItem value="m3">มัธยมศึกษาปีที่ 3</SelectItem>
                    <SelectItem value="m4">มัธยมศึกษาปีที่ 4</SelectItem>
                    <SelectItem value="m5">มัธยมศึกษาปีที่ 5</SelectItem>
                    <SelectItem value="m6">มัธยมศึกษาปีที่ 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalStudents" className="text-sm font-medium text-gray-700">
                  จำนวนนักเรียนทั้งหมด
                </Label>
                <Input
                  id="totalStudents"
                  type="number"
                  value={summaryData.totalStudents}
                  onChange={(e) => handleInputChange('totalStudents', e.target.value)}
                  placeholder="ระบุจำนวนนักเรียน"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessmentPeriod" className="text-sm font-medium text-gray-700">
                  ช่วงเวลาการประเมิน
                </Label>
                <Input
                  id="assessmentPeriod"
                  value={summaryData.assessmentPeriod}
                  onChange={(e) => handleInputChange('assessmentPeriod', e.target.value)}
                  placeholder="เช่น ม.ค. - มี.ค. 2567"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
            <TrendingUp className="h-6 w-6" />
            สถิติการประเมินโดยรวม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <div className="text-3xl font-bold text-purple-700 mb-2">{statistics.total}</div>
                <div className="text-purple-600">จำนวนนักเรียนทั้งหมด</div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <div className="text-3xl font-bold text-green-700 mb-2">{statistics.excellent}</div>
                <div className="text-green-600">ระดับดีเยี่ยม ({statistics.excellentPercentage}%)</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl font-bold text-blue-700 mb-2">{statistics.averageScore}</div>
                <div className="text-blue-600">คะแนนเฉลี่ย</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-6 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                <div className="text-3xl font-bold text-orange-700 mb-2">
                  {statistics.total - statistics.fail}
                </div>
                <div className="text-orange-600">ผ่านเกณฑ์ประเมิน</div>
              </CardContent>
            </Card>
          </div>

          {/* Grade Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">การกระจายของเกรด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'ดีเยี่ยม', count: statistics.excellent, percentage: statistics.excellentPercentage, color: 'bg-green-100 text-green-800' },
                  { label: 'ดี', count: statistics.good, percentage: statistics.goodPercentage, color: 'bg-blue-100 text-blue-800' },
                  { label: 'ผ่าน', count: statistics.pass, percentage: statistics.passPercentage, color: 'bg-yellow-100 text-yellow-800' },
                  { label: 'ไม่ผ่าน', count: statistics.fail, percentage: statistics.failPercentage, color: 'bg-red-100 text-red-800' }
                ].map((stat) => (
                  <div key={stat.label} className={`p-4 rounded-lg text-center ${stat.color}`}>
                    <div className="text-2xl font-bold">{stat.count}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                    <div className="text-xs">({stat.percentage}%)</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Assessment Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">รายละเอียดผลการประเมินรายบุคคล</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-center">ลำดับ</TableHead>
                      <TableHead className="text-center">รหัสนักเรียน</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead className="text-center">สมรรถนะ 1</TableHead>
                      <TableHead className="text-center">สมรรถนะ 2</TableHead>
                      <TableHead className="text-center">สมรรถนะ 3</TableHead>
                      <TableHead className="text-center">สมรรถนะ 4</TableHead>
                      <TableHead className="text-center">สมรรถนะ 5</TableHead>
                      <TableHead className="text-center">คะแนนรวม</TableHead>
                      <TableHead className="text-center">ผลการประเมิน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentAssessments.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="text-center font-medium">{student.studentId}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-center">{student.competency1}</TableCell>
                        <TableCell className="text-center">{student.competency2}</TableCell>
                        <TableCell className="text-center">{student.competency3}</TableCell>
                        <TableCell className="text-center">{student.competency4}</TableCell>
                        <TableCell className="text-center">{student.competency5}</TableCell>
                        <TableCell className="text-center font-bold">{student.totalScore}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.grade)}`}>
                            {student.grade}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Competency Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-700">ผลการประเมินรายสมรรถนะ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">สมรรถนะ</th>
                    <th className="text-center py-3 px-4 font-medium text-green-700">ดีเยี่ยม</th>
                    <th className="text-center py-3 px-4 font-medium text-blue-700">ดี</th>
                    <th className="text-center py-3 px-4 font-medium text-yellow-700">พอใช้</th>
                    <th className="text-center py-3 px-4 font-medium text-red-700">ต้องปรับปรุง</th>
                  </tr>
                </thead>
                <tbody>
                  {competencyStats.map((stat, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{stat.name}</td>
                      <td className="text-center py-3 px-4 text-green-600 font-semibold">{stat.excellent}</td>
                      <td className="text-center py-3 px-4 text-blue-600 font-semibold">{stat.good}</td>
                      <td className="text-center py-3 px-4 text-yellow-600 font-semibold">{stat.fair}</td>
                      <td className="text-center py-3 px-4 text-red-600 font-semibold">{stat.poor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary and Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-700">สรุปและข้อเสนอแนะ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-6 shadow-sm border space-y-6">
            <div className="space-y-2">
              <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
                สรุปผลการประเมิน
              </Label>
              <Textarea
                id="summary"
                value={summaryData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="สรุปผลการประเมินสมรรถนะของนักเรียนในระดับชั้นปี..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations" className="text-sm font-medium text-gray-700">
                ข้อเสนอแนะและแนวทางพัฒนา
              </Label>
              <Textarea
                id="recommendations"
                value={summaryData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                placeholder="ข้อเสนอแนะและแนวทางในการพัฒนาสมรรถนะของนักเรียน..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </Button>
              
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                พิมพ์รายงาน
              </Button>
              
              <Button
                variant="ghost"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                ส่งออกรายงาน
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};