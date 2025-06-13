
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudentStatistics } from '@/utils/storage';
import { Users, GraduationCap, Calendar, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const stats = getStudentStatistics();
  
  const gradeChartData = Object.entries(stats.byGrade).map(([grade, count]) => ({
    grade,
    students: count,
  }));

  const genderChartData = Object.entries(stats.byGender).map(([gender, count]) => ({
    name: gender,
    value: count,
  }));

  const COLORS = ['#22c55e', '#f59e0b'];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-school-primary mb-2">
          ระบบจัดการข้อมูลสารสนเทศ
        </h1>
        <h2 className="text-2xl text-school-secondary">
          โรงเรียนบ้านดอนมูล
        </h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="school-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-school-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-school-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>

        <Card className="school-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักเรียนชาย</CardTitle>
            <GraduationCap className="h-4 w-4 text-school-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-school-accent">{stats.byGender.ชาย}</div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>

        <Card className="school-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักเรียนหญิง</CardTitle>
            <BookOpen className="h-4 w-4 text-school-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-school-secondary">{stats.byGender.หญิง}</div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>

        <Card className="school-card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ปีการศึกษา</CardTitle>
            <Calendar className="h-4 w-4 text-school-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-school-success">{stats.academicYears.length}</div>
            <p className="text-xs text-muted-foreground">ปี</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>จำนวนนักเรียนแยกตามระดับชั้น</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="hsl(var(--school-primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนนักเรียนแยกตามเพศ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} คน (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Academic Years */}
      {stats.academicYears.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ปีการศึกษาที่มีข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.academicYears.map((year) => (
                <span
                  key={year}
                  className="px-3 py-1 bg-school-primary text-white rounded-full text-sm"
                >
                  {year}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
