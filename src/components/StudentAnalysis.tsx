
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  BookOpen, 
  Target,
  Brain,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { getStudents } from '@/utils/storage';
import type { Student } from '@/types/student';
import ScoreImport from './student-analysis/ScoreImport';
import AnalysisReport from './student-analysis/AnalysisReport';

const subjects = ['คณิตศาสตร์', 'ภาษาไทย', 'วิทยาศาสตร์', 'สังคมศึกษา', 'ภาษาอังกฤษ'];

const StudentAnalysis: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('คณิตศาสตร์');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      const studentData = await getStudents();
      setStudents(studentData);
    };
    loadStudents();
  }, []);

  // จำลองข้อมูลคะแนนสำหรับนักเรียน (ในการใช้งานจริงจะดึงจากฐานข้อมูล)
  const studentScores = useMemo(() => {
    return students.map(student => ({
      ...student,
      scores: subjects.map(subject => ({
        subject,
        score: Math.floor(Math.random() * 40) + 60 // คะแนนสุ่มระหว่าง 60-100
      }))
    }));
  }, [students]);

  // วิเคราะห์ข้อมูลตามวิชาที่เลือก
  const analysisData = useMemo(() => {
    let filteredStudents = studentScores;
    
    if (selectedGrade !== 'all') {
      filteredStudents = filteredStudents.filter(s => s.grade === selectedGrade);
    }

    const subjectScores = filteredStudents.map(student => {
      const subjectScore = student.scores.find(s => s.subject === selectedSubject);
      return {
        ...student,
        score: subjectScore?.score || 0
      };
    });

    // แบ่งกลุ่มตามคะแนน
    const excellent = subjectScores.filter(s => s.score >= 80); // กลุ่มเก่ง
    const average = subjectScores.filter(s => s.score >= 70 && s.score < 80); // กลุ่มปานกลาง
    const needsImprovement = subjectScores.filter(s => s.score < 70); // กลุ่มอ่อน

    return {
      total: subjectScores.length,
      excellent: excellent.length,
      average: average.length,
      needsImprovement: needsImprovement.length,
      averageScore: subjectScores.reduce((sum, s) => sum + s.score, 0) / subjectScores.length,
      excellentStudents: excellent,
      averageStudents: average,
      needsImprovementStudents: needsImprovement
    };
  }, [studentScores, selectedSubject, selectedGrade]);

  // ข้อมูลสำหรับกราฟ
  const chartData = [
    { name: 'กลุ่มเก่ง (≥80)', value: analysisData.excellent, color: '#10b981' },
    { name: 'กลุ่มปานกลาง (70-79)', value: analysisData.average, color: '#f59e0b' },
    { name: 'กลุ่มอ่อน (&lt;70)', value: analysisData.needsImprovement, color: '#ef4444' }
  ];

  const barChartData = subjects.map(subject => {
    const subjectData = studentScores.map(student => {
      const score = student.scores.find(s => s.subject === subject)?.score || 0;
      return score;
    });
    const avgScore = subjectData.reduce((sum, score) => sum + score, 0) / subjectData.length;
    return {
      subject,
      average: Math.round(avgScore * 100) / 100
    };
  });

  const grades = [...new Set(students.map(s => s.grade))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-6 animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              วิเคราะห์ผู้เรียน
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-500" />
              <p className="text-xl text-slate-700 font-medium">
                วิเคราะห์และจัดกลุ่มผู้เรียนตามผลการเรียนรายวิชา
              </p>
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-purple-700">ระบบวิเคราะห์พร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <label className="text-sm font-medium text-gray-700">วิชา:</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">ระดับชั้น:</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">กลุ่มเก่ง (≥80)</p>
                <p className="text-3xl font-bold">{analysisData.excellent}</p>
                <p className="text-green-100 text-xs">
                  {analysisData.total > 0 ? Math.round((analysisData.excellent / analysisData.total) * 100) : 0}% ของทั้งหมด
                </p>
              </div>
              <Award className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">กลุ่มปานกลาง (70-79)</p>
                <p className="text-3xl font-bold">{analysisData.average}</p>
                <p className="text-orange-100 text-xs">
                  {analysisData.total > 0 ? Math.round((analysisData.average / analysisData.total) * 100) : 0}% ของทั้งหมด
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">กลุ่มอ่อน (&lt;70)</p>
                <p className="text-3xl font-bold">{analysisData.needsImprovement}</p>
                <p className="text-red-100 text-xs">
                  {analysisData.total > 0 ? Math.round((analysisData.needsImprovement / analysisData.total) * 100) : 0}% ของทั้งหมด
                </p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">คะแนนเฉลี่ย</p>
                <p className="text-3xl font-bold">{Math.round(analysisData.averageScore * 100) / 100}</p>
                <p className="text-blue-100 text-xs">วิชา {selectedSubject}</p>
              </div>
              <Target className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">การวิเคราะห์รายละเอียด</h2>
            <p className="text-purple-100">เลือกดูข้อมูลการวิเคราะห์ในรูปแบบต่าง ๆ</p>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-2 border border-purple-100">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <PieChartIcon className="w-4 h-4" />
                  ภาพรวม
                </TabsTrigger>
                <TabsTrigger 
                  value="detailed" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  รายละเอียด
                </TabsTrigger>
                <TabsTrigger 
                  value="comparison" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  เปรียบเทียบ
                </TabsTrigger>
                <TabsTrigger 
                  value="import" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  นำเข้าคะแนน
                </TabsTrigger>
                <TabsTrigger 
                  value="report" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  รายงาน
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5" />
                        การกระจายของกลุ่ม
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        คะแนนเฉลี่ยรายวิชา
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="average" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* กลุ่มเก่ง */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        กลุ่มเก่ง ({analysisData.excellent} คน)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-96 overflow-y-auto">
                      {analysisData.excellentStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.firstNameTh} {student.lastNameTh}
                            </p>
                            <p className="text-sm text-gray-600">{student.studentId}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {student.score} คะแนน
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* กลุ่มปานกลาง */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        กลุ่มปานกลาง ({analysisData.average} คน)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-96 overflow-y-auto">
                      {analysisData.averageStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.firstNameTh} {student.lastNameTh}
                            </p>
                            <p className="text-sm text-gray-600">{student.studentId}</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                            {student.score} คะแนน
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* กลุ่มอ่อน */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5" />
                        กลุ่มอ่อน ({analysisData.needsImprovement} คน)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-96 overflow-y-auto">
                      {analysisData.needsImprovementStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.firstNameTh} {student.lastNameTh}
                            </p>
                            <p className="text-sm text-gray-600">{student.studentId}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            {student.score} คะแนน
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      เปรียบเทียบคะแนนเฉลี่ยทุกวิชา
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="average" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="import" className="mt-6">
                <ScoreImport onImportComplete={() => {}} />
              </TabsContent>

              <TabsContent value="report" className="mt-6">
                <AnalysisReport 
                  analysisData={analysisData}
                  selectedSubject={selectedSubject}
                  selectedGrade={selectedGrade}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;
