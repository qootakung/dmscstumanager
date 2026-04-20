
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, GraduationCap, Calendar, Hash } from 'lucide-react';
import type { Student } from '@/types/student';
import { usePermissions } from '@/hooks/usePermissions';

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
  const { canEdit } = usePermissions();
  return (
    <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white p-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-white/20 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          รายชื่อนักเรียนทั้งหมด ({students.length} คน)
        </CardTitle>
        <p className="text-blue-100 mt-2">
          ข้อมูลนักเรียนทั้งหมดในระบบ สามารถแก้ไขและลบข้อมูลได้
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-gray-100 border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-500" />
                  รหัสนักเรียน
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-green-500" />
                    ชื่อ-นามสกุล
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    ระดับชั้น
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    ปีการศึกษา
                  </div>
                </th>
                <th className="text-center p-4 font-semibold text-gray-700">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr 
                  key={student.id} 
                  className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {student.studentId.slice(-2)}
                      </div>
                      <span className="font-medium text-gray-900">{student.studentId}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {student.firstNameTh.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.titleTh} {student.firstNameTh} {student.lastNameTh}
                        </p>
                        <p className="text-sm text-gray-500">{student.grade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200">
                      {student.grade}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200">
                      {student.academicYear}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {canEdit ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(student)}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(student)}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 hover:from-red-600 hover:to-pink-600 shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">อ่านอย่างเดียว</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xl font-medium text-gray-500 mb-2">ไม่มีข้อมูลนักเรียน</p>
                        <p className="text-gray-400">กรุณาเพิ่มข้อมูลนักเรียนก่อนใช้งาน</p>
                      </div>
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
