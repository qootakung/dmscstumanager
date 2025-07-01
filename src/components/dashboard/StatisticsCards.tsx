
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Calendar, UserCheck, UserCog } from 'lucide-react';

interface StudentStats {
  total: number;
  byGender: { ชาย?: number; หญิง?: number };
  academicYears: string[];
}

interface TeacherStats {
  total: number;
  academicYears: string[];
}

interface StatisticsCardsProps {
  studentStats: StudentStats;
  teacherStats: TeacherStats;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ studentStats, teacherStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
          <Users className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{studentStats.total}</div>
          <p className="text-blue-100 text-sm">คน</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">นักเรียนชาย</CardTitle>
          <UserCheck className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{studentStats.byGender.ชาย || 0}</div>
          <p className="text-emerald-100 text-sm">ช = ชาย</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">นักเรียนหญิง</CardTitle>
          <UserCheck className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{studentStats.byGender.หญิง || 0}</div>
          <p className="text-orange-100 text-sm">ญ = หญิง</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ปีการศึกษา</CardTitle>
          <Calendar className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{studentStats.academicYears.length}</div>
          <p className="text-purple-100 text-sm">ปี</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ครูทั้งหมด</CardTitle>
          <UserCog className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{teacherStats.total}</div>
          <p className="text-teal-100 text-sm">คน</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ปีการศึกษาครู</CardTitle>
          <GraduationCap className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{teacherStats.academicYears.length}</div>
          <p className="text-pink-100 text-sm">ปี</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
