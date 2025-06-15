import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Trash2, Users, Database, Shield, Settings, Server, Activity, AlertTriangle } from 'lucide-react';
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

  const loadUsers = async () => {
    const userData = await getUsers();
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
      const addedUser = await addUser(newUser);
      if (!addedUser) throw new Error('Failed to add user');

      await Swal.fire({
        title: 'เพิ่มผู้ใช้สำเร็จ!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      setNewUser({ username: '', password: '', role: 'user' });
      await loadUsers();
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
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const regularUsers = users.filter(user => user.role === 'user').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mb-6 animate-pulse">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
              จัดการระบบ
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-red-500" />
              <p className="text-xl text-slate-700 font-medium">
                จัดการผู้ใช้งานและการตั้งค่าระบบ
              </p>
              <Server className="w-6 h-6 text-orange-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-full border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-red-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">ผู้ใช้ทั้งหมด</p>
                  <p className="text-3xl font-bold">{users.length}</p>
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
                  <p className="text-blue-100 text-sm font-medium">ผู้ดูแลระบบ</p>
                  <p className="text-3xl font-bold">{adminUsers}</p>
                  <p className="text-blue-100 text-xs">Admin</p>
                </div>
                <Shield className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">ผู้ใช้ทั่วไป</p>
                  <p className="text-3xl font-bold">{regularUsers}</p>
                  <p className="text-purple-100 text-xs">User</p>
                </div>
                <UserPlus className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">สถานะระบบ</p>
                  <p className="text-2xl font-bold">Online</p>
                  <p className="text-orange-100 text-xs">พร้อมใช้งาน</p>
                </div>
                <Activity className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">เครื่องมือจัดการ</h2>
            <p className="text-red-100">เลือกเมนูที่ต้องการใช้งาน</p>
          </div>

          <div className="p-6">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-2 border border-red-100">
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  จัดการผู้ใช้
                </TabsTrigger>
                <TabsTrigger 
                  value="system" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  จัดการระบบ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Add New User */}
                  <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        เพิ่มผู้ใช้ใหม่
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                      <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                          <Label htmlFor="username" className="text-gray-700 font-medium">ชื่อผู้ใช้</Label>
                          <Input
                            id="username"
                            value={newUser.username}
                            onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="กรุณาใส่ชื่อผู้ใช้"
                            className="border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="password" className="text-gray-700 font-medium">รหัสผ่าน</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="กรุณาใส่รหัสผ่าน"
                            className="border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="role" className="text-gray-700 font-medium">สิทธิ์ผู้ใช้</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as 'admin' | 'user' }))}
                          >
                            <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 rounded-xl">
                              <SelectValue placeholder="เลือกสิทธิ์ผู้ใช้" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">ผู้ใช้ทั่วไป</SelectItem>
                              <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105 rounded-xl"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          เพิ่มผู้ใช้
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* User List */}
                  <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Users className="w-5 h-5" />
                        </div>
                        รายการผู้ใช้ ({users.length} คน)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-gradient-to-br from-green-50 to-blue-50 max-h-96 overflow-y-auto">
                      <div className="space-y-3">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                user.role === 'admin' 
                                ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                              }`}>
                                {user.role === 'admin' ? (
                                  <Shield className="w-5 h-5 text-white" />
                                ) : (
                                  <Users className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.username}</p>
                                <p className="text-sm text-gray-600">
                                  {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {user.role === 'admin' && (
                                <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full font-medium">
                                  Admin
                                </span>
                              )}
                              {currentUser?.id === user.id && (
                                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs rounded-full font-medium">
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
                  <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Database className="w-5 h-5" />
                        </div>
                        จัดการฐานข้อมูล
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-gradient-to-br from-red-50 to-pink-50">
                      <div className="p-6 bg-gradient-to-r from-yellow-100 to-red-100 border-2 border-yellow-300 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                          <p className="text-sm text-red-800 font-semibold">
                            คำเตือน: การลบข้อมูลจะไม่สามารถย้อนกลับได้
                          </p>
                        </div>
                        
                        <Button
                          onClick={handleClearAllStudents}
                          variant="destructive"
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg transition-all duration-300 transform hover:scale-105 rounded-xl"
                          disabled={!isMainAdmin}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          ลบข้อมูลนักเรียนทั้งหมด
                        </Button>
                        
                        {!isMainAdmin && (
                          <p className="text-xs text-gray-600 mt-3 text-center">
                            เฉพาะผู้ดูแลระบบหลัก (dmsc@) เท่านั้นที่สามารถใช้งานได้
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Information */}
                  <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Server className="w-5 h-5" />
                        </div>
                        ข้อมูลระบบ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/80 rounded-xl border border-blue-200">
                          <span className="text-gray-700 font-medium">ผู้ใช้ปัจจุบัน:</span>
                          <span className="font-bold text-blue-600">{currentUser?.username}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white/80 rounded-xl border border-blue-200">
                          <span className="text-gray-700 font-medium">สิทธิ์:</span>
                          <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                            currentUser?.role === 'admin' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                          }`}>
                            {currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white/80 rounded-xl border border-blue-200">
                          <span className="text-gray-700 font-medium">จำนวนผู้ใช้ทั้งหมด:</span>
                          <span className="font-bold text-green-600">{users.length} คน</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white/80 rounded-xl border border-blue-200">
                          <span className="text-gray-700 font-medium">เวอร์ชันระบบ:</span>
                          <span className="font-bold text-purple-600">1.0.0</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border border-green-200">
                          <span className="text-gray-700 font-medium">สถานะระบบ:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-bold text-green-700">ออนไลน์</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
