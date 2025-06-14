
import React from 'react';
import type { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { generateAcademicYears } from '@/utils/storage';
import { positionOptions, type TeacherFormData } from '@/schemas/teacherSchema';
import { TextInputFormField } from './form-fields/TextInputFormField';
import { SelectFormField } from './form-fields/SelectFormField';
import { DatePickerWithInput } from './form-fields/DatePickerWithInput';


interface TeacherFormProps {
  form: ReturnType<typeof useForm<TeacherFormData>>;
  isEditing: boolean;
  onSubmit: (data: TeacherFormData) => void;
  onCancel: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ form, isEditing, onSubmit, onCancel }) => {
  const academicYears = generateAcademicYears();

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return !match[2] ? match[1] : `${match[1]} ${match[2]}${match[3] ? ` ${match[3]}` : ''}`;
      }
    }
    return value.slice(0, 12);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    form.setValue('phone', formatted, { shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'แก้ไขข้อมูลครู' : 'เพิ่มข้อมูลครูใหม่'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInputFormField name="positionNumber" label="เลขตำแหน่ง" placeholder="เลขตำแหน่ง" required />
              <SelectFormField name="academicYear" label="ปีการศึกษา" placeholder="เลือกปีการศึกษา" options={academicYears} />
              <TextInputFormField name="firstName" label="ชื่อ" placeholder="ชื่อ" required />
              <TextInputFormField name="lastName" label="นามสกุล" placeholder="นามสกุล" required />
              <SelectFormField name="position" label="ตำแหน่ง" placeholder="เลือกตำแหน่ง" options={positionOptions} />
              <DatePickerWithInput name="appointmentDate" label="วันที่บรรจุ" />
              <TextInputFormField name="education" label="วุฒิการศึกษา" placeholder="วุฒิการศึกษา" />
              <TextInputFormField name="citizenId" label="เลขบัตรประชาชน" placeholder="เลขบัตรประชาชน 13 หลัก" maxLength={13} />
              <DatePickerWithInput name="birthDate" label="วัน/เดือน/ปีเกิด" />
              <TextInputFormField name="scoutLevel" label="วุฒิทางลูกเสือ" placeholder="วุฒิทางลูกเสือ" />
              <TextInputFormField name="majorSubject" label="วิชาเอก" placeholder="วิชาเอก" />
              <TextInputFormField name="salary" label="เงินเดือน" placeholder="เงินเดือน" />
              <TextInputFormField name="phone" label="เบอร์โทร" placeholder="0xx xxx xxxx" onChange={handlePhoneChange} />
              <TextInputFormField name="lineId" label="ID Line" placeholder="ID Line" />
              <TextInputFormField name="email" label="Email" type="email" placeholder="อีเมล" />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="bg-school-primary hover:bg-school-primary/90">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                ยกเลิก
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TeacherForm;
