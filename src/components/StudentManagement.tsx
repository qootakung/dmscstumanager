
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStudents, addStudent, updateStudent, deleteStudent } from '@/utils/storage';
import type { Student } from '@/types/student';
import Swal from 'sweetalert2';
import StudentForm from './student/StudentForm';
import StudentList from './student/StudentList';
import StudentImport from './student/StudentImport';

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-school-primary mb-2">
          จัดการข้อมูลนักเรียน
        </h2>
        <p className="text-muted-foreground">
          เพิ่ม แก้ไข และจัดการข้อมูลนักเรียนทั้งหมด
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">เพิ่ม/แก้ไขข้อมูล</TabsTrigger>
          <TabsTrigger value="list">รายชื่อนักเรียน</TabsTrigger>
          <TabsTrigger value="import">นำเข้าข้อมูล</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <StudentForm
            formData={formData}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <StudentList
            students={students}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <StudentImport onImportSuccess={loadStudents} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentManagement;
