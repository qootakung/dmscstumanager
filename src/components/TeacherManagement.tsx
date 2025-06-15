import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, isValid } from 'date-fns';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, GraduationCap, Users, UserPlus, Award, BookOpen, Star } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl mb-6 animate-pulse">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              จัดการข้อมูลครู
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-6 h-6 text-amber-500" />
              <p className="text-xl text-slate-700 font-medium">
                เพิ่ม แก้ไข และจัดการข้อมูลครูและบุคลากรทางการศึกษา
              </p>
              <BookOpen className="w-6 h-6 text-orange-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-amber-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">ครูทั้งหมด</p>
                <p className="text-3xl font-bold">{teachers.length}</p>
              </div>
              <GraduationCap className="w-12 h-12 text-amber-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">ปีการศึกษาปัจจุบัน</p>
                <p className="text-3xl font-bold">2568</p>
              </div>
              <BookOpen className="w-12 h-12 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">สถานะระบบ</p>
                <p className="text-lg font-bold">พร้อมใช้งาน</p>
              </div>
              <Star className="w-12 h-12 text-red-200" />
            </div>
          </div>
        </div>

        {/* Enhanced Import Card */}
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6" />
              <CardTitle className="text-xl font-sarabun">นำเข้าข้อมูลครู</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex gap-4 p-6">
            <Button 
              onClick={downloadTeacherTemplate} 
              variant="outline" 
              className="font-sarabun border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
            >
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลดไฟล์ตัวอย่าง
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="font-sarabun bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
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
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">เครื่องมือจัดการข้อมูล</h2>
            <p className="text-amber-100">เลือกเมนูที่ต้องการใช้งาน</p>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-2 border border-amber-100">
                <TabsTrigger 
                  value="form" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-sarabun flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  เพิ่ม/แก้ไขข้อมูล
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl transition-all duration-300 font-sarabun flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  รายชื่อครู
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="mt-6">
                <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl p-6 border border-amber-100">
                  <TeacherForm
                    form={form}
                    isEditing={isEditing}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                  />
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <div className="bg-gradient-to-br from-slate-50/50 to-gray-50/50 rounded-2xl p-6 border border-slate-200">
                  <TeacherList
                    teachers={teachers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center">
          <div className="flex items-center gap-6 text-5xl opacity-20">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>👨‍🏫</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>📚</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🏆</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>📊</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>📋</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;
