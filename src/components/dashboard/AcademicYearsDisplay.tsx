
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AcademicYearsDisplayProps {
  academicYears: string[];
}

const AcademicYearsDisplay: React.FC<AcademicYearsDisplayProps> = ({ academicYears }) => {
  const gradeColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  if (academicYears.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-bold">ปีการศึกษาที่มีข้อมูล</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-3">
          {academicYears.map((year, index) => (
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
  );
};

export default AcademicYearsDisplay;
