
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Settings, 
  UserPlus,
  FileText,
  Activity,
  TrendingUp,
  Award,
  Target,
  Brain
} from 'lucide-react';
import { getStudents } from '@/utils/storage';
import { getTeachers } from '@/utils/teacherStorage';
import type { Student } from '@/types/student';
import type { Teacher } from '@/types/teacher';
import StudentManagement from './StudentManagement';
import TeacherManagement from './TeacherManagement';
import Reports from './Reports';
import StudentHealth from './StudentHealth';
import TeacherReports from './TeacherReports';
import AdminPanel from './AdminPanel';
import StudentAnalysis from './StudentAnalysis';

interface DashboardProps {
  onLogout: () => void;
  userRole: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, userRole }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const studentData = await getStudents();
      const teacherData = await getTeachers();
      setStudents(studentData);
      setTeachers(teacherData);
    };
    loadData();
  }, []);

  const menuItems = [
    { 
      id: 'home', 
      label: 'หน้าหลัก', 
      icon: Activity, 
      color: 'from-blue-500 to-purple-600',
      description: 'ภาพรวมของระบบ'
    },
    { 
      id: 'students', 
      label: 'จัดการข้อมูลนักเรียน', 
      icon: Users, 
      color: 'from-green-500 to-blue-600',
      description: 'เพิ่ม แก้ไข ลบข้อมูลนักเรียน'
    },
    { 
      id: 'student-analysis', 
      label: 'วิเคราะห์ผู้เรียน', 
      icon: Brain, 
      color: 'from-purple-500 to-pink-600',
      description: 'วิเคราะห์และจัดกลุ่มผู้เรียน'
    },
    { 
      id: 'teachers', 
      label: 'จัดการข้อมูลครู', 
      icon: GraduationCap, 
      color: 'from-orange-500 to-red-600',
      description: 'เพิ่ม แก้ไข ลบข้อมูลครูและบุคลากร'
    },
    { 
      id: 'reports', 
      label: 'รายงานนักเรียน', 
      icon: FileText, 
      color: 'from-indigo-500 to-blue-600',
      description: 'สร้างรายงานต่าง ๆ ของนักเรียน'
    },
    { 
      id: 'teacher-reports', 
      label: 'รายงานครู', 
      icon: BarChart3, 
      color: 'from-teal-500 to-green-600',
      description: 'สร้างรายงานข้อมูลครูและบุคลากร'
    },
    { 
      id: 'health', 
      label: 'ข้อมูลสุขภาพนักเรียน', 
      icon: Target, 
      color: 'from-pink-500 to-rose-600',
      description: 'จัดการข้อมูลน้ำหนัก ส่วนสูง'
    },
    ...(userRole === 'admin' ? [{ 
      id: 'admin', 
      label: 'จัดการระบบ', 
      icon: Settings, 
      color: 'from-gray-500 to-slate-600',
      description: 'จัดการผู้ใช้และการตั้งค่าระบบ'
    }] : [])
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'students':
        return <StudentManagement />;
      case 'student-analysis':
        return <StudentAnalysis />;
      case 'teachers':
        return <TeacherManagement />;
      case 'reports':
        return <Reports />;
      case 'teacher-reports':
        return <TeacherReports />;
      case 'health':
        return <StudentHealth />;
      case 'admin':
        return userRole === 'admin' ? <AdminPanel /> : null;
      default:
        return renderHome();
    }
  };

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 animate-pulse">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              ระบบจัดการข้อมูลโรงเรียน
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <p className="text-xl text-slate-700 font-medium">
                โรงเรียนบ้านดอนมูล
              </p>
              <GraduationCap className="w-6 h-6 text-purple-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-blue-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">นักเรียนทั้งหมด</p>
                  <p className="text-3xl font-bold">{students.length}</p>
                  <p className="text-emerald-100 text-xs">คน</p>
                </div>
                <Users className="w-12 h-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">ครูและบุคลากร</p>
                  <p className="text-3xl font-bold">{teachers.length}</p>
                  <p className="text-blue-100 text-xs">คน</p>
                </div>
                <GraduationCap className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">ปีการศึกษา</p>
                  <p className="text-3xl font-bold">2568</p>
                  <p className="text-purple-100 text-xs">ปีปัจจุบัน</p>
                </div>
                <BookOpen className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">อัตราการเติบโต</p>
                  <p className="text-3xl font-bold">+15%</p>
                  <p className="text-orange-100 text-xs">เทียบปีที่แล้ว</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Menu Grid */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">เมนูหลัก</h2>
            <p className="text-blue-100">เลือกเมนูที่ต้องการใช้งาน</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.slice(1).map((item) => {
                const IconComponent = item.icon;
                return (
                  <Card 
                    key={item.id} 
                    className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 overflow-hidden"
                    onClick={() => setActiveSection(item.id)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {item.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">โรงเรียนบ้านดอนมูล</h1>
                  <p className="text-xs text-blue-100">ระบบจัดการข้อมูล</p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? 'secondary' : 'ghost'}
                    className={`text-white hover:bg-white/20 transition-all duration-200 ${
                      activeSection === item.id ? 'bg-white/30 font-semibold' : ''
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            <Button 
              onClick={onLogout}
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
