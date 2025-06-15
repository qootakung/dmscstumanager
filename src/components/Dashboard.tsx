
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  FileText, 
  Settings, 
  Activity,
  BarChart3,
  Brain,
  TrendingUp
} from 'lucide-react';
import { getStudents } from '@/utils/storage';
import type { Student } from '@/types/student';
import StudentManagement from './StudentManagement';
import TeacherManagement from './TeacherManagement';
import Reports from './Reports';
import TeacherReports from './TeacherReports';
import AdminPanel from './AdminPanel';
import StudentHealth from './StudentHealth';
import StudentAnalysis from './StudentAnalysis';

type MenuType = 'dashboard' | 'students' | 'teachers' | 'reports' | 'teacher-reports' | 'admin' | 'health' | 'analysis';

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      const studentData = await getStudents();
      setStudents(studentData);
    };
    loadStudents();
  }, []);

  const renderContent = () => {
    switch (activeMenu) {
      case 'students':
        return <StudentManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'reports':
        return <Reports />;
      case 'teacher-reports':
        return <TeacherReports />;
      case 'admin':
        return <AdminPanel />;
      case 'health':
        return <StudentHealth />;
      case 'analysis':
        return <StudentAnalysis />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Beautiful Header Section */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-10 rounded-3xl"></div>
                <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 animate-pulse">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    ระบบจัดการข้อมูลโรงเรียน
                  </h1>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-blue-500" />
                    <p className="text-xl text-slate-700 font-medium">
                      จัดการข้อมูลนักเรียน ครู และรายงานต่าง ๆ อย่างมีประสิทธิภาพ
                    </p>
                    <BookOpen className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-semibold text-blue-700">ระบบพร้อมใช้งาน</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">นักเรียนทั้งหมด</p>
                      <p className="text-3xl font-bold">{students.length}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">ปีการศึกษาปัจจุบัน</p>
                      <p className="text-3xl font-bold">2568</p>
                    </div>
                    <BookOpen className="w-12 h-12 text-indigo-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">สถานะระบบ</p>
                      <p className="text-lg font-bold">พร้อมใช้งาน</p>
                    </div>
                    <Activity className="w-12 h-12 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Menu Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                  onClick={() => setActiveMenu('students')}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-blue-700">จัดการข้อมูลนักเรียน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 text-sm text-center">
                      เพิ่ม แก้ไข และจัดการข้อมูลนักเรียน
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                  onClick={() => setActiveMenu('teachers')}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4">
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-green-700">จัดการข้อมูลครู</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-600 text-sm text-center">
                      เพิ่ม แก้ไข และจัดการข้อมูลครูผู้สอน
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                  onClick={() => setActiveMenu('analysis')}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-purple-700">วิเคราะห์ผู้เรียน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-600 text-sm text-center">
                      วิเคราะห์และจัดกลุ่มผู้เรียนตามผลการเรียน
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                  onClick={() => setActiveMenu('reports')}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-orange-700">รายงานนักเรียน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-600 text-sm text-center">
                      สร้างรายงานและเอกสารของนักเรียน
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
                  onClick={() => setActiveMenu('teacher-reports')}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-indigo-700">รายงานครู</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-indigo-600 text-sm text-center">
                      สร้างรายงานและเอกสารของครูผู้สอน
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200"
                  onClick={() => setActiveMenu('health')}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-teal-700">ข้อมูลสุขภาพ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-teal-600 text-sm text-center">
                      จัดการข้อมูลสุขภาพและการเจริญเติบโต
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                  onClick={() => setActiveMenu('admin')}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-gray-700">ตั้งค่าระบบ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm text-center">
                      จัดการผู้ใช้งานและการตั้งค่าระบบ
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-pink-700">สถิติการใช้งาน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-pink-600 text-sm text-center">
                      ดูสถิติและข้อมูลการใช้งานระบบ
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  การดำเนินการด่วน
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                    onClick={() => setActiveMenu('students')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    เพิ่มนักเรียนใหม่
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    onClick={() => setActiveMenu('teachers')}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    เพิ่มครูใหม่
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                    onClick={() => setActiveMenu('analysis')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    วิเคราะห์ผู้เรียน
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                    onClick={() => setActiveMenu('reports')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    สร้างรายงาน
                  </Button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="flex justify-center">
                <div className="flex items-center gap-6 text-5xl opacity-20">
                  <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎓</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>📚</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>👨‍🏫</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>📊</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🏫</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (activeMenu !== 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Navigation Bar */}
        <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/50 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveMenu('dashboard')}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              ← กลับหน้าหลัก
            </Button>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">ระบบจัดการข้อมูลโรงเรียน</span>
            </div>
          </div>
        </div>
        
        {renderContent()}
      </div>
    );
  }

  return renderContent();
};

export default Dashboard;
