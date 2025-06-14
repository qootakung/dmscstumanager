
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import type { Teacher } from '@/types/teacher';
import { generateAcademicYears } from '@/utils/storage';

interface TeacherFormProps {
  formData: Partial<Teacher>;
  isEditing: boolean;
  onInputChange: (field: keyof Teacher, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  formData,
  isEditing,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  const academicYears = generateAcademicYears();
  
  const positionOptions = [
    'ครูผู้ช่วย',
    'ครู ยังไม่มีวิทยฐานะ',
    'ครู วิทยฐานะครูชำนาญการ',
    'ครู วิทยฐานะครูชำนาญการพิเศษ',
    'ครู วิทยฐานะครูเชี่ยวชาญ',
    'ครู วิทยฐานะครูเชี่ยวชาญพิเศษ',
    'ผู้อำนวยการโรงเรียน',
    'นักการภารโรง',
    'ครูอัตราจ้าง',
    'เจ้าหน้าที่ธุรการ'
  ];

  const handleDateSelect = (field: 'appointmentDate' | 'birthDate', date: Date | undefined) => {
    if (date) {
      onInputChange(field, format(date, 'yyyy-MM-dd'));
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return !match[2] ? match[1] : `${match[1]} ${match[2]}${match[3] ? ` ${match[3]}` : ''}`;
      }
    }
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    onInputChange('phone', formatted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'แก้ไขข้อมูลครู' : 'เพิ่มข้อมูลครูใหม่'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* เลขตำแหน่ง */}
            <div className="space-y-2">
              <Label htmlFor="positionNumber">เลขตำแหน่ง *</Label>
              <Input
                id="positionNumber"
                type="text"
                placeholder="เลขตำแหน่ง"
                value={formData.positionNumber || ''}
                onChange={(e) => onInputChange('positionNumber', e.target.value)}
                required
              />
            </div>

            {/* ปีการศึกษา */}
            <div className="space-y-2">
              <Label htmlFor="academicYear">ปีการศึกษา</Label>
              <Select
                value={formData.academicYear || ''}
                onValueChange={(value) => onInputChange('academicYear', value)}
              >
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

            {/* ชื่อ */}
            <div className="space-y-2">
              <Label htmlFor="firstName">ชื่อ *</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="ชื่อ"
                value={formData.firstName || ''}
                onChange={(e) => onInputChange('firstName', e.target.value)}
                required
              />
            </div>

            {/* นามสกุล */}
            <div className="space-y-2">
              <Label htmlFor="lastName">นามสกุล *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="นามสกุล"
                value={formData.lastName || ''}
                onChange={(e) => onInputChange('lastName', e.target.value)}
                required
              />
            </div>

            {/* ตำแหน่ง */}
            <div className="space-y-2">
              <Label htmlFor="position">ตำแหน่ง</Label>
              <Select
                value={formData.position || ''}
                onValueChange={(value) => onInputChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* วันที่บรรจุ */}
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">วันที่บรรจุ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.appointmentDate ? format(new Date(formData.appointmentDate), 'PPP', { locale: th }) : "เลือกวันที่บรรจุ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.appointmentDate ? new Date(formData.appointmentDate) : undefined}
                    onSelect={(date) => handleDateSelect('appointmentDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* วุฒิการศึกษา */}
            <div className="space-y-2">
              <Label htmlFor="education">วุฒิการศึกษา</Label>
              <Input
                id="education"
                type="text"
                placeholder="วุฒิการศึกษา"
                value={formData.education || ''}
                onChange={(e) => onInputChange('education', e.target.value)}
              />
            </div>

            {/* เลขบัตรประชาชน */}
            <div className="space-y-2">
              <Label htmlFor="citizenId">เลขบัตรประชาชน</Label>
              <Input
                id="citizenId"
                type="text"
                placeholder="เลขบัตรประชาชน 13 หลัก"
                maxLength={13}
                value={formData.citizenId || ''}
                onChange={(e) => onInputChange('citizenId', e.target.value)}
              />
            </div>

            {/* วัน/เดือน/ปีเกิด */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">วัน/เดือน/ปีเกิด</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthDate ? format(new Date(formData.birthDate), 'PPP', { locale: th }) : "เลือกวันเกิด"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                    onSelect={(date) => handleDateSelect('birthDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* วุฒิทางลูกเสือ */}
            <div className="space-y-2">
              <Label htmlFor="scoutLevel">วุฒิทางลูกเสือ</Label>
              <Input
                id="scoutLevel"
                type="text"
                placeholder="วุฒิทางลูกเสือ"
                value={formData.scoutLevel || ''}
                onChange={(e) => onInputChange('scoutLevel', e.target.value)}
              />
            </div>

            {/* วิชาเอก */}
            <div className="space-y-2">
              <Label htmlFor="majorSubject">วิชาเอก</Label>
              <Input
                id="majorSubject"
                type="text"
                placeholder="วิชาเอก"
                value={formData.majorSubject || ''}
                onChange={(e) => onInputChange('majorSubject', e.target.value)}
              />
            </div>

            {/* เงินเดือน */}
            <div className="space-y-2">
              <Label htmlFor="salary">เงินเดือน</Label>
              <Input
                id="salary"
                type="text"
                placeholder="เงินเดือน"
                value={formData.salary || ''}
                onChange={(e) => onInputChange('salary', e.target.value)}
              />
            </div>

            {/* เบอร์โทร */}
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทร</Label>
              <Input
                id="phone"
                type="text"
                placeholder="0xx xxx xxxx"
                value={formData.phone || ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
            </div>

            {/* ID Line */}
            <div className="space-y-2">
              <Label htmlFor="lineId">ID Line</Label>
              <Input
                id="lineId"
                type="text"
                placeholder="ID Line"
                value={formData.lineId || ''}
                onChange={(e) => onInputChange('lineId', e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="อีเมล"
                value={formData.email || ''}
                onChange={(e) => onInputChange('email', e.target.value)}
              />
            </div>
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
      </CardContent>
    </Card>
  );
};

export default TeacherForm;
