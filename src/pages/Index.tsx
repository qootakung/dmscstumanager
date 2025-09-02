
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import StudentManagement from '@/components/StudentManagement';
import TeacherManagement from '@/components/TeacherManagement';
import Reports from '@/components/Reports';
import TeacherReports from '@/components/TeacherReports';
import AdminPanel from '@/components/AdminPanel';
import StudentHealth from '@/components/StudentHealth';
import StudentAnalysis from '@/components/StudentAnalysis';
import FinancialReports from '@/components/FinancialReports';
import Assessment from '@/components/Assessment';
import DentalMilkTracking from '@/components/DentalMilkTracking';
import { getCurrentUser, logout } from '@/utils/userStorage';
import type { User } from '@/types/student';
import Swal from 'sweetalert2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = getCurrentUser();
    console.log('Current user on load:', user);
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = () => {
    const user = getCurrentUser();
    console.log('User after login:', user);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'ออกจากระบบ?',
      text: 'คุณต้องการออกจากระบบหรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      logout();
      setCurrentUser(null);
      await Swal.fire({
        title: 'ออกจากระบบสำเร็จ!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-school-primary">
              ระบบจัดการข้อมูลโรงเรียนบ้านดอนมูล
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              สวัสดี, {currentUser.username}
            </span>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('admin')}
                className="text-school-primary border-school-primary hover:bg-school-primary hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-destructive border-destructive hover:bg-destructive hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="border-t bg-gray-50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 ${activeTab === 'dashboard' ? 'bg-school-primary text-white' : ''}`}
              >
                หน้าแรก
              </Button>
              
              {/* Multi-level Dropdown for จัดการข้อมูล */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="px-6 flex items-center gap-1"
                  >
                    จัดการข้อมูล
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg">
                  {/* ข้อมูลนักเรียน Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      ข้อมูลนักเรียน
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-white border border-gray-200 shadow-lg">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setActiveTab('students')}
                      >
                        ข้อมูลพื้นฐาน
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setActiveTab('student-health')}
                      >
                        น้ำหนัก-ส่วนสูง
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setActiveTab('student-analysis')}
                      >
                        วิเคราะห์ผู้เรียน
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setActiveTab('assessment')}
                      >
                        แบบประเมินสมรรถนะ
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => setActiveTab('dental-milk')}
                      >
                        บันทึกแปรงฟันดื่มนม
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => window.open('https://donmul-grades-hub.lovable.app/', '_blank')}
                      >
                        คะแนนและใบงาน
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  <DropdownMenuSeparator />
                  
                  {/* ข้อมูลครู */}
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setActiveTab('teachers')}
                  >
                    ข้อมูลครู
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* บัญชีการเงิน */}
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => window.open('https://baandonmoon-voucher-log.lovable.app/', '_blank')}
                  >
                    บัญชีการเงิน
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* รายงาน Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="px-6 flex items-center gap-1"
                  >
                    รายงาน
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setActiveTab('student-reports')}
                  >
                    รายงานข้อมูลนักเรียน
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setActiveTab('teacher-reports')}
                  >
                    รายงานข้อมูลครู
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setActiveTab('financial-reports')}
                  >
                    รายงานการเงิน
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isAdmin && (
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab('admin')}
                  className={`px-6 ${activeTab === 'admin' ? 'bg-school-primary text-white' : ''}`}
                >
                  จัดการระบบ
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="w-full">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'students' && <StudentManagement />}
          {activeTab === 'teachers' && <TeacherManagement />}
          {activeTab === 'student-health' && <StudentHealth />}
          {activeTab === 'student-analysis' && <StudentAnalysis />}
          {activeTab === 'assessment' && <Assessment />}
          {activeTab === 'dental-milk' && <DentalMilkTracking />}
          {activeTab === 'student-reports' && <Reports />}
          {activeTab === 'teacher-reports' && <TeacherReports />}
          {activeTab === 'financial-reports' && <FinancialReports />}
          {isAdmin && activeTab === 'admin' && <AdminPanel />}
        </div>
      </main>
    </div>
  );
};

export default Index;
