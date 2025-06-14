
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudentStatistics } from '@/utils/storage';
import { getTeacherStatistics } from '@/utils/teacherStorage';
import { Users, GraduationCap, Calendar, BookOpen, UserCheck, UserCog } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const studentStats = getStudentStatistics();
  const teacherStats = getTeacherStatistics();
  
  const gradeChartData = Object.entries(studentStats.byGrade).map(([grade, count]) => ({
    grade,
    students: count,
  }));

  const genderChartData = Object.entries(studentStats.byGender).map(([gender, count]) => ({
    name: gender,
    value: count,
  }));

  const positionChartData = Object.entries(teacherStats.byPosition).map(([position, count]) => ({
    position: position.length > 15 ? position.substring(0, 15) + '...' : position,
    teachers: count,
  }));

  // สีสันสำหรับกราฟแต่ละระดับชั้น
  const gradeColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const GENDER_COLORS = ['#22c55e', '#f59e0b'];

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards with vibrant colors */}
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

      {/* Charts with enhanced styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-bold">จำนวนนักเรียนแยกตามระดับชั้น</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="grade" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar 
                  dataKey="students" 
                  radius={[6, 6, 0, 0]}
                  fill="url(#colorGradient)"
                >
                  {gradeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={gradeColors[index % gradeColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-bold">สัดส่วนนักเรียนแยกตามเพศ</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name === 'ชาย' ? 'ช' : 'ญ'}: ${value} คน (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Position Chart */}
      {teacherStats.total > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-bold">จำนวนครูแยกตามตำแหน่ง</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positionChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="position" type="category" stroke="#64748b" fontSize={12} width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar 
                  dataKey="teachers" 
                  radius={[0, 6, 6, 0]}
                  fill="url(#colorGradient)"
                >
                  {positionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={gradeColors[index % gradeColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Academic Years with enhanced styling */}
      {studentStats.academicYears.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-lg font-bold">ปีการศึกษาที่มีข้อมูล</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {studentStats.academicYears.map((year, index) => (
                <span
                  key={year}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                  style={{
                    background: `linear-gradient(135deg, ${gradeColors[index % gradeColors.length]}, ${gradeColors[(index + 1) % gradeColors.length]})`
                  }}
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
