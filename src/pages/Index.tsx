
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings } from 'lucide-react';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import StudentManagement from '@/components/StudentManagement';
import TeacherManagement from '@/components/TeacherManagement';
import Reports from '@/components/Reports';
import TeacherReports from '@/components/TeacherReports';
import AdminPanel from '@/components/AdminPanel';
import StudentHealth from '@/components/StudentHealth';
import { getCurrentUser, logout } from '@/utils/userStorage';
import type { User } from '@/types/student';
import Swal from 'sweetalert2';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 ${activeTab === 'dashboard' ? 'bg-school-primary text-white' : ''}`}
                  >
                    หน้าแรก
                  </Button>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={`px-6 ${'data-[state=open]:bg-school-primary data-[state=open]:text-white'}`}>
                    จัดการข้อมูล
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-48">
                      <NavigationMenuLink asChild>
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => setActiveTab('students')}
                        >
                          ข้อมูลนักเรียน
                        </Button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => setActiveTab('teachers')}
                        >
                          ข้อมูลครู
                        </Button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => setActiveTab('student-health')}
                        >
                          น้ำหนัก-ส่วนสูง
                        </Button>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={`px-6 ${'data-[state=open]:bg-school-primary data-[state=open]:text-white'}`}>
                    รายงาน
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-48">
                      <NavigationMenuLink asChild>
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => setActiveTab('student-reports')}
                        >
                          รายงานข้อมูลนักเรียน
                        </Button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => setActiveTab('teacher-reports')}
                        >
                          รายงานข้อมูลครู
                        </Button>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {isAdmin && (
                  <NavigationMenuItem>
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveTab('admin')}
                      className={`px-6 ${activeTab === 'admin' ? 'bg-school-primary text-white' : ''}`}
                    >
                      จัดการระบบ
                    </Button>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
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
          {activeTab === 'student-reports' && <Reports />}
          {activeTab === 'teacher-reports' && <TeacherReports />}
          {isAdmin && activeTab === 'admin' && <AdminPanel />}
        </div>
      </main>
    </div>
  );
};

export default Index;
