import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, FileText, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getStudentStatistics } from '@/utils/statisticsStorage';

const Dashboard = () => {
  const [statistics, setStatistics] = useState({
    total: 0,
    byGrade: {} as Record<string, number>,
    byGender: { ชาย: 0, หญิง: 0 },
    academicYears: [] as string[]
  });

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const stats = await getStudentStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    };
    loadStatistics();
  }, []);

  // Beautiful darker color palette for grade chart
  const gradeColors = [
    '#DC2626', // Deep Red
    '#059669', // Deep Emerald
    '#1D4ED8', // Deep Blue
    '#7C2D12', // Deep Brown
    '#A21CAF', // Deep Magenta
    '#EA580C', // Deep Orange
    '#0891B2', // Deep Cyan
    '#65A30D', // Deep Lime
    '#7C3AED', // Deep Violet
    '#BE185D', // Deep Pink
    '#CA8A04', // Deep Yellow
    '#166534'  // Deep Green
  ];

  // Chart data preparations with beautiful colors
  const gradeChartData = Object.entries(statistics.byGrade).map(([grade, count], index) => ({
    grade,
    count,
    fill: gradeColors[index % gradeColors.length]
  }));

  const genderChartData = [
    { name: 'ชาย', value: statistics.byGender.ชาย, fill: '#1D4ED8' },
    { name: 'หญิง', value: statistics.byGender.หญิง, fill: '#BE185D' }
  ];

  const chartConfig = {
    students: {
      label: "นักเรียน",
    },
    grade: {
      label: "ชั้น",
    }
  };

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
            <div className="text-2xl font-bold text-blue-900">{statistics.total}</div>
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
            <div className="text-2xl font-bold text-green-900">12</div>
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
            <div className="text-2xl font-bold text-orange-900">8</div>
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
            <div className="text-2xl font-bold text-purple-900">{statistics.total}</div>
            <p className="text-xs text-purple-600">
              ข้อมูลน้ำหนัก-ส่วนสูง
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Grade Chart with Beautiful Colors */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-school-primary">จำนวนนักเรียนแยกตามชั้น</CardTitle>
            <CardDescription>
              การกระจายตัวของนักเรียนในแต่ละระดับชั้น
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {gradeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-school-primary">อัตราส่วนเพศของนักเรียน</CardTitle>
            <CardDescription>
              การแบ่งตามเพศของนักเรียนทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Academic Years Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-school-primary">แนวโน้มจำนวนนักเรียนตามปีการศึกษา</CardTitle>
          <CardDescription>
            การเปลี่ยนแปลงจำนวนนักเรียนในแต่ละปีการศึกษา
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={statistics.academicYears.map((year, index) => ({
                  year,
                  students: Math.floor(Math.random() * 100) + 50 // ข้อมูลตัวอย่าง
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="hsl(var(--school-primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--school-primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
