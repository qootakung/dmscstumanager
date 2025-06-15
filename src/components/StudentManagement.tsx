
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStudents, addStudent, updateStudent, deleteStudent } from '@/utils/storage';
import type { Student } from '@/types/student';
import Swal from 'sweetalert2';
import StudentForm from './student/StudentForm';
import StudentList from './student/StudentList';
import StudentImport from './student/StudentImport';
import { Users, UserPlus, FileText, Upload, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState<Partial<Student>>({
    academicYear: '2568',
    grade: 'อ.1',
    gender: 'ชาย'
  });

  const loadStudents = async () => {
    const studentData = await getStudents();
    setStudents(studentData);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Reload students when tab changes to list (helpful after import)
  useEffect(() => {
    if (activeTab === 'list') {
      loadStudents();
    }
  }, [activeTab]);

  const handleInputChange = (field: keyof Student, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.citizenId || !formData.studentId || !formData.firstNameTh || !formData.lastNameTh) {
      await Swal.fire({
        title: 'ข้อมูลไม่ครบถ้วน!',
        text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    try {
      if (isEditing && selectedStudent) {
        await updateStudent(selectedStudent.id, formData);
        await Swal.fire({
          title: 'แก้ไขข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await addStudent(formData as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>);
        await Swal.fire({
          title: 'เพิ่มข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
      await loadStudents();
      resetForm();
    } catch (error) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData(student);
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleDelete = async (student: Student) => {
    const result = await Swal.fire({
      title: 'ลบข้อมูลนักเรียน?',
      text: `คุณต้องการลบข้อมูลของ ${student.firstNameTh} ${student.lastNameTh} หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      await deleteStudent(student.id);
      await loadStudents();
      await Swal.fire({
        title: 'ลบข้อมูลสำเร็จ!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const resetForm = () => {
    setFormData({
      academicYear: '2568',
      grade: 'อ.1',
      gender: 'ชาย'
    });
    setSelectedStudent(null);
    setIsEditing(false);
  };

  // Calculate statistics
  const totalStudents = students.length;
  const gradeStats = students.reduce((acc, student) => {
    acc[student.grade] = (acc[student.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 animate-pulse">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              จัดการข้อมูลนักเรียน
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <p className="text-xl text-slate-700 font-medium">
                เพิ่ม แก้ไข และจัดการข้อมูลนักเรียนทั้งหมด
              </p>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-blue-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">นักเรียนทั้งหมด</p>
                  <p className="text-3xl font-bold">{totalStudents}</p>
                  <p className="text-emerald-100 text-xs">คน</p>
                </div>
                <Users className="w-12 h-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">จำนวนชั้นเรียน</p>
                  <p className="text-3xl font-bold">{Object.keys(gradeStats).length}</p>
                  <p className="text-blue-100 text-xs">ระดับชั้น</p>
                </div>
                <BookOpen className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">ปีการศึกษา</p>
                  <p className="text-3xl font-bold">2568</p>
                  <p className="text-purple-100 text-xs">ปีปัจจุบัน</p>
                </div>
                <GraduationCap className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">อัตราการเติบโต</p>
                  <p className="text-3xl font-bold">+12%</p>
                  <p className="text-orange-100 text-xs">เทียบปีที่แล้ว</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">เครื่องมือจัดการ</h2>
            <p className="text-blue-100">เลือกเมนูที่ต้องการใช้งาน</p>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-2 border border-blue-100">
                <TabsTrigger 
                  value="form" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  เพิ่ม/แก้ไขข้อมูล
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  รายชื่อนักเรียน
                </TabsTrigger>
                <TabsTrigger 
                  value="import" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  นำเข้าข้อมูล
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <StudentForm
                    formData={formData}
                    isEditing={isEditing}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                  />
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <StudentList
                  students={students}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>

              <TabsContent value="import" className="mt-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                  <StudentImport />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
