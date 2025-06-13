
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { gradeOptions, generateAcademicYears } from '@/utils/storage';
import { Plus } from 'lucide-react';
import type { Student } from '@/types/student';

interface StudentFormProps {
  formData: Partial<Student>;
  isEditing: boolean;
  onInputChange: (field: keyof Student, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  isEditing,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  const academicYears = generateAcademicYears();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มข้อมูลนักเรียนใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="academicYear">ปีการศึกษา</Label>
              <Select value={formData.academicYear} onValueChange={(value) => onInputChange('academicYear', value)}>
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
              <Select value={formData.grade} onValueChange={(value) => onInputChange('grade', value)}>
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
              <Select value={formData.gender} onValueChange={(value) => onInputChange('gender', value as 'ชาย' | 'หญิง')}>
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
                onChange={(e) => onInputChange('citizenId', e.target.value)}
                placeholder="กรุณาใส่เลขประจำตัวประชาชน"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="studentId">รหัสนักเรียน *</Label>
              <Input
                id="studentId"
                value={formData.studentId || ''}
                onChange={(e) => onInputChange('studentId', e.target.value)}
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
                  onChange={(e) => onInputChange('titleTh', e.target.value)}
                  placeholder="เด็กชาย/เด็กหญิง"
                />
              </div>
              
              <div>
                <Label htmlFor="firstNameTh">ชื่อ (ไทย) *</Label>
                <Input
                  id="firstNameTh"
                  value={formData.firstNameTh || ''}
                  onChange={(e) => onInputChange('firstNameTh', e.target.value)}
                  placeholder="กรุณาใส่ชื่อ"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastNameTh">นามสกุล (ไทย) *</Label>
                <Input
                  id="lastNameTh"
                  value={formData.lastNameTh || ''}
                  onChange={(e) => onInputChange('lastNameTh', e.target.value)}
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
                  onChange={(e) => onInputChange('birthDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="firstNameEn">ชื่อ (อังกฤษ)</Label>
                <Input
                  id="firstNameEn"
                  value={formData.firstNameEn || ''}
                  onChange={(e) => onInputChange('firstNameEn', e.target.value)}
                  placeholder="First Name"
                />
              </div>
              
              <div>
                <Label htmlFor="lastNameEn">นามสกุล (อังกฤษ)</Label>
                <Input
                  id="lastNameEn"
                  value={formData.lastNameEn || ''}
                  onChange={(e) => onInputChange('lastNameEn', e.target.value)}
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
                  onChange={(e) => onInputChange('fatherTitle', e.target.value)}
                  placeholder="นาย"
                />
              </div>
              
              <div>
                <Label htmlFor="fatherFirstName">ชื่อบิดา</Label>
                <Input
                  id="fatherFirstName"
                  value={formData.fatherFirstName || ''}
                  onChange={(e) => onInputChange('fatherFirstName', e.target.value)}
                  placeholder="กรุณาใส่ชื่อบิดา"
                />
              </div>
              
              <div>
                <Label htmlFor="fatherLastName">นามสกุลบิดา</Label>
                <Input
                  id="fatherLastName"
                  value={formData.fatherLastName || ''}
                  onChange={(e) => onInputChange('fatherLastName', e.target.value)}
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
                  onChange={(e) => onInputChange('motherTitle', e.target.value)}
                  placeholder="นาง/นางสาว"
                />
              </div>
              
              <div>
                <Label htmlFor="motherFirstName">ชื่อมารดา</Label>
                <Input
                  id="motherFirstName"
                  value={formData.motherFirstName || ''}
                  onChange={(e) => onInputChange('motherFirstName', e.target.value)}
                  placeholder="กรุณาใส่ชื่อมารดา"
                />
              </div>
              
              <div>
                <Label htmlFor="motherLastName">นามสกุลมารดา</Label>
                <Input
                  id="motherLastName"
                  value={formData.motherLastName || ''}
                  onChange={(e) => onInputChange('motherLastName', e.target.value)}
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
                  onChange={(e) => onInputChange('guardianTitle', e.target.value)}
                  placeholder="นาย/นาง/นางสาว"
                />
              </div>
              
              <div>
                <Label htmlFor="guardianFirstName">ชื่อผู้ปกครอง</Label>
                <Input
                  id="guardianFirstName"
                  value={formData.guardianFirstName || ''}
                  onChange={(e) => onInputChange('guardianFirstName', e.target.value)}
                  placeholder="กรุณาใส่ชื่อผู้ปกครอง"
                />
              </div>
              
              <div>
                <Label htmlFor="guardianLastName">นามสกุลผู้ปกครอง</Label>
                <Input
                  id="guardianLastName"
                  value={formData.guardianLastName || ''}
                  onChange={(e) => onInputChange('guardianLastName', e.target.value)}
                  placeholder="กรุณาใส่นามสกุลผู้ปกครอง"
                />
              </div>
              
              <div>
                <Label htmlFor="guardianPhone">เบอร์โทรศัพท์ผู้ปกครอง</Label>
                <Input
                  id="guardianPhone"
                  value={formData.guardianPhone || ''}
                  onChange={(e) => onInputChange('guardianPhone', e.target.value)}
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
                  onChange={(e) => onInputChange('houseNumber', e.target.value)}
                  placeholder="กรุณาใส่เลขที่บ้าน"
                />
              </div>
              
              <div>
                <Label htmlFor="moo">หมู่</Label>
                <Input
                  id="moo"
                  value={formData.moo || ''}
                  onChange={(e) => onInputChange('moo', e.target.value)}
                  placeholder="กรุณาใส่หมู่"
                />
              </div>
              
              <div>
                <Label htmlFor="subDistrict">ตำบล</Label>
                <Input
                  id="subDistrict"
                  value={formData.subDistrict || ''}
                  onChange={(e) => onInputChange('subDistrict', e.target.value)}
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
                  onChange={(e) => onInputChange('district', e.target.value)}
                  placeholder="กรุณาใส่อำเภอ"
                />
              </div>
              
              <div>
                <Label htmlFor="province">จังหวัด</Label>
                <Input
                  id="province"
                  value={formData.province || ''}
                  onChange={(e) => onInputChange('province', e.target.value)}
                  placeholder="กรุณาใส่จังหวัด"
                />
              </div>
              
              <div>
                <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode || ''}
                  onChange={(e) => onInputChange('postalCode', e.target.value)}
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
              <Button type="button" variant="outline" onClick={onCancel}>
                ยกเลิก
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentForm;
