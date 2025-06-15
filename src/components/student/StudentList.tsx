
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, Search } from 'lucide-react';
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
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <CardTitle className="text-xl font-sarabun">
            รายชื่อนักเรียนทั้งหมด ({students.length} คน)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700 border-r border-gray-200">รหัสนักเรียน</th>
                <th className="text-left p-4 font-semibold text-gray-700 border-r border-gray-200">ชื่อ-นามสกุล</th>
                <th className="text-left p-4 font-semibold text-gray-700 border-r border-gray-200">ระดับชั้น</th>
                <th className="text-left p-4 font-semibold text-gray-700 border-r border-gray-200">ปีการศึกษา</th>
                <th className="text-center p-4 font-semibold text-gray-700">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr 
                  key={student.id} 
                  className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="p-4 border-r border-gray-100 font-medium text-blue-600">{student.studentId}</td>
                  <td className="p-4 border-r border-gray-100">
                    <div className="font-medium text-gray-900">
                      {student.titleTh} {student.firstNameTh} {student.lastNameTh}
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {student.grade}
                    </span>
                  </td>
                  <td className="p-4 border-r border-gray-100">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {student.academicYear}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(student)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(student)}
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">ไม่พบข้อมูลนักเรียน</p>
                      <p className="text-sm">กรุณาเพิ่มข้อมูลนักเรียนใหม่</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentList;
