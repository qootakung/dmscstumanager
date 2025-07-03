
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, UserPlus } from 'lucide-react';
import type { Student } from '@/types/student';
import { getAllStudents } from '@/utils/storage';

interface StudentSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStudentsSelected: (students: Student[]) => void;
  selectedStudents: Student[];
  selectedGrade?: string;
}

const StudentSelectionDialog: React.FC<StudentSelectionDialogProps> = ({
  isOpen,
  onOpenChange,
  onStudentsSelected,
  selectedStudents,
  selectedGrade
}) => {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [tempSelectedStudents, setTempSelectedStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>(selectedGrade || 'all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');

  const grades = ['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3'];
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const students = await getAllStudents();
        setAllStudents(students);
      } catch (error) {
        console.error("Error loading students:", error);
      }
    };
    
    if (isOpen) {
      loadStudents();
      setTempSelectedStudents(selectedStudents);
    }
  }, [isOpen, selectedStudents]);

  useEffect(() => {
    let filtered = allStudents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student => {
        const fullName = `${student.titleTh || ''} ${student.firstNameTh} ${student.lastNameTh}`.toLowerCase();
        const studentId = student.studentId?.toLowerCase() || '';
        const citizenId = student.citizenId?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || 
               studentId.includes(search) || 
               citizenId.includes(search);
      });
    }

    // Filter by grade
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(student => student.grade === gradeFilter);
    }

    // Filter by academic year
    if (academicYearFilter !== 'all') {
      filtered = filtered.filter(student => student.academicYear === academicYearFilter);
    }

    // Sort by grade and student ID
    filtered.sort((a, b) => {
      const gradeOrder = grades.indexOf(a.grade || '');
      const gradeOrderB = grades.indexOf(b.grade || '');
      if (gradeOrder !== gradeOrderB) {
        return gradeOrder - gradeOrderB;
      }
      return (a.studentId || '').localeCompare(b.studentId || '');
    });

    setFilteredStudents(filtered);
  }, [allStudents, searchTerm, gradeFilter, academicYearFilter]);

  const handleStudentToggle = (student: Student) => {
    const isSelected = tempSelectedStudents.some(s => s.id === student.id);
    if (isSelected) {
      setTempSelectedStudents(prev => prev.filter(s => s.id !== student.id));
    } else {
      setTempSelectedStudents(prev => [...prev, student]);
    }
  };

  const handleSelectAll = () => {
    setTempSelectedStudents(filteredStudents);
  };

  const handleDeselectAll = () => {
    setTempSelectedStudents([]);
  };

  const handleConfirm = () => {
    onStudentsSelected(tempSelectedStudents);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelectedStudents(selectedStudents);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            เลือกนักเรียนเพิ่มเติม
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อ, รหัสนักเรียน, เลขบัตรประชาชน"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกระดับชั้น" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกระดับชั้น</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกปีการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกปีการศึกษา</SelectItem>
                {academicYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                เลือกทั้งหมด
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                ยกเลิกการเลือก
              </Button>
            </div>
          </div>

          {/* Selected count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            เลือกแล้ว: {tempSelectedStudents.length} คน
          </div>

          {/* Student List */}
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบข้อมูลนักเรียนตามเงื่อนไขที่ค้นหา
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredStudents.map((student) => {
                    const isSelected = tempSelectedStudents.some(s => s.id === student.id);
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                        }`}
                        onClick={() => handleStudentToggle(student)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleStudentToggle(student)}
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                          <div className="font-medium">
                            {student.titleTh || ''} {student.firstNameTh} {student.lastNameTh}
                          </div>
                          <div className="text-gray-600">
                            รหัส: {student.studentId || 'N/A'}
                          </div>
                          <div className="text-gray-600">
                            ชั้น: {student.grade || 'N/A'}
                          </div>
                          <div className="text-gray-600">
                            ปี: {student.academicYear || 'N/A'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirm}>
            ยืนยันการเลือก ({tempSelectedStudents.length} คน)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSelectionDialog;
