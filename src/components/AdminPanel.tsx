
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Trash2, Users, Database } from 'lucide-react';
import { getUsers, addUser, clearAllStudents, getCurrentUser } from '@/utils/storage';
import type { User } from '@/types/student';
import Swal from 'sweetalert2';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const userData = getUsers();
    setUsers(userData);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      await Swal.fire({
        title: 'ข้อมูลไม่ครบถ้วน!',
        text: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    // Check if username already exists
    const existingUser = users.find(user => user.username === newUser.username);
    if (existingUser) {
      await Swal.fire({
        title: 'ชื่อผู้ใช้ซ้ำ!',
        text: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    try {
      addUser(newUser);
      await Swal.fire({
        title: 'เพิ่มผู้ใช้สำเร็จ!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      setNewUser({ username: '', password: '', role: 'user' });
      loadUsers();
    } catch (error) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถเพิ่มผู้ใช้ได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  const handleClearAllStudents = async () => {
    // Only allow the main admin (dmsc@) to delete all data
    if (currentUser?.username !== 'dmsc@') {
      await Swal.fire({
        title: 'ไม่มีสิทธิ์!',
        text: 'เฉพาะผู้ดูแลระบบหลัก (dmsc@) เท่านั้นที่สามารถลบข้อมูลทั้งหมดได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'ลบข้อมูลนักเรียนทั้งหมด?',
      text: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบทั้งหมด',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      clearAllStudents();
      await Swal.fire({
        title: 'ลบข้อมูลสำเร็จ!',
        text: 'ข้อมูลนักเรียนทั้งหมดถูกลบแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const isMainAdmin = currentUser?.username === 'dmsc@';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-school-primary mb-2">
          จัดการระบบ
        </h2>
        <p className="text-muted-foreground">
          จัดการผู้ใช้งานและการตั้งค่าระบบ
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">จัดการผู้ใช้</TabsTrigger>
          <TabsTrigger value="system">จัดการระบบ</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New User */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  เพิ่มผู้ใช้ใหม่
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <Label htmlFor="username">ชื่อผู้ใช้</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="กรุณาใส่ชื่อผู้ใช้"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="กรุณาใส่รหัสผ่าน"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">สิทธิ์ผู้ใช้</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as 'admin' | 'user' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสิทธิ์ผู้ใช้" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">ผู้ใช้ทั่วไป</SelectItem>
                        <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full bg-school-primary hover:bg-school-primary/90">
                    <UserPlus className="w-4 h-4 mr-2" />
                    เพิ่มผู้ใช้
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* User List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  รายการผู้ใช้ ({users.length} คน)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' && (
                          <span className="px-2 py-1 bg-school-primary text-white text-xs rounded">
                            Admin
                          </span>
                        )}
                        {currentUser?.id === user.id && (
                          <span className="px-2 py-1 bg-school-secondary text-white text-xs rounded">
                            คุณ
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  จัดการฐานข้อมูล
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    <strong>คำเตือน:</strong> การลบข้อมูลจะไม่สามารถย้อนกลับได้
                  </p>
                  
                  <Button
                    onClick={handleClearAllStudents}
                    variant="destructive"
                    className="w-full"
                    disabled={!isMainAdmin}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบข้อมูลนักเรียนทั้งหมด
                  </Button>
                  
                  {!isMainAdmin && (
                    <p className="text-xs text-muted-foreground mt-2">
                      เฉพาะผู้ดูแลระบบหลัก (dmsc@) เท่านั้นที่สามารถใช้งานได้
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลระบบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ผู้ใช้ปัจจุบัน:</span>
                  <span className="font-medium">{currentUser?.username}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">สิทธิ์:</span>
                  <span className="font-medium">
                    {currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">จำนวนผู้ใช้ทั้งหมด:</span>
                  <span className="font-medium">{users.length} คน</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เวอร์ชันระบบ:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
