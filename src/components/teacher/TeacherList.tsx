
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Search } from 'lucide-react';
import type { Teacher } from '@/types/teacher';
import { usePermissions } from '@/hooks/usePermissions';

interface TeacherListProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ teachers, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { canEdit } = usePermissions();

  const filteredTeachers = teachers.filter(teacher =>
    teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.positionNumber.includes(searchTerm) ||
    teacher.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // เรียงลำดับตามเลขตำแหน่ง (จากน้อยไปมาก)
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    const numA = parseInt(a.positionNumber) || 0;
    const numB = parseInt(b.positionNumber) || 0;
    return numA - numB;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายชื่อครู ({sortedTeachers.length} คน)</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาครู..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
              {sortedTeachers.length > 0 ? (
                sortedTeachers.map((teacher, index) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    ไม่พบข้อมูลครู
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherList;
