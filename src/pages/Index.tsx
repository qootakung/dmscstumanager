
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings } from 'lucide-react';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import StudentManagement from '@/components/StudentManagement';
import Reports from '@/components/Reports';
import AdminPanel from '@/components/AdminPanel';
import { getCurrentUser, logout } from '@/utils/storage';
import type { User } from '@/types/student';
import Swal from 'sweetalert2';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = () => {
    const user = getCurrentUser();
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-1'}`}>
            <TabsTrigger value="dashboard">หน้าแรก</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="students">จัดการนักเรียน</TabsTrigger>
                <TabsTrigger value="reports">รายงาน</TabsTrigger>
                <TabsTrigger value="admin">จัดการระบบ</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard />
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="students" className="mt-6">
                <StudentManagement />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <Reports />
              </TabsContent>

              <TabsContent value="admin" className="mt-6">
                <AdminPanel />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
