
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { Student } from '@/types/student';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>รายชื่อนักเรียนทั้งหมด ({students.length} คน)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-school-primary text-white">
                <th className="border border-gray-300 p-2">รหัสนักเรียน</th>
                <th className="border border-gray-300 p-2">ชื่อ-นามสกุล</th>
                <th className="border border-gray-300 p-2">ระดับชั้น</th>
                <th className="border border-gray-300 p-2">ปีการศึกษา</th>
                <th className="border border-gray-300 p-2">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="border border-gray-300 p-2">{student.studentId}</td>
                  <td className="border border-gray-300 p-2">
                    {student.titleTh} {student.firstNameTh} {student.lastNameTh}
                  </td>
                  <td className="border border-gray-300 p-2">{student.grade}</td>
                  <td className="border border-gray-300 p-2">{student.academicYear}</td>
                  <td className="border border-gray-300 p-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(student)}
                        className="text-school-primary border-school-primary hover:bg-school-primary hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(student)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentList;
