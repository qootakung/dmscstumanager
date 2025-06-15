import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, isValid } from 'date-fns';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Users, UserPlus, GraduationCap, BookOpen, TrendingUp, Award } from 'lucide-react';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from '@/utils/teacherStorage';
import { downloadTeacherTemplate, importTeachersFromExcel } from '@/utils/teacherExcel';
import type { Teacher } from '@/types/teacher';
import Swal from 'sweetalert2';
import TeacherForm from './teacher/TeacherForm';
import TeacherList from './teacher/TeacherList';
import { teacherSchema, type TeacherFormData } from '@/schemas/teacherSchema';

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      academicYear: '2568',
      position: 'ครูผู้ช่วย',
      positionNumber: '',
      firstName: '',
      lastName: '',
      education: '',
      citizenId: '',
      scoutLevel: '',
      majorSubject: '',
      salary: '',
      phone: '',
      lineId: '',
      email: '',
      appointmentDate: null,
      birthDate: null,
    },
  });

  const loadTeachers = async () => {
    const teacherData = await getTeachers();
    setTeachers(teacherData);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      loadTeachers();
    }
  }, [activeTab]);

  const handleSubmit = async (data: TeacherFormData) => {
    const submissionData = {
      ...data,
      appointmentDate: data.appointmentDate && isValid(data.appointmentDate) ? format(data.appointmentDate, 'yyyy-MM-dd') : '',
      birthDate: data.birthDate && isValid(data.birthDate) ? format(data.birthDate, 'yyyy-MM-dd') : '',
    };

    try {
      if (isEditing && selectedTeacher) {
        await updateTeacher(selectedTeacher.id, submissionData);
        await Swal.fire({
          title: 'แก้ไขข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await addTeacher(submissionData as Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>);
        await Swal.fire({
          title: 'เพิ่มข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
      await loadTeachers();
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

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    
    const parseDate = (dateStr: string | undefined) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isValid(date) ? date : null;
    }

    form.reset({
        ...teacher,
        appointmentDate: parseDate(teacher.appointmentDate),
        birthDate: parseDate(teacher.birthDate),
    });
    
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleDelete = async (teacher: Teacher) => {
    const result = await Swal.fire({
      title: 'ลบข้อมูลครู?',
      text: `คุณต้องการลบข้อมูลของ ${teacher.firstName} ${teacher.lastName} หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      await deleteTeacher(teacher.id);
      await loadTeachers();
      await Swal.fire({
        title: 'ลบข้อมูลสำเร็จ!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const resetForm = () => {
    form.reset({
      academicYear: '2568',
      position: 'ครูผู้ช่วย',
      positionNumber: '',
      firstName: '',
      lastName: '',
      education: '',
      citizenId: '',
      scoutLevel: '',
      majorSubject: '',
      salary: '',
      phone: '',
      lineId: '',
      email: '',
      appointmentDate: null,
      birthDate: null,
    });
    setSelectedTeacher(null);
    setIsEditing(false);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: importedTeachers, errors } = await importTeachersFromExcel(file);

      if (errors.length > 0) {
        const errorMessages = errors.map(err => `<p>${err.message}</p>`).join('');
        await Swal.fire({
          title: 'พบข้อผิดพลาดในไฟล์',
          html: `ข้อมูลบางส่วนไม่ถูกต้องและถูกข้ามไป:<div class="text-left max-h-40 overflow-y-auto mt-2 p-2 bg-red-50 border border-red-200 rounded">${errorMessages}</div>`,
          icon: 'warning',
          confirmButtonText: 'ตกลง'
        });
      }

      if (importedTeachers.length === 0) {
        if (errors.length === 0) {
          Swal.fire('ไม่พบข้อมูล', 'ไม่พบข้อมูลครูที่สามารถนำเข้าได้ในไฟล์', 'info');
        }
        return;
      }

      const result = await Swal.fire({
        title: `นำเข้าข้อมูลครู ${importedTeachers.length} คน?`,
        text: 'คุณต้องการเพิ่มข้อมูลครูที่ถูกต้องลงในระบบหรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
      });

      if (result.isConfirmed) {
        let successCount = 0;
        let errorCount = 0;
        
        for (const teacher of importedTeachers) {
          const added = await addTeacher(teacher);
          if (added) {
            successCount++;
          } else {
            errorCount++;
          }
        }

        await Swal.fire(
          'นำเข้าสำเร็จ!',
          `เพิ่มข้อมูลครูสำเร็จ ${successCount} คน, ผิดพลาด ${errorCount} คน`,
          'success'
        );
        await loadTeachers();
        setActiveTab('list');
      }
    } catch (error) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถอ่านไฟล์ Excel ได้', 'error');
      console.error(error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Calculate statistics
  const totalTeachers = teachers.length;
  const positionStats = teachers.reduce((acc, teacher) => {
    acc[teacher.position] = (acc[teacher.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-6 animate-pulse">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              จัดการข้อมูลครู
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-green-500" />
              <p className="text-xl text-slate-700 font-medium">
                เพิ่ม แก้ไข และจัดการข้อมูลครูทั้งหมด
              </p>
              <GraduationCap className="w-6 h-6 text-blue-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-green-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">ครูทั้งหมด</p>
                  <p className="text-3xl font-bold">{totalTeachers}</p>
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
                  <p className="text-blue-100 text-sm font-medium">จำนวนตำแหน่ง</p>
                  <p className="text-3xl font-bold">{Object.keys(positionStats).length}</p>
                  <p className="text-blue-100 text-xs">ตำแหน่งงาน</p>
                </div>
                <Award className="w-12 h-12 text-blue-200" />
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
                  <p className="text-3xl font-bold">+8%</p>
                  <p className="text-orange-100 text-xs">เทียบปีที่แล้ว</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Card */}
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Upload className="w-6 h-6" />
              </div>
              นำเข้าข้อมูลครู
            </CardTitle>
            <p className="text-green-100 mt-2">
              ดาวน์โหลดแม่แบบและนำเข้าข้อมูลครูจากไฟล์ Excel
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={downloadTeacherTemplate} 
                variant="outline" 
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 hover:from-green-600 hover:to-blue-600 shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Download className="mr-2 h-4 w-4" />
                ดาวน์โหลดไฟล์ตัวอย่าง
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Upload className="mr-2 h-4 w-4" />
                นำเข้าจาก Excel
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                className="hidden"
                accept=".xlsx, .xls"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">เครื่องมือจัดการ</h2>
            <p className="text-green-100">เลือกเมนูที่ต้องการใช้งาน</p>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-2 border border-green-100">
                <TabsTrigger 
                  value="form" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  เพิ่ม/แก้ไขข้อมูล
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  รายชื่อครู
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="mt-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                  <TeacherForm
                    form={form}
                    isEditing={isEditing}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                  />
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <TeacherList
                  teachers={teachers}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;
