
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Search, Calendar, ChevronDown, ChevronUp, Users } from 'lucide-react';
import type { Teacher } from '@/types/teacher';
import { usePermissions } from '@/hooks/usePermissions';

interface TeacherListProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

const YearColors = [
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-blue-500 via-indigo-500 to-purple-500',
  'from-orange-500 via-red-500 to-pink-500',
  'from-violet-500 via-fuchsia-500 to-rose-500',
  'from-lime-500 via-green-500 to-emerald-500',
  'from-cyan-500 via-sky-500 to-blue-500',
];

const TeacherList: React.FC<TeacherListProps> = ({ teachers, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedYears, setCollapsedYears] = useState<Record<string, boolean>>({});
  const { canEdit } = usePermissions();

  const filteredTeachers = teachers.filter(teacher =>
    teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.positionNumber.includes(searchTerm) ||
    teacher.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // จัดกลุ่มตามปีการศึกษา
  const grouped = filteredTeachers.reduce((acc, teacher) => {
    const year = teacher.academicYear || 'ไม่ระบุ';
    if (!acc[year]) acc[year] = [];
    acc[year].push(teacher);
    return acc;
  }, {} as Record<string, Teacher[]>);

  // เรียงลำดับแต่ละกลุ่มตามเลขตำแหน่ง
  Object.keys(grouped).forEach(year => {
    grouped[year].sort((a, b) => {
      const numA = parseInt(a.positionNumber) || 0;
      const numB = parseInt(b.positionNumber) || 0;
      return numA - numB;
    });
  });

  const sortedYears = Object.keys(grouped).sort((a, b) => {
    const na = parseInt(a) || 0;
    const nb = parseInt(b) || 0;
    return nb - na;
  });

  const toggleYear = (year: string) => {
    setCollapsedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const renderTable = (yearTeachers: Teacher[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ลำดับที่</TableHead>
          <TableHead>เลขตำแหน่ง</TableHead>
          <TableHead>ชื่อ - นามสกุล</TableHead>
          <TableHead>ตำแหน่ง</TableHead>
          <TableHead>เบอร์โทร</TableHead>
          <TableHead>ปีการศึกษา</TableHead>
          <TableHead className="text-center">จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {yearTeachers.map((teacher, index) => (
          <TableRow key={teacher.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{teacher.positionNumber}</TableCell>
            <TableCell>{teacher.firstName} {teacher.lastName}</TableCell>
            <TableCell>{teacher.position}</TableCell>
            <TableCell>{teacher.phone}</TableCell>
            <TableCell>{teacher.academicYear}</TableCell>
            <TableCell>
              <div className="flex gap-2 justify-center">
                {canEdit ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(teacher)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(teacher)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground italic">อ่านอย่างเดียว</span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white p-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            รายชื่อครูทั้งหมด ({filteredTeachers.length} คน)
          </CardTitle>
          <p className="text-blue-100 mt-2">แยกตามปีการศึกษา สามารถแก้ไขและลบข้อมูลได้</p>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาครู..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-white text-gray-900"
            />
          </div>
        </CardHeader>
      </Card>

      {sortedYears.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            ไม่พบข้อมูลครู
          </CardContent>
        </Card>
      ) : (
        sortedYears.map((year, yearIndex) => {
          const yearTeachers = grouped[year];
          const isCollapsed = collapsedYears[year];
          const gradient = YearColors[yearIndex % YearColors.length];
          return (
            <Card key={year} className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <CardHeader
                className={`bg-gradient-to-r ${gradient} text-white p-5 cursor-pointer select-none`}
                onClick={() => toggleYear(year)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">ปีการศึกษา {year}</CardTitle>
                      <p className="text-white/80 text-sm mt-1">จำนวน {yearTeachers.length} คน</p>
                    </div>
                  </div>
                  <div className="p-2 bg-white/20 rounded-xl">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </div>
                </div>
              </CardHeader>
              {!isCollapsed && (
                <CardContent className="p-0">
                  <div className="overflow-x-auto">{renderTable(yearTeachers)}</div>
                </CardContent>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};

export default TeacherList;
