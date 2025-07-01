
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TeacherStats {
  total: number;
  byPosition: Record<string, number>;
}

interface TeacherPositionChartProps {
  teacherStats: TeacherStats;
}

const TeacherPositionChart: React.FC<TeacherPositionChartProps> = ({ teacherStats }) => {
  const positionChartData = Object.entries(teacherStats.byPosition).map(([position, count]) => ({
    position: position,
    teachers: Math.min(count, 10),
    fullPosition: position
  }));

  const gradeColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  if (teacherStats.total === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-bold">จำนวนครูแยกตามตำแหน่ง</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={500}>
          <BarChart 
            data={positionChartData} 
            layout="vertical" 
            margin={{ left: 300, right: 30, top: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              stroke="#64748b" 
              fontSize={12} 
              domain={[0, 10]} 
            />
            <YAxis 
              dataKey="position" 
              type="category" 
              stroke="#64748b" 
              fontSize={11}
              width={290}
              textAnchor="start"
              tick={{ 
                textAnchor: 'start',
                fontSize: 11,
                dy: 0
              }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name, props) => [
                `${value} คน`,
                props.payload.fullPosition
              ]}
            />
            <Bar 
              dataKey="teachers" 
              radius={[0, 6, 6, 0]}
            >
              {positionChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={gradeColors[index % gradeColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TeacherPositionChart;
