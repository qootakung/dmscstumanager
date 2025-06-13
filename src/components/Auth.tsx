
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { login } from '@/utils/storage';
import Swal from 'sweetalert2';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = login(username, password);
      if (user) {
        await Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: `ยินดีต้อนรับ ${user.username}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        onLogin();
      } else {
        await Swal.fire({
          title: 'เข้าสู่ระบบไม่สำเร็จ!',
          text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถเข้าสู่ระบบได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center school-gradient">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-school-primary">
            ระบบจัดการข้อมูลสารสนเทศ
          </CardTitle>
          <CardDescription className="text-lg">
            โรงเรียนบ้านดอนมูล
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรุณาใส่ชื่อผู้ใช้"
                required
                className="font-sarabun"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรุณาใส่รหัสผ่าน"
                required
                className="font-sarabun"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-school-primary hover:bg-school-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
