
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from '@/utils/teacherStorage';
import type { Teacher } from '@/types/teacher';
import Swal from 'sweetalert2';
import TeacherForm from './teacher/TeacherForm';
import TeacherList from './teacher/TeacherList';

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState<Partial<Teacher>>({
    academicYear: '2568',
    position: 'ครูผู้ช่วย'
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      loadTeachers();
    }
  }, [activeTab]);

  const loadTeachers = () => {
    const teacherData = getTeachers();
    setTeachers(teacherData);
  };

  const handleInputChange = (field: keyof Teacher, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.positionNumber || !formData.firstName || !formData.lastName) {
      await Swal.fire({
        title: 'ข้อมูลไม่ครบถ้วน!',
        text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    try {
      if (isEditing && selectedTeacher) {
        updateTeacher(selectedTeacher.id, formData);
        await Swal.fire({
          title: 'แก้ไขข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        addTeacher(formData as Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>);
        await Swal.fire({
          title: 'เพิ่มข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
      loadTeachers();
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
    setFormData(teacher);
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
      deleteTeacher(teacher.id);
      loadTeachers();
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
      position: 'ครูผู้ช่วย'
    });
    setSelectedTeacher(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-school-primary mb-2">
          จัดการข้อมูลครู
        </h2>
        <p className="text-muted-foreground">
          เพิ่ม แก้ไข และจัดการข้อมูลครูทั้งหมด
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">เพิ่ม/แก้ไขข้อมูล</TabsTrigger>
          <TabsTrigger value="list">รายชื่อครู</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <TeacherForm
            formData={formData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
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
  );
};

export default TeacherManagement;
