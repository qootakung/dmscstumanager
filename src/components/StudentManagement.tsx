import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStudents, addStudent, updateStudent, deleteStudent, gradeOptions, generateAcademicYears } from '@/utils/storage';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import type { Student } from '@/types/student';
import Swal from 'sweetalert2';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({
    academicYear: '2568',
    grade: 'อ.1',
    gender: 'ชาย'
  });

  const academicYears = generateAcademicYears();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const studentData = getStudents();
    setStudents(studentData);
  };

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
        updateStudent(selectedStudent.id, formData);
        await Swal.fire({
          title: 'แก้ไขข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        addStudent(formData as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>);
        await Swal.fire({
          title: 'เพิ่มข้อมูลสำเร็จ!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
      loadStudents();
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
      deleteStudent(student.id);
      loadStudents();
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

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">เพิ่ม/แก้ไขข้อมูล</TabsTrigger>
          <TabsTrigger value="list">รายชื่อนักเรียน</TabsTrigger>
          <TabsTrigger value="import">นำเข้าข้อมูล</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มข้อมูลนักเรียนใหม่'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="academicYear">ปีการศึกษา</Label>
                    <Select value={formData.academicYear} onValueChange={(value) => handleInputChange('academicYear', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกปีการศึกษา" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="grade">ระดับชั้น</Label>
                    <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับชั้น" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map(grade => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="gender">เพศ</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value as 'ชาย' | 'หญิง')}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ชาย">ชาย</SelectItem>
                        <SelectItem value="หญิง">หญิง</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="citizenId">เลขประจำตัวประชาชน *</Label>
                    <Input
                      id="citizenId"
                      value={formData.citizenId || ''}
                      onChange={(e) => handleInputChange('citizenId', e.target.value)}
                      placeholder="กรุณาใส่เลขประจำตัวประชาชน"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="studentId">รหัสนักเรียน *</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId || ''}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      placeholder="กรุณาใส่รหัสนักเรียน"
                      required
                    />
                  </div>
                </div>

                {/* Name Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-school-primary">ข้อมูลชื่อ-นามสกุล</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="titleTh">คำนำหน้าชื่อ</Label>
                      <Input
                        id="titleTh"
                        value={formData.titleTh || ''}
                        onChange={(e) => handleInputChange('titleTh', e.target.value)}
                        placeholder="เด็กชาย/เด็กหญิง"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="firstNameTh">ชื่อ (ไทย) *</Label>
                      <Input
                        id="firstNameTh"
                        value={formData.firstNameTh || ''}
                        onChange={(e) => handleInputChange('firstNameTh', e.target.value)}
                        placeholder="กรุณาใส่ชื่อ"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lastNameTh">นามสกุล (ไทย) *</Label>
                      <Input
                        id="lastNameTh"
                        value={formData.lastNameTh || ''}
                        onChange={(e) => handleInputChange('lastNameTh', e.target.value)}
                        placeholder="กรุณาใส่นามสกุล"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="birthDate">วันเกิด</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate || ''}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="firstNameEn">ชื่อ (อังกฤษ)</Label>
                      <Input
                        id="firstNameEn"
                        value={formData.firstNameEn || ''}
                        onChange={(e) => handleInputChange('firstNameEn', e.target.value)}
                        placeholder="First Name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lastNameEn">นามสกุล (อังกฤษ)</Label>
                      <Input
                        id="lastNameEn"
                        value={formData.lastNameEn || ''}
                        onChange={(e) => handleInputChange('lastNameEn', e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Parents Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-school-primary">ข้อมูลบิดา-มารดา</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fatherTitle">คำนำหน้าชื่อบิดา</Label>
                      <Input
                        id="fatherTitle"
                        value={formData.fatherTitle || ''}
                        onChange={(e) => handleInputChange('fatherTitle', e.target.value)}
                        placeholder="นาย"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fatherFirstName">ชื่อบิดา</Label>
                      <Input
                        id="fatherFirstName"
                        value={formData.fatherFirstName || ''}
                        onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
                        placeholder="กรุณาใส่ชื่อบิดา"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fatherLastName">นามสกุลบิดา</Label>
                      <Input
                        id="fatherLastName"
                        value={formData.fatherLastName || ''}
                        onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
                        placeholder="กรุณาใส่นามสกุลบิดา"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="motherTitle">คำนำหน้าชื่อมารดา</Label>
                      <Input
                        id="motherTitle"
                        value={formData.motherTitle || ''}
                        onChange={(e) => handleInputChange('motherTitle', e.target.value)}
                        placeholder="นาง/นางสาว"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="motherFirstName">ชื่อมารดา</Label>
                      <Input
                        id="motherFirstName"
                        value={formData.motherFirstName || ''}
                        onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                        placeholder="กรุณาใส่ชื่อมารดา"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="motherLastName">นามสกุลมารดา</Label>
                      <Input
                        id="motherLastName"
                        value={formData.motherLastName || ''}
                        onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                        placeholder="กรุณาใส่นามสกุลมารดา"
                      />
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-school-primary">ข้อมูลผู้ปกครอง</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="guardianTitle">คำนำหน้าชื่อผู้ปกครอง</Label>
                      <Input
                        id="guardianTitle"
                        value={formData.guardianTitle || ''}
                        onChange={(e) => handleInputChange('guardianTitle', e.target.value)}
                        placeholder="นาย/นาง/นางสาว"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="guardianFirstName">ชื่อผู้ปกครอง</Label>
                      <Input
                        id="guardianFirstName"
                        value={formData.guardianFirstName || ''}
                        onChange={(e) => handleInputChange('guardianFirstName', e.target.value)}
                        placeholder="กรุณาใส่ชื่อผู้ปกครอง"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="guardianLastName">นามสกุลผู้ปกครอง</Label>
                      <Input
                        id="guardianLastName"
                        value={formData.guardianLastName || ''}
                        onChange={(e) => handleInputChange('guardianLastName', e.target.value)}
                        placeholder="กรุณาใส่นามสกุลผู้ปกครอง"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="guardianPhone">เบอร์โทรศัพท์ผู้ปกครอง</Label>
                      <Input
                        id="guardianPhone"
                        value={formData.guardianPhone || ''}
                        onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                        placeholder="กรุณาใส่เบอร์โทรศัพท์"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-school-primary">ที่อยู่ปัจจุบัน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="houseNumber">เลขที่บ้าน</Label>
                      <Input
                        id="houseNumber"
                        value={formData.houseNumber || ''}
                        onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                        placeholder="กรุณาใส่เลขที่บ้าน"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="moo">หมู่</Label>
                      <Input
                        id="moo"
                        value={formData.moo || ''}
                        onChange={(e) => handleInputChange('moo', e.target.value)}
                        placeholder="กรุณาใส่หมู่"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="subDistrict">ตำบล</Label>
                      <Input
                        id="subDistrict"
                        value={formData.subDistrict || ''}
                        onChange={(e) => handleInputChange('subDistrict', e.target.value)}
                        placeholder="กรุณาใส่ตำบล"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="district">อำเภอ</Label>
                      <Input
                        id="district"
                        value={formData.district || ''}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        placeholder="กรุณาใส่อำเภอ"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="province">จังหวัด</Label>
                      <Input
                        id="province"
                        value={formData.province || ''}
                        onChange={(e) => handleInputChange('province', e.target.value)}
                        placeholder="กรุณาใส่จังหวัด"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode || ''}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="กรุณาใส่รหัสไปรษณีย์"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-school-primary hover:bg-school-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}
                  </Button>
                  
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      ยกเลิก
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
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
                              onClick={() => handleEdit(student)}
                              className="text-school-primary border-school-primary hover:bg-school-primary hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(student)}
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
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>นำเข้าข้อมูลจากไฟล์ Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลนักเรียนจำนวนมาก
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-600 mb-2">
                    คลิกหรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-sm text-gray-500">
                    รองรับไฟล์ .xlsx และ .xls เท่านั้น
                  </p>
                  <Button className="mt-4" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    เลือกไฟล์
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentManagement;
