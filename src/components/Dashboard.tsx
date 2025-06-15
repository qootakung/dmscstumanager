
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, FileText, Activity } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-school-primary mb-4">
          ยินดีต้อนรับสู่ระบบจัดการข้อมูลโรงเรียนบ้านดอนมูล
        </h1>
        <p className="text-gray-600 text-lg">
          ระบบจัดการข้อมูลสารสนเทศโรงเรียนบ้านดอนมูล
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              นักเรียนทั้งหมด
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">-</div>
            <p className="text-xs text-blue-600">
              จำนวนนักเรียนในระบบ
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              ครูทั้งหมด
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">-</div>
            <p className="text-xs text-green-600">
              จำนวนครูในระบบ
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              รายงาน
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">-</div>
            <p className="text-xs text-orange-600">
              รายงานที่สร้างแล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              ข้อมูลสุขภาพ
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">-</div>
            <p className="text-xs text-purple-600">
              ข้อมูลน้ำหนัก-ส่วนสูง
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
