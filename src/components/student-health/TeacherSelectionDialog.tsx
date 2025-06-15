
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface TeacherSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  onTeacherSelect: (teacher: Teacher | null) => void;
  onPrint: () => void;
}

const TeacherSelectionDialog: React.FC<TeacherSelectionDialogProps> = ({
  open,
  onOpenChange,
  teachers,
  selectedTeacher,
  onTeacherSelect,
  onPrint,
}) => {
  const handleTeacherChange = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId) || null;
    onTeacherSelect(teacher);
  };

  const handlePrint = () => {
    onPrint();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เลือกชื่อครูสำหรับรายงาน</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="teacher-select">เลือกครู</Label>
            <Select 
              value={selectedTeacher?.id || ''} 
              onValueChange={handleTeacherChange}
            >
              <SelectTrigger id="teacher-select">
                <SelectValue placeholder="เลือกชื่อครู" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} - {teacher.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedTeacher && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">ข้อมูลที่จะแสดงในรายงาน:</p>
              <div className="mt-2 text-center">
                <p>(...............................................)</p>
                <p>{selectedTeacher.firstName} {selectedTeacher.lastName}</p>
                <p>{selectedTeacher.position}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handlePrint} disabled={!selectedTeacher}>
            พิมพ์รายงาน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherSelectionDialog;
