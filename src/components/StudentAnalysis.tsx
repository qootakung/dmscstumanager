import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Users, FileText, Upload, Download, BookOpen, Calculator, Target } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface StudentScore {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  scores: { [subject: string]: number };
  totalScore: number;
  averageScore: number;
  group: 'เก่ง' | 'ปานกลาง' | 'อ่อน';
}

const StudentAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [analysisData, setAnalysisData] = useState({
    excellent: 0, // เก่ง (4.00)
    average: 0,   // ปานกลาง (2-3.5)
    poor: 0       // อ่อน (ต่ำกว่า 2)
  });

  const subjects = [
    'ภาษาไทย',
    'คณิตศาสตร์',
    'วิทยาศาสตร์',
    'สังคมศึกษา ศาสนาและวัฒนธรรม',
    'ประวัติศาสตร์',
    'สุขศึกษาและพลศึกษา',
    'ศิลปะ',
    'การงานอาชีพ',
    'ภาษาอังกฤษ',
    'ภาษาไทยเพื่อการสื่อสาร',
    'ภาษาอังกฤษเพื่อการสื่อสาร',
    'คณิตศาสตรเพิ่มเติม',
    'วิทยาศาสตร์กายภาพ',
    'วิทยาศาสตร์ชีวภาพ',
    'วิทยาศาสตร์โลกและอวกาศ',
    'ปฐมพยาบาล',
    'หน้าที่พลเมือง',
    'จริยธรรม',
    'ลูกเสือ-เนตรนารี'
  ];

  const grades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // จำลองการอัปโหลดไฟล์
      toast({
        title: "กำลังประมวลผลข้อมูล",
        description: "กรุณารอสักครู่...",
      });
      
      // จำลองข้อมูลตัวอย่าง
      setTimeout(() => {
        const mockData: StudentScore[] = [
          {
            id: '1',
            studentId: '123001',
            studentName: 'เด็กหญิงพิชญา ชายอ่อน',
            grade: 'ป.4',
            scores: {
              'ภาษาไทย': 4.0,
              'คณิตศาสตร์': 4.0,
              'วิทยาศาสตร์': 3.0,
              'สังคมศึกษา': 4.0
            },
            totalScore: 15.0,
            averageScore: 3.75,
            group: 'เก่ง'
          },
          {
            id: '2',
            studentId: '123002',
            studentName: 'เด็กหญิงจิดาภา แผลงพึ่ง',
            grade: 'ป.4',
            scores: {
              'ภาษาไทย': 3.5,
              'คณิตศาสตร์': 3.0,
              'วิทยาศาสตร์': 2.5,
              'สังคมศึกษา': 3.0
            },
            totalScore: 12.0,
            averageScore: 3.0,
            group: 'ปานกลาง'
          },
          {
            id: '3',
            studentId: '123003',
            studentName: 'เด็กชายกิจเรียน ประจิปปนจจะ',
            grade: 'ป.4',
            scores: {
              'ภาษาไทย': 4.0,
              'คณิตศาสตร์': 4.0,
              'วิทยาศาสตร์': 2.5,
              'สังคมศึกษา': 3.0
            },
            totalScore: 13.5,
            averageScore: 3.38,
            group: 'ปานกลาง'
          }
        ];
        
        setStudents(mockData);
        setAnalysisData({
          excellent: mockData.filter(s => s.group === 'เก่ง').length,
          average: mockData.filter(s => s.group === 'ปานกลาง').length,
          poor: mockData.filter(s => s.group === 'อ่อน').length
        });
        
        toast({
          title: "นำเข้าข้อมูลสำเร็จ",
          description: `ประมวลผลข้อมูลนักเรียน ${mockData.length} คน`,
        });
      }, 2000);
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    toast({
      title: `กำลังส่งออกรายงาน ${format.toUpperCase()}`,
      description: "กรุณารอสักครู่...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-4">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              วิเคราะห์ผู้เรียน
            </h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <p className="text-lg text-slate-600 font-medium">
                วิเคราะห์ผลการเรียนรายวิชา แบ่งกลุ่มตามระดับผลการเรียน
              </p>
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <TabsTrigger 
                value="overview" 
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">ภาพรวม</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="analysis"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">วิเคราะห์</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="import"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <Upload className="w-4 h-4" />
                  <span className="font-medium">นำเข้าข้อมูล</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="report"
                className="relative overflow-hidden group data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg mx-1 my-1"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">รายงาน</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-fade-in">
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        กลุ่มเก่ง
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analysisData.excellent}</div>
                      <p className="text-green-100 text-sm">คะแนน 4.00</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        กลุ่มปานกลาง
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analysisData.average}</div>
                      <p className="text-orange-100 text-sm">คะแนน 2.0-3.5</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        กลุ่มอ่อน
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analysisData.poor}</div>
                      <p className="text-pink-100 text-sm">คะแนนต่ำกว่า 2.0</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Filter Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle>ตัวกรองข้อมูล</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grade">เลือกชั้นเรียน</Label>
                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกชั้นเรียน" />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">เลือกรายวิชา</Label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกรายวิชา" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    รายละเอียดการวิเคราะห์
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>รหัสนักเรียน</TableHead>
                            <TableHead>ชื่อ-นามสกุล</TableHead>
                            <TableHead>ชั้นเรียน</TableHead>
                            <TableHead>คะแนนเฉลี่ย</TableHead>
                            <TableHead>กลุ่ม</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.studentId}</TableCell>
                              <TableCell>{student.studentName}</TableCell>
                              <TableCell>{student.grade}</TableCell>
                              <TableCell>{student.averageScore.toFixed(2)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  student.group === 'เก่ง' ? 'bg-green-100 text-green-800' :
                                  student.group === 'ปานกลาง' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {student.group}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">ยังไม่มีข้อมูลการวิเคราะห์</p>
                      <p className="text-sm">กรุณานำเข้าข้อมูลคะแนนในแท็บ "นำเข้าข้อมูล"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-green-600" />
                    นำเข้าข้อมูลคะแนน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50/50">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      อัปโหลดไฟล์ Excel คะแนนนักเรียน
                    </h3>
                    <p className="text-gray-600 mb-4">
                      รองรับไฟล์ .xlsx และ .xls ตามรูปแบบที่กำหนด
                    </p>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="score-upload"
                    />
                    <Button asChild className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      <label htmlFor="score-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        เลือกไฟล์
                      </label>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">รูปแบบไฟล์ที่ต้องการ</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-600">
                        <ul className="space-y-1">
                          <li>• คอลัมน์ที่ 1: รหัสนักเรียน</li>
                          <li>• คอลัมน์ที่ 2: ชื่อ-นามสกุล</li>
                          <li>• คอลัมน์ที่ 3: ชั้นเรียน</li>
                          <li>• คอลัมน์ต่อไป: คะแนนรายวิชา</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">เกณฑ์การแบ่งกลุ่ม</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-600">
                        <ul className="space-y-1">
                          <li>• <span className="font-medium text-green-600">กลุ่มเก่ง:</span> คะแนน 4.00</li>
                          <li>• <span className="font-medium text-yellow-600">กลุ่มปานกลาง:</span> คะแนน 2.0-3.5</li>
                          <li>• <span className="font-medium text-red-600">กลุ่มอ่อน:</span> คะแนนต่ำกว่า 2.0</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    ส่งออกรายงานการวิเคราะห์
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 border-orange-200 hover:bg-orange-50"
                      onClick={() => exportReport('pdf')}
                      disabled={students.length === 0}
                    >
                      <Download className="w-6 h-6 text-orange-600" />
                      <span>ส่งออก PDF</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 border-orange-200 hover:bg-orange-50"
                      onClick={() => exportReport('excel')}
                      disabled={students.length === 0}
                    >
                      <Download className="w-6 h-6 text-orange-600" />
                      <span>ส่งออก Excel</span>
                    </Button>
                  </div>

                  {students.length > 0 ? (
                    <div className="text-center py-4 text-gray-600">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                      <p className="text-lg mb-2">รายงานพร้อมส่งออก</p>
                      <p className="text-sm">มีข้อมูลการวิเคราะห์ {students.length} คน</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">ยังไม่มีข้อมูลสำหรับรายงาน</p>
                      <p className="text-sm">กรุณานำเข้าข้อมูลคะแนนก่อนส่งออกรายงาน</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;
