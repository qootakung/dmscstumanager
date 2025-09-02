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
  const [recordedData, setRecordedData] = useState<{[key: string]: boolean}>({});

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
    const printContent = document.getElementById('dental-table');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`
        <html>
          <head>
            <title>บันทึก${recordingMode === 'brushing' ? 'การแปรงฟัน' : 'การดื่มนม'} - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}</title>
            <style>
              body { font-family: 'Sarabun', sans-serif; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 12px; }
              th { background-color: #f0f0f0; font-weight: bold; }
              .weekend { background-color: #ffe6e6; }
              .recorded { font-size: 16px; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { margin: 0; font-size: 18px; }
              .header p { margin: 5px 0; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>บันทึก${recordingMode === 'brushing' ? 'การแปรงฟัน' : 'การดื่มนม'}</h1>
              <p>${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} ${selectedGrade !== 'all' ? `- ${selectedGrade}` : ''}</p>
            </div>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  const handleCellClick = (studentIndex: number, day: number) => {
    const key = `${recordingMode}-${studentIndex}-${day}`;
    setRecordedData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: recordedData[key] ? "ลบข้อมูลแล้ว" : "บันทึกข้อมูลแล้ว",
      description: `${recordingMode === 'brushing' ? 'การแปรงฟัน' : 'การดื่มนม'} วันที่ ${day}`,
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
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-school-primary">
                  บันทึกข้อมูล{recordingMode === 'brushing' ? 'การแปรงฟัน' : 'การดื่มนม'}
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recording-mode"
                      checked={recordingMode === 'milk'}
                      onCheckedChange={(checked) => setRecordingMode(checked ? 'milk' : 'brushing')}
                    />
                    <Label htmlFor="recording-mode" className="font-medium">
                      {recordingMode === 'brushing' ? 'แปรงฟัน' : 'ดื่มนม'}
                    </Label>
                  </div>
                  <Button onClick={handlePrint} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    <Printer className="w-4 h-4 mr-2" />
                    พิมพ์ตาราง
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {months.find(m => m.value === selectedMonth)?.label} {selectedYear} 
                {selectedGrade !== 'all' && ` - ${selectedGrade}`}
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div id="dental-table" className="min-w-[1200px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-[60px_200px_repeat(31,40px)_80px] gap-1 mb-2">
                    <div className="text-center font-bold text-sm bg-school-primary text-white p-2 rounded">
                      ที่
                    </div>
                    <div className="text-center font-bold text-sm bg-school-primary text-white p-2 rounded">
                      ชื่อ
                    </div>
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const gregorianYear = selectedYear - 543;
                      const date = new Date(gregorianYear, selectedMonth - 1, day);
                      const dayOfWeek = date.getDay();
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                      const isValidDay = day <= getDaysInMonth(selectedMonth, selectedYear).filter(d => d !== null).length;
                      
                      return (
                        <div 
                          key={day} 
                          className={`text-center font-bold text-xs p-2 rounded ${
                            !isValidDay ? 'invisible' : 
                            isWeekend ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {isValidDay ? day : ''}
                        </div>
                      );
                    })}
                    <div className="text-center font-bold text-sm bg-orange-100 text-orange-700 p-2 rounded">
                      รวม
                    </div>
                  </div>

                   {/* Student Rows */}
                   {(selectedGrade === 'all' ? students : students.filter(s => s.grade === selectedGrade))
                     .sort((a, b) => {
                       // Sort by grade first, then by studentId
                       if (a.grade !== b.grade) {
                         const gradeOrder = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
                         return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
                       }
                       return parseInt(a.studentId) - parseInt(b.studentId);
                     })
                     .map((student, studentIndex) => {
                       const daysInMonth = getDaysInMonth(selectedMonth, selectedYear).filter(d => d !== null).length;
                       
                       return (
                         <div key={student.id} className="grid grid-cols-[60px_200px_repeat(31,40px)_80px] gap-1 mb-1">
                           <div className="text-center text-sm p-2 bg-gray-50 rounded font-medium">
                             {studentIndex + 1}
                           </div>
                           <div className="text-left text-sm p-2 bg-gray-50 rounded font-medium truncate">
                             {student.firstNameTh} {student.lastNameTh}
                           </div>
                           {Array.from({ length: 31 }, (_, i) => {
                             const day = i + 1;
                             const gregorianYear = selectedYear - 543;
                             const date = new Date(gregorianYear, selectedMonth - 1, day);
                             const dayOfWeek = date.getDay();
                             const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                             const isValidDay = day <= daysInMonth;
                             const recordKey = `${recordingMode}-${studentIndex}-${day}`;
                             const isRecorded = recordedData[recordKey];
                             
                             return (
                               <div 
                                 key={day}
                                 className={`text-center text-sm p-2 rounded cursor-pointer transition-colors min-h-[32px] flex items-center justify-center ${
                                   !isValidDay ? 'invisible' :
                                   isWeekend ? 'bg-red-50 border border-red-200 cursor-not-allowed' :
                                   isRecorded ? (recordingMode === 'brushing' ? 'bg-green-100 hover:bg-green-200 border border-green-300' : 'bg-purple-100 hover:bg-purple-200 border border-purple-300') :
                                   'bg-white border border-gray-200 hover:bg-gray-50'
                                 }`}
                                 onClick={() => {
                                   if (!isWeekend && isValidDay) {
                                     handleCellClick(studentIndex, day);
                                   }
                                 }}
                               >
                                 {isValidDay && isRecorded && !isWeekend && (
                                   <span className="text-base">
                                     {recordingMode === 'brushing' ? '🦷' : '🥛'}
                                   </span>
                                 )}
                               </div>
                             );
                           })}
                           <div className="text-center text-sm p-2 bg-orange-50 rounded font-bold text-orange-700">
                             {/* Calculate total from recorded data */}
                             {Array.from({ length: daysInMonth }, (_, i) => {
                               const day = i + 1;
                               const recordKey = `${recordingMode}-${studentIndex}-${day}`;
                               return recordedData[recordKey] ? 1 : 0;
                             }).reduce((sum, val) => sum + val, 0)}
                           </div>
                         </div>
                       );
                     })}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                    <span className="text-sm">วันหยุด (เสาร์-อาทิตย์)</span>
                  </div>
                   <div className="flex items-center space-x-2">
                     <div className={`w-4 h-4 rounded flex items-center justify-center text-xs ${recordingMode === 'brushing' ? 'bg-green-100 border border-green-200' : 'bg-purple-100 border border-purple-200'}`}>
                       {recordingMode === 'brushing' ? '🦷' : '🥛'}
                     </div>
                     <span className="text-sm">
                       {recordingMode === 'brushing' ? 'แปรงฟันแล้ว' : 'ดื่มนมแล้ว'}
                     </span>
                   </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                    <span className="text-sm">
                      {recordingMode === 'brushing' ? 'ยังไม่แปรงฟัน' : 'ยังไม่ดื่มนม'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">คลิกในช่องเพื่อบันทึกข้อมูล</span>
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