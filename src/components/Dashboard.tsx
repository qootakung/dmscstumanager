
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, FileText, BarChart3, Activity, User } from 'lucide-react';
import StudentManagement from './StudentManagement';
import StudentHealth from './StudentHealth';
import StudentAnalysis from './StudentAnalysis';
import Reports from './Reports';
import TeacherManagement from './TeacherManagement';
import FinancialReports from './FinancialReports';
import TeacherReports from './TeacherReports';
import Navigation from './Navigation';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'student':
        return <StudentManagement />;
      case 'health':
        return <StudentHealth />;
      case 'analysis':
        return <StudentAnalysis />;
      case 'reports':
        return <Reports />;
      case 'teacher':
        return <TeacherManagement />;
      case 'financial':
        return <FinancialReports />;
      case 'teacher-reports':
        return <TeacherReports />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  ระบบจัดการข้อมูลโรงเรียน
                </h1>
                <p className="text-xl text-slate-700 font-medium">
                  โรงเรียนบ้านดอนมูล
                </p>
              </div>

              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                  onClick={() => setCurrentView('student')}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="p-2 bg-blue-500 rounded-lg mr-4">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-blue-700">จัดการข้อมูลนักเรียน</CardTitle>
                      <CardDescription>เพิ่ม แก้ไข และจัดการข้อมูลนักเรียน</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                  onClick={() => setCurrentView('health')}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="p-2 bg-green-500 rounded-lg mr-4">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-green-700">น้ำหนักส่วนสูง</CardTitle>
                      <CardDescription>บันทึกและติดตามข้อมูลสุขภาพ</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                  onClick={() => setCurrentView('analysis')}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="p-2 bg-purple-500 rounded-lg mr-4">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-purple-700">วิเคราะห์ผู้เรียน</CardTitle>
                      <CardDescription>วิเคราะห์ผลการเรียนและสถิติ</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                  onClick={() => setCurrentView('reports')}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="p-2 bg-orange-500 rounded-lg mr-4">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-orange-700">รายงานข้อมูลนักเรียน</CardTitle>
                      <CardDescription>สร้างและส่งออกรายงาน</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
                  onClick={() => setCurrentView('teacher')}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="p-2 bg-indigo-500 rounded-lg mr-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-indigo-700">ข้อมูลครู</CardTitle>
                      <CardDescription>จัดการข้อมูลครูและบุคลากร</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200"
                  onClick={() => setCurrentView('financial')}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="p-2 bg-pink-500 rounded-lg mr-4">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-pink-700">รายงานการเงิน</CardTitle>
                      <CardDescription>จัดการรายงานการเงิน</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  if (currentView !== 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
        </div>
        {renderCurrentView()}
      </div>
    );
  }

  return renderCurrentView();
};

export default Dashboard;
