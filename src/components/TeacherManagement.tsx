
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from '@/utils/teacherStorage';
import { downloadTeacherTemplate, importTeachersFromExcel } from '@/utils/teacherExcel';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        await updateTeacher(selectedTeacher.id, formData);
        await Swal.fire({
          title: 'แก้ไขข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await addTeacher(formData as Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>);
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
    setFormData({
      academicYear: '2568',
      position: 'ครูผู้ช่วย'
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-school-primary mb-2">
          จัดการข้อมูลครู
        </h2>
        <p className="text-muted-foreground">
          เพิ่ม แก้ไข และจัดการข้อมูลครูทั้งหมด
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">นำเข้าข้อมูลครู</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={downloadTeacherTemplate} variant="outline" className="font-sarabun">
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลดไฟล์ตัวอย่าง
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} className="font-sarabun">
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
