
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, UserPlus, Plus, Trash2 } from 'lucide-react';
import { SubjectInfo } from './types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SubjectInfoTableProps {
  subjects: SubjectInfo[];
  onUpdateSubject: (id: string, updates: Partial<SubjectInfo>) => void;
  onSelectTeacher: (subjectId: string) => void;
  onAddSubject?: (subject: SubjectInfo) => void;
  onRemoveSubject?: (subjectId: string) => void;
}

const SubjectInfoTable: React.FC<SubjectInfoTableProps> = ({
  subjects,
  onUpdateSubject,
  onSelectTeacher,
  onAddSubject,
  onRemoveSubject,
}) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    shortName: '',
    code: '',
    subjectCode: '',
    hoursPerWeek: 1,
    hoursPerYear: 40,
    passingCriteria: 50,
    learningOutcomes: 8, // จำนวนผลการเรียนรู้
  });

  const coreSubjects = subjects.filter(s => s.category === 'core');
  const electiveSubjects = subjects.filter(s => s.category === 'elective');
  const activitySubjects = subjects.filter(s => s.category === 'activity');

  // Check if subject is a custom (user-added) elective
  const isCustomElective = (id: string) => id.startsWith('custom-elective-');

  const handleAddElective = () => {
    if (!newSubject.name.trim()) {
      toast.error('กรุณากรอกชื่อวิชา');
      return;
    }
    const id = `custom-elective-${Date.now()}`;
    const subject: SubjectInfo = {
      id,
      code: newSubject.code || 'พ',
      name: newSubject.name,
      shortName: newSubject.shortName || newSubject.name,
      hoursPerWeek: newSubject.hoursPerWeek,
      hoursPerYear: newSubject.hoursPerYear,
      passingCriteria: newSubject.passingCriteria,
      teacherId: '',
      teacherName: '',
      subjectCode: newSubject.subjectCode,
      endTermRatio: 0,
      midTermRatio: 0,
      category: 'elective',
    };
    onAddSubject?.(subject);
    setAddDialogOpen(false);
    setNewSubject({
      name: '',
      shortName: '',
      code: '',
      subjectCode: '',
      hoursPerWeek: 1,
      hoursPerYear: 40,
      passingCriteria: 50,
      learningOutcomes: 8,
    });
    toast.success(`เพิ่มวิชา "${newSubject.name}" แล้ว`);
  };

  const handleRemoveElective = (id: string, name: string) => {
    if (confirm(`ต้องการลบวิชา "${name}" หรือไม่?`)) {
      onRemoveSubject?.(id);
      toast.success(`ลบวิชา "${name}" แล้ว`);
    }
  };

  const renderSubjectRow = (subject: SubjectInfo, bgColor: string, textColor: string) => (
    <tr key={subject.id} className="hover:bg-gray-50">
      <td className={`border border-gray-300 px-2 py-1.5 text-center ${bgColor} ${textColor} font-medium`}>
        {subject.code}
      </td>
      <td className={`border border-gray-300 px-3 py-1.5 ${bgColor} ${textColor}`}>
        {isCustomElective(subject.id) ? (
          <div className="flex items-center gap-1">
            <Input
              value={subject.name}
              onChange={(e) => onUpdateSubject(subject.id, { name: e.target.value, shortName: e.target.value })}
              className="h-7 text-sm flex-1 border-orange-300"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleRemoveElective(subject.id, subject.name)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          subject.name
        )}
      </td>
      <td className="border border-gray-300 px-2 py-1.5 text-center bg-white">
        <Input 
          type="number" 
          value={subject.hoursPerWeek}
          onChange={(e) => onUpdateSubject(subject.id, { hoursPerWeek: parseInt(e.target.value) || 0 })}
          className="w-16 h-7 text-center mx-auto text-sm"
        />
      </td>
      <td className="border border-gray-300 px-2 py-1.5 text-center bg-white">
        <Input 
          type="number" 
          value={subject.hoursPerYear}
          onChange={(e) => onUpdateSubject(subject.id, { hoursPerYear: parseInt(e.target.value) || 0 })}
          className="w-16 h-7 text-center mx-auto text-sm"
        />
      </td>
      <td className="border border-gray-300 px-2 py-1.5 text-center bg-white">
        <Input 
          type="number" 
          value={subject.passingCriteria}
          onChange={(e) => onUpdateSubject(subject.id, { passingCriteria: parseInt(e.target.value) || 0 })}
          className="w-16 h-7 text-center mx-auto text-sm"
        />
      </td>
      <td className="border border-gray-300 px-2 py-1.5 bg-white">
        <div className="flex items-center gap-1">
          <Input 
            value={subject.teacherName}
            onChange={(e) => onUpdateSubject(subject.id, { teacherName: e.target.value })}
            className="h-7 text-sm flex-1"
            placeholder="เลือกครูผู้สอน"
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 shrink-0"
            onClick={() => onSelectTeacher(subject.id)}
          >
            <UserPlus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
      <td className="border border-gray-300 px-2 py-1.5 text-center bg-white">
        <Input 
          value={subject.subjectCode}
          onChange={(e) => onUpdateSubject(subject.id, { subjectCode: e.target.value })}
          className="w-20 h-7 text-center mx-auto text-sm"
        />
      </td>
      <td className="border border-gray-300 px-2 py-1.5 text-center bg-white">
        <Input 
          type="number" 
          value={subject.endTermRatio}
          onChange={(e) => onUpdateSubject(subject.id, { endTermRatio: parseInt(e.target.value) || 0 })}
          className="w-16 h-7 text-center mx-auto text-sm"
        />
      </td>
      <td className="border border-gray-300 px-2 py-1.5 text-center bg-white">
        <Input 
          type="number" 
          value={subject.midTermRatio}
          onChange={(e) => onUpdateSubject(subject.id, { midTermRatio: parseInt(e.target.value) || 0 })}
          className="w-16 h-7 text-center mx-auto text-sm"
        />
      </td>
    </tr>
  );

  const renderSummaryRow = (label: string, subjects: SubjectInfo[], bgColor: string) => {
    const totalWeek = subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0);
    const totalYear = subjects.reduce((sum, s) => sum + s.hoursPerYear, 0);
    return (
      <tr className={bgColor}>
        <td colSpan={2} className="border border-gray-300 px-3 py-2 font-bold text-right">
          {label}
        </td>
        <td className="border border-gray-300 px-2 py-2 text-center font-bold">{totalWeek}</td>
        <td className="border border-gray-300 px-2 py-2 text-center font-bold">{totalYear}</td>
        <td colSpan={3} className="border border-gray-300 px-2 py-2 text-center text-muted-foreground">
          ชั่วโมง/ปี
        </td>
        <td colSpan={2} className="border border-gray-300"></td>
      </tr>
    );
  };

  return (
    <>
      <Card className="border-2 border-cyan-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            ข้อมูลวิชาเรียน
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-blue-300 px-2 py-2 text-blue-700" rowSpan={2}></th>
                <th className="border border-blue-300 px-3 py-2 text-blue-700" rowSpan={2}>กลุ่มสาระการเรียนรู้</th>
                <th className="border border-blue-300 px-2 py-2 text-blue-700">ชั่วโมง/</th>
                <th className="border border-blue-300 px-2 py-2 text-blue-700">ชั่วโมง/ปี</th>
                <th className="border border-blue-300 px-2 py-2 text-blue-700">เกณฑ์การผ่าน</th>
                <th className="border border-blue-300 px-3 py-2 text-blue-700" rowSpan={2}>ชื่อครูผู้สอน</th>
                <th className="border border-blue-300 px-2 py-2 text-blue-700" rowSpan={2}>รหัสวิชา</th>
                <th className="border border-blue-300 px-2 py-2 text-blue-700">สัดส่วน</th>
                <th className="border border-blue-300 px-2 py-2 text-blue-700">สัดส่วนข้อสอบ</th>
              </tr>
              <tr className="bg-blue-50">
                <th className="border border-blue-300 px-2 py-1 text-blue-600 text-xs">สัปดาห์</th>
                <th className="border border-blue-300 px-2 py-1 text-blue-600 text-xs"></th>
                <th className="border border-blue-300 px-2 py-1 text-blue-600 text-xs">ตัวชี้วัด(ร้อยละ)</th>
                <th className="border border-blue-300 px-2 py-1 text-blue-600 text-xs">ข้อสอบปลายปี</th>
                <th className="border border-blue-300 px-2 py-1 text-blue-600 text-xs">มาตรฐานกลาง</th>
              </tr>
            </thead>
            <tbody>
              {/* Core Subjects Header */}
              <tr className="bg-green-100">
                <td colSpan={9} className="border border-gray-300 px-3 py-2 font-bold text-green-700">
                  สาระการเรียนรู้พื้นฐาน
                </td>
              </tr>
              {coreSubjects.map((subject) => renderSubjectRow(subject, 'bg-green-50', 'text-green-700'))}
              {renderSummaryRow('รวมวิชาพื้นฐาน', coreSubjects, 'bg-green-100')}

              {/* Elective Subjects Header */}
              <tr className="bg-orange-100">
                <td colSpan={9} className="border border-gray-300 px-3 py-2 font-bold text-orange-700">
                  <div className="flex items-center justify-between">
                    <span>สาระการเรียนรู้เพิ่มเติม</span>
                    {onAddSubject && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-200"
                        onClick={() => setAddDialogOpen(true)}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        เพิ่มวิชาเพิ่มเติม
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
              {electiveSubjects.map((subject) => renderSubjectRow(subject, 'bg-orange-50', 'text-orange-700'))}
              {renderSummaryRow('รวมวิชาเพิ่มเติม', electiveSubjects, 'bg-orange-100')}

              {/* Activity Subjects Header */}
              <tr className="bg-purple-100">
                <td colSpan={9} className="border border-gray-300 px-3 py-2 font-bold text-purple-700">
                  กิจกรรมพัฒนาผู้เรียน
                </td>
              </tr>
              {activitySubjects.map((subject) => renderSubjectRow(subject, 'bg-purple-50', 'text-purple-700'))}
              {renderSummaryRow('รวมกิจกรรมพัฒนาผู้เรียน', activitySubjects, 'bg-purple-100')}

              {/* Grand Total */}
              <tr className="bg-cyan-200">
                <td colSpan={2} className="border border-gray-300 px-3 py-2 font-bold text-cyan-800 text-right">
                  รวมทั้งหมด
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center font-bold text-cyan-800">
                  {subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0)}
                </td>
                <td className="border border-gray-300 px-2 py-2 text-center font-bold text-cyan-800">
                  {subjects.reduce((sum, s) => sum + s.hoursPerYear, 0)}
                </td>
                <td colSpan={3} className="border border-gray-300 px-2 py-2 text-center font-bold text-cyan-800">
                  ชั่วโมง/ปี
                </td>
                <td colSpan={2} className="border border-gray-300"></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Elective Subject Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <Plus className="w-5 h-5" />
              เพิ่มวิชาเพิ่มเติม
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-medium">ชื่อวิชา <span className="text-red-500">*</span></Label>
              <Input
                value={newSubject.name}
                onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value, shortName: e.target.value }))}
                placeholder="เช่น ภาษาจีน, คอมพิวเตอร์"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">รหัสวิชา</Label>
                <Input
                  value={newSubject.subjectCode}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, subjectCode: e.target.value }))}
                  placeholder="เช่น จ11201"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">รหัสกลุ่มสาระ</Label>
                <Input
                  value={newSubject.code}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="เช่น จ, ว"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">ชั่วโมง/สัปดาห์</Label>
                <Input
                  type="number"
                  value={newSubject.hoursPerWeek}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, hoursPerWeek: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">ชั่วโมง/ปี</Label>
                <Input
                  type="number"
                  value={newSubject.hoursPerYear}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, hoursPerYear: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">เกณฑ์ผ่าน(%)</Label>
                <Input
                  type="number"
                  value={newSubject.passingCriteria}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, passingCriteria: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">จำนวนผลการเรียนรู้ (ตัวชี้วัด)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={newSubject.learningOutcomes}
                onChange={(e) => setNewSubject(prev => ({ ...prev, learningOutcomes: parseInt(e.target.value) || 1 }))}
                placeholder="จำนวนผลการเรียนรู้"
              />
              <p className="text-xs text-muted-foreground">ระบุจำนวนผลการเรียนรู้ที่ใช้ในการกรอกคะแนน</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleAddElective} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-1" />
              เพิ่มวิชา
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubjectInfoTable;
