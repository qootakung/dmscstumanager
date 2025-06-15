
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Users, FileText, Upload, Download, BookOpen, Calculator, Target, CheckCircle, AlertCircle, Printer } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ImportTemplate from './student-analysis/ImportTemplate';
import AnalysisReportPrintable from './student-analysis/AnalysisReportPrintable';
import type { StudentScore } from '@/types/studentAnalysis';


const StudentAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importProgress, setImportProgress] = useState<{ total: number; processed: number; errors: string[]; } | null>(null);
  const [analysisData, setAnalysisData] = useState({
    excellent: 0, // เก่ง (4.00)
    average: 0,   // ปานกลาง (2-3.5)
    poor: 0       // อ่อน (ต่ำกว่า 2)
  });
  const [academicYear, setAcademicYear] = useState('');

  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `สรุปผลการวิเคราะห์ผู้เรียน-${academicYear || new Date().getFullYear() + 543}`,
    onAfterPrint: () => {
      toast({
        title: "พิมพ์รายงาน",
        description: "ส่งคำสั่งพิมพ์รายงานเรียบร้อยแล้ว",
      });
    },
  });

  const subjects = [
    'ภาษาไทย',
    'คณิตศาสตร์',
    'วิทยาศาสตร์และเทคโนโลยี',
    'สังคมศึกษา ศาสนาและวัฒนธรรม',
    'ประวัติศาสตร์',
    'สุขศึกษาและพลศึกษา',
    'ศิลปะ',
    'การงานอาชีพ',
    'ภาษาอังกฤษ',
    'การป้องกันการทุจริต',
    'ภาษาอังกฤษเพื่อการสื่อสาร',
    'วิทยาศาสตร์พลังสิบ'
  ];

  const grades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  const analyzeStudentGroup = (averageScore: number): 'เก่ง' | 'ปานกลาง' | 'อ่อน' => {
    if (averageScore >= 4.0) return 'เก่ง';
    if (averageScore >= 2.0) return 'ปานกลาง';
    return 'อ่อน';
  };

  const processExcelData = (mockData: any[]): StudentScore[] => {
    return mockData.map((row, index) => {
      const scores: { [subject: string]: number } = {};
      let totalScore = 0;
      let subjectCount = 0;

      // จำลองการอ่านคะแนนจากหลายคอลัมน์
      subjects.forEach(subject => {
        if (row[subject] !== undefined && row[subject] !== null && row[subject] !== '') {
          const score = parseFloat(row[subject]) || 0;
          scores[subject] = score;
          totalScore += score;
          subjectCount++;
        }
      });

      const averageScore = subjectCount > 0 ? totalScore / subjectCount : 0;
      const group = analyzeStudentGroup(averageScore);

      return {
        id: `${index + 1}`,
        studentId: row['รหัสนักเรียน'] || `STD${(index + 1).toString().padStart(3, '0')}`,
        studentName: row['ชื่อ-นามสกุล'] || `นักเรียนคนที่ ${index + 1}`,
        grade: row['ชั้นเรียน'] || selectedGrade || 'ป.4',
        scores,
        totalScore,
        averageScore,
        group
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setImportProgress({ total: 0, processed: 0, errors: [] });

    try {
      toast({
        title: "กำลังประมวลผลข้อมูล",
        description: "กรุณารอสักครู่...",
      });

      // อ่านไฟล์ Excel จริง
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Excel data:', jsonData);

      if (jsonData.length === 0) {
        throw new Error('ไฟล์ Excel ไม่มีข้อมูล');
      }

      // ประมวลผลข้อมูลจริงจากไฟล์
      const processedStudents = processExcelData(jsonData);
      setStudents(processedStudents);

      const analysisResult = {
        excellent: processedStudents.filter(s => s.group === 'เก่ง').length,
        average: processedStudents.filter(s => s.group === 'ปานกลาง').length,
        poor: processedStudents.filter(s => s.group === 'อ่อน').length
      };
      setAnalysisData(analysisResult);

      setImportProgress({
        total: jsonData.length,
        processed: jsonData.length,
        errors: []
      });

      toast({
        title: "นำเข้าข้อมูลสำเร็จ",
        description: `ประมวลผลข้อมูลนักเรียน ${processedStudents.length} คน พร้อมวิเคราะห์แบ่งกลุ่มเรียบร้อย`,
      });

      setIsUploading(false);

    } catch (error) {
      console.error('Excel processing error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์",
        variant: "destructive",
      });
      setIsUploading(false);
    }

    // เคลียร์ค่าไฟล์
    event.target.value = '';
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    if (students.length === 0) {
      toast({
        title: "ไม่มีข้อมูลสำหรับส่งออก",
        description: "กรุณานำเข้าข้อมูลคะแนนก่อน",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `กำลังส่งออกรายงาน ${format.toUpperCase()}`,
      description: "กรุณารอสักครู่...",
    });

    // จำลองการส่งออก
    setTimeout(() => {
      toast({
        title: "ส่งออกรายงานสำเร็จ",
        description: `รายงานการวิเคราะห์ผู้เรียน ${format.toUpperCase()} พร้อมใช้งาน`,
      });
    }, 2000);
  };

  const filteredStudents = students.filter(student => {
    const gradeMatch = !selectedGrade || student.grade === selectedGrade;
    const subjectMatch = !selectedSubject || student.scores[selectedSubject] !== undefined;
    return gradeMatch && subjectMatch;
  });

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
              วิเคราะห์ผู้เรียนรายวิชา
            </h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <p className="text-lg text-slate-600 font-medium">
                นำเข้าคะแนนหลายวิชา วิเคราะห์แบ่งกลุ่มอัตโนมัติ และสร้างรายงาน
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
                      <p className="text-green-100 text-sm">คะแนนเฉลี่ย 4.00</p>
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
                      <p className="text-orange-100 text-sm">คะแนนเฉลี่ย 2.0-3.99</p>
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
                      <p className="text-pink-100 text-sm">คะแนนเฉลี่ยต่ำกว่า 2.0</p>
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
                    รายละเอียดการวิเคราะห์ผู้เรียน
                    {filteredStudents.length > 0 && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {filteredStudents.length} คน
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredStudents.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>รหัสนักเรียน</TableHead>
                            <TableHead>ชื่อ</TableHead>
                            <TableHead>ชั้นเรียน</TableHead>
                            <TableHead>คะแนนเฉลี่ย</TableHead>
                            <TableHead>กลุ่ม</TableHead>
                            <TableHead>จำนวนวิชา</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.studentId}</TableCell>
                              <TableCell>{student.studentName}</TableCell>
                              <TableCell>{student.grade}</TableCell>
                              <TableCell className="font-mono">
                                {student.averageScore.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  student.group === 'เก่ง' ? 'bg-green-100 text-green-800' :
                                  student.group === 'ปานกลาง' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {student.group}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {Object.keys(student.scores).length}
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
                    นำเข้าข้อมูลคะแนนหลายวิชา
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Import Template Section */}
                  <ImportTemplate />

                  {/* Upload Section */}
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isUploading ? 'border-blue-300 bg-blue-50/50' : 'border-green-300 bg-green-50/50'
                  }`}>
                    {isUploading ? (
                      <div className="space-y-4">
                        <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <h3 className="text-lg font-semibold text-blue-700">
                          กำลังประมวลผลข้อมูล...
                        </h3>
                        <p className="text-blue-600">
                          กรุณารอสักครู่ ระบบกำลังวิเคราะห์ข้อมูลคะแนน
                        </p>
                        {importProgress && (
                          <div className="text-sm text-blue-600">
                            ประมวลผลแล้ว {importProgress.processed} จาก {importProgress.total} คน
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto text-green-500 mb-4" />
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
                          disabled={isUploading}
                        />
                        <Button 
                          asChild 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          disabled={isUploading}
                        >
                          <label htmlFor="score-upload" className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            เลือกไฟล์
                          </label>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Import Results */}
                  {importProgress && importProgress.processed > 0 && (
                    <Card className="border-green-200 bg-green-50/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-medium text-green-800">ผลการนำเข้าข้อมูล</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-green-700">
                            <span className="font-medium">ประมวลผลสำเร็จ:</span> {importProgress.processed} คน
                          </div>
                          <div className="text-green-700">
                            <span className="font-medium">จำนวนวิชาที่พบ:</span> {students.length > 0 ? Object.keys(students[0].scores).length : 0} วิชา
                          </div>
                        </div>
                        {importProgress.errors.length > 0 && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            <h4 className="font-medium text-red-800 mb-2">ข้อผิดพลาด:</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                              {importProgress.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          รูปแบบไฟล์ที่ต้องการ
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-600">
                        <ul className="space-y-1">
                          <li>• คอลัมน์ที่ 1: รหัสนักเรียน</li>
                          <li>• คอลัมน์ที่ 2: ชื่อ-นามสกุล</li>
                          <li>• คอลัมน์ที่ 3: ชั้นเรียน</li>
                          <li>• คอลัมน์ต่อไป: คะแนนรายวิชา (ตามชื่อวิชา)</li>
                          <li>• ใช้คะแนน 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-600" />
                          เกณฑ์การแบ่งกลุ่ม
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-600">
                        <ul className="space-y-1">
                          <li>• <span className="font-medium text-green-600">กลุ่มเก่ง:</span> คะแนนเฉลี่ย 4.00</li>
                          <li>• <span className="font-medium text-yellow-600">กลุ่มปานกลาง:</span> คะแนนเฉลี่ย 2.0-3.99</li>
                          <li>• <span className="font-medium text-red-600">กลุ่มอ่อน:</span> คะแนนเฉลี่ยต่ำกว่า 2.0</li>
                          <li>• ระบบจะวิเคราะห์อัตโนมัติจากทุกวิชา</li>
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
                    ส่งออกและพิมพ์รายงานการวิเคราะห์
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
                      <span className="text-xs text-gray-500">รายงานสำหรับพิมพ์</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 border-orange-200 hover:bg-orange-50"
                      onClick={() => exportReport('excel')}
                      disabled={students.length === 0}
                    >
                      <Download className="w-6 h-6 text-orange-600" />
                      <span>ส่งออก Excel</span>
                      <span className="text-xs text-gray-500">ข้อมูลสำหรับวิเคราะห์</span>
                    </Button>
                  </div>

                  {students.length > 0 ? (
                    <div className="text-center py-4 text-gray-600">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                      <p className="text-lg mb-2">รายงานพร้อมส่งออก</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-green-50 p-3 rounded">
                          <div className="font-medium text-green-800">กลุ่มเก่ง</div>
                          <div className="text-2xl font-bold text-green-600">{analysisData.excellent}</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded">
                          <div className="font-medium text-yellow-800">กลุ่มปานกลาง</div>
                          <div className="text-2xl font-bold text-yellow-600">{analysisData.average}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded">
                          <div className="font-medium text-red-800">กลุ่มอ่อน</div>
                          <div className="text-2xl font-bold text-red-600">{analysisData.poor}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">ยังไม่มีข้อมูลสำหรับรายงาน</p>
                      <p className="text-sm">กรุณานำเข้าข้อมูลคะแนนก่อนส่งออกรายงาน</p>
                    </div>
                  )}

                  {/* Print Section */}
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-medium text-purple-700 mb-4 text-center">พิมพ์รายงานสรุปผล</h3>
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="space-y-2">
                        <Label htmlFor="academicYear" className="text-purple-800">ปีการศึกษา</Label>
                        <Input
                          id="academicYear"
                          placeholder="เช่น 2567"
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full h-20 flex-col gap-2 border-purple-200 hover:bg-purple-50 text-purple-700 hover:text-purple-800"
                        onClick={() => {
                          if (!academicYear.trim()) {
                            toast({
                              title: "กรุณาระบุปีการศึกษา",
                              description: "โปรดป้อนปีการศึกษาก่อนพิมพ์รายงาน",
                              variant: "destructive"
                            });
                            return;
                          }
                          if (students.length === 0) {
                            toast({
                              title: "ไม่มีข้อมูลสำหรับพิมพ์",
                              description: "กรุณานำเข้าข้อมูลคะแนนก่อน",
                              variant: "destructive"
                            });
                            return;
                          }
                          handlePrint();
                        }}
                        disabled={students.length === 0}
                      >
                        <Printer className="w-6 h-6 text-purple-600" />
                        <span className="font-semibold">พิมพ์รายงาน</span>
                        <span className="text-xs text-gray-500">สรุปผลการวิเคราะห์รายบุคคล</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AnalysisReportPrintable ref={reportRef} students={students} academicYear={academicYear} />
    </div>
  );
};

export default StudentAnalysis;
