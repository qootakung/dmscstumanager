import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Printer, Users, Activity, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Student } from '@/types/student';

const DentalMilkTracking = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(2568);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeData, setGradeData] = useState<any[]>([]);
  const [recordingMode, setRecordingMode] = useState<'brushing' | 'milk'>('brushing');

  // Load student data from database
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('grade', { ascending: true });
        
        if (error) throw error;
        
        setStudents(data as Student[] || []);
        
        // Calculate grade statistics from real data
        const gradeStats = calculateGradeStatistics(data as Student[] || []);
        setGradeData(gradeStats);
      } catch (error) {
        console.error('Error loading students:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลนักเรียนได้",
          variant: "destructive",
        });
      }
    };

    loadStudents();
  }, []);

  // Calculate grade statistics from student data
  const calculateGradeStatistics = (studentData: Student[]) => {
    const grades = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
    
    return grades.map(grade => {
      const gradeStudents = studentData.filter(s => s.grade === grade);
      const studentCount = gradeStudents.length;
      
      // Mock today's activity data - in real app, this would come from dental_records table
      const mockBrushing = Math.floor(studentCount * (0.7 + Math.random() * 0.3));
      const mockMilk = Math.floor(studentCount * (0.75 + Math.random() * 0.25));
      
      return {
        grade,
        students: studentCount,
        brushing: mockBrushing,
        milk: mockMilk,
        brushingRate: studentCount > 0 ? (mockBrushing / studentCount) * 100 : 0,
        milkRate: studentCount > 0 ? (mockMilk / studentCount) * 100 : 0,
      };
    }).filter(g => g.students > 0);
  };

  const totalStudents = students.length;
  const todayBrushing = gradeData.reduce((sum, g) => sum + g.brushing, 0);
  const todayMilk = gradeData.reduce((sum, g) => sum + g.milk, 0);
  const completionRate = totalStudents > 0 ? ((todayBrushing + todayMilk) / (totalStudents * 2)) * 100 : 0;

  const handleExportExcel = () => {
    toast({
      title: "กำลังส่งออกข้อมูล",
      description: "ข้อมูลการแปรงฟันและดื่มนมกำลังถูกส่งออกเป็นไฟล์ Excel",
    });
  };

  const handlePrint = () => {
    toast({
      title: "กำลังพิมพ์รายงาน",
      description: "รายงานการแปรงฟันและดื่มนมกำลังถูกส่งไปยังเครื่องพิมพ์",
    });
  };

  const months = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' },
  ];

  const years = Array.from({ length: 18 }, (_, i) => 2568 + i); // 2568-2585

  // Generate calendar days for the selected month
  const getDaysInMonth = (month: number, year: number) => {
    const gregorianYear = year - 543; // Convert Buddhist to Gregorian year
    const daysInMonth = new Date(gregorianYear, month, 0).getDate();
    const firstDay = new Date(gregorianYear, month - 1, 1).getDay();
    
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(gregorianYear, month - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      
      days.push({
        day,
        isWeekend,
        date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(selectedMonth, selectedYear);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-school-primary">
            บันทึกแปรงฟันดื่มนม
          </h1>
          <p className="text-muted-foreground mt-2">
            ระบบติดตามการแปรงฟันและดื่มนมของนักเรียนแบบรายวันและรายเดือน
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportExcel} variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
            <Download className="w-4 h-4 mr-2" />
            ส่งออก Excel
          </Button>
          <Button onClick={handlePrint} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์รายงาน
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex space-x-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">เดือน</label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">ปี</label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">ระดับชั้น</label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกระดับชั้น</SelectItem>
              <SelectItem value="อ.1">อนุบาล 1</SelectItem>
              <SelectItem value="อ.2">อนุบาล 2</SelectItem>
              <SelectItem value="อ.3">อนุบาล 3</SelectItem>
              <SelectItem value="ป.1">ประถม 1</SelectItem>
              <SelectItem value="ป.2">ประถม 2</SelectItem>
              <SelectItem value="ป.3">ประถม 3</SelectItem>
              <SelectItem value="ป.4">ประถม 4</SelectItem>
              <SelectItem value="ป.5">ประถม 5</SelectItem>
              <SelectItem value="ป.6">ประถม 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">นักเรียนทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{totalStudents}</div>
            <p className="text-xs text-blue-600 mt-1">คน</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">แปรงฟันวันนี้</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{todayBrushing}</div>
            <p className="text-xs text-green-600 mt-1">คน ({totalStudents > 0 ? ((todayBrushing / totalStudents) * 100).toFixed(1) : 0}%)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">ดื่มนมวันนี้</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{todayMilk}</div>
            <p className="text-xs text-purple-600 mt-1">คน ({totalStudents > 0 ? ((todayMilk / totalStudents) * 100).toFixed(1) : 0}%)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">อัตราการปฏิบัติ</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{completionRate.toFixed(1)}%</div>
            <p className="text-xs text-orange-600 mt-1">เฉลี่ยรวม</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">แดชบอร์ด</TabsTrigger>
          <TabsTrigger value="recording">บันทึกข้อมูล</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Grade-wise Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>สถิติตามระดับชั้น</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">ระดับชั้น</th>
                      <th className="text-center py-2">จำนวนนักเรียน</th>
                      <th className="text-center py-2">แปรงฟัน</th>
                      <th className="text-center py-2">อัตรา (%)</th>
                      <th className="text-center py-2">ดื่มนม</th>
                      <th className="text-center py-2">อัตรา (%)</th>
                      <th className="text-center py-2">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeData.map((grade) => (
                      <tr key={grade.grade} className="border-b">
                        <td className="py-3 font-medium">{grade.grade}</td>
                        <td className="text-center py-3">{grade.students}</td>
                        <td className="text-center py-3 text-green-700">{grade.brushing}</td>
                        <td className="text-center py-3">
                          <Badge variant={grade.brushingRate >= 80 ? "default" : "secondary"} 
                                 className={grade.brushingRate >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {grade.brushingRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-center py-3 text-purple-700">{grade.milk}</td>
                        <td className="text-center py-3">
                          <Badge variant={grade.milkRate >= 80 ? "default" : "secondary"} 
                                 className={grade.milkRate >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {grade.milkRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-center py-3">
                          {grade.brushingRate >= 80 && grade.milkRate >= 80 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-yellow-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recording" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>บันทึกข้อมูลรายเดือน</CardTitle>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recording-mode"
                    checked={recordingMode === 'milk'}
                    onCheckedChange={(checked) => setRecordingMode(checked ? 'milk' : 'brushing')}
                  />
                  <Label htmlFor="recording-mode">
                    {recordingMode === 'brushing' ? 'บันทึกการแปรงฟัน' : 'บันทึกการดื่มนม'}
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                    <div key={day} className="text-center font-medium p-2 text-sm">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`
                        h-20 border rounded-lg p-1 flex flex-col items-center justify-center
                        ${day === null ? 'invisible' : ''}
                        ${day?.isWeekend ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
                        ${day?.isWeekend ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
                      `}
                    >
                      {day && (
                        <>
                          <span className={`text-sm font-medium ${day.isWeekend ? 'text-red-500' : 'text-gray-700'}`}>
                            {day.day}
                          </span>
                          {!day.isWeekend && (
                            <div className="mt-1 text-xs">
                              <div className={`w-3 h-3 rounded-full ${recordingMode === 'brushing' ? 'bg-green-200' : 'bg-purple-200'}`}></div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                    <span>วันหยุด (เสาร์-อาทิตย์)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${recordingMode === 'brushing' ? 'bg-green-200' : 'bg-purple-200'}`}></div>
                    <span>
                      {recordingMode === 'brushing' ? 'บันทึกการแปรงฟัน' : 'บันทึกการดื่มนม'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DentalMilkTracking;