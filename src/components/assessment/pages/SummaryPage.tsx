import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, Save, Printer, FileText, TrendingUp, Users, Award } from 'lucide-react';
import { toast } from 'sonner';

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
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">ดีเยี่ยม</span>
                </div>
                <div className="text-2xl font-bold text-green-800">{overallStats.excellent}</div>
                <div className="text-xs text-green-600">
                  {totalAssessments > 0 ? ((overallStats.excellent / totalAssessments) * 100).toFixed(1) : 0}%
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">ดี</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{overallStats.good}</div>
                <div className="text-xs text-blue-600">
                  {totalAssessments > 0 ? ((overallStats.good / totalAssessments) * 100).toFixed(1) : 0}%
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">พอใช้</span>
                </div>
                <div className="text-2xl font-bold text-yellow-800">{overallStats.fair}</div>
                <div className="text-xs text-yellow-600">
                  {totalAssessments > 0 ? ((overallStats.fair / totalAssessments) * 100).toFixed(1) : 0}%
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
                  <span className="text-sm font-medium text-red-700">ต้องปรับปรุง</span>
                </div>
                <div className="text-2xl font-bold text-red-800">{overallStats.poor}</div>
                <div className="text-xs text-red-600">
                  {totalAssessments > 0 ? ((overallStats.poor / totalAssessments) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
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