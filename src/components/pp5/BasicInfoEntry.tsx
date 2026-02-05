
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  School, 
  Calendar, 
  BookOpen, 
  Building, 
  Save,
  UserPlus,
  Edit3,
  ArrowLeft
} from 'lucide-react';
import { generateAcademicYears } from '@/utils/data';
import { getTeachers } from '@/utils/teacherStorage';
import type { Teacher } from '@/types/teacher';
import TeacherSelectDialog from './TeacherSelectDialog';
import SubjectInfoTable from './SubjectInfoTable';
import { 
  PP5BasicInfo, 
  SubjectInfo, 
  DEFAULT_CALENDAR,
  AcademicCalendar,
  GRADE_LEVEL_OPTIONS,
  getDefaultSubjectsForGrade
} from './types';
import { toast } from 'sonner';

interface BasicInfoEntryProps {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack?: () => void;
}

const BasicInfoEntry: React.FC<BasicInfoEntryProps> = ({
  selectedGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  // Extract grade number from selectedGrade (e.g., "ป.1" -> "1")
  const getGradeNumber = (grade: string) => grade.replace('ป.', '');

  const makeStorageKey = (gradeLevel: string, academicYear: string, semester: string) =>
    `pp5-basic-ป.${gradeLevel}-${academicYear}-${semester}`;

  const buildDefaultBasicInfo = (gradeLevel: string, semester: string, academicYear: string): PP5BasicInfo => ({
    gradeLevel,
    semester,
    room: '',
    academicYear,
    approvalDate: '',
    homeTeacher1: '',
    homeTeacher2: '',
    schoolName: 'บ้านดอนมูล',
    subDistrict: 'บ้านปวง',
    district: 'ทุ่งหัวช้าง',
    province: 'ลำพูน',
    educationCenter: '',
    primaryEducationArea: 'ลำพูน เขต 2',
    supervisor: '',
    assessmentEvaluator: '',
    academicHead: '',
    administratorName: '',
    administratorPosition: 'ผู้อำนวยการโรงเรียนบ้านดอนมูล',
  });
  
  const [basicInfo, setBasicInfo] = useState<PP5BasicInfo>(() =>
    buildDefaultBasicInfo(getGradeNumber(selectedGrade), selectedSemester, selectedAcademicYear)
  );

  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [calendar] = useState<AcademicCalendar>(DEFAULT_CALENDAR);
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [currentTeacherField, setCurrentTeacherField] = useState<string>('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const loadOrInitializeForContext = (gradeLevel: string, academicYear: string, semester: string) => {
    const storageKey = makeStorageKey(gradeLevel, academicYear, semester);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const data = JSON.parse(saved);

        const nextBasicInfo: PP5BasicInfo = {
          ...buildDefaultBasicInfo(gradeLevel, semester, academicYear),
          ...(data.basicInfo ?? {}),
          // lock context to the key we loaded
          gradeLevel,
          semester,
          academicYear,
        };

        setBasicInfo(nextBasicInfo);

        if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
          setSubjects(data.subjects);
        } else {
          initializeSubjects(gradeLevel);
        }
        return true;
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }

    // no saved data
    setBasicInfo(buildDefaultBasicInfo(gradeLevel, semester, academicYear));
    initializeSubjects(gradeLevel);
    return false;
  };

  useEffect(() => {
    loadTeachers();

    const gradeLevel = getGradeNumber(selectedGrade);
    loadOrInitializeForContext(gradeLevel, selectedAcademicYear, selectedSemester);
  }, [selectedGrade, selectedSemester, selectedAcademicYear]);

  const loadTeachers = async () => {
    const data = await getTeachers();
    setTeachers(data);
    
    // Auto-fill administrator
    const principal = data.find(t => t.position === 'ผู้อำนวยการโรงเรียน');
    if (principal) {
      setBasicInfo(prev => ({
        ...prev,
        // don't overwrite user's saved/typed value
        administratorName: prev.administratorName || `${principal.firstName} ${principal.lastName}`,
      }));
    }
  };

  const initializeSubjects = (gradeLevel: string) => {
    const gradeSubjects = getDefaultSubjectsForGrade(gradeLevel);
    const initialSubjects: SubjectInfo[] = gradeSubjects.map(subject => ({
      ...subject,
      teacherId: '',
      teacherName: '',
    }));
    setSubjects(initialSubjects);
  };
  
  const handleGradeLevelChange = (newGradeLevel: string) => {
    const loaded = loadOrInitializeForContext(newGradeLevel, basicInfo.academicYear, basicInfo.semester);
    if (loaded) toast.success(`โหลดข้อมูลที่บันทึกไว้ของประถมศึกษาปีที่ ${newGradeLevel}`);
    else toast.info(`ประถมศึกษาปีที่ ${newGradeLevel}: ยังไม่มีข้อมูลบันทึก`);
  };

  const handleSemesterChange = (newSemester: string) => {
    const loaded = loadOrInitializeForContext(basicInfo.gradeLevel, basicInfo.academicYear, newSemester);
    if (loaded) toast.success(`โหลดข้อมูล ภาคเรียนที่ ${newSemester}`);
    else toast.info(`ภาคเรียนที่ ${newSemester}: ยังไม่มีข้อมูลบันทึก`);
  };

  const handleAcademicYearChange = (newAcademicYear: string) => {
    const loaded = loadOrInitializeForContext(basicInfo.gradeLevel, newAcademicYear, basicInfo.semester);
    if (loaded) toast.success(`โหลดข้อมูล ปีการศึกษา ${newAcademicYear}`);
    else toast.info(`ปีการศึกษา ${newAcademicYear}: ยังไม่มีข้อมูลบันทึก`);
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`;
    
    if (currentTeacherField.startsWith('subject-')) {
      const subjectId = currentTeacherField.replace('subject-', '');
      setSubjects(prev => prev.map(s => 
        s.id === subjectId 
          ? { ...s, teacherId: teacher.id, teacherName: fullName }
          : s
      ));
    } else {
      setBasicInfo(prev => ({
        ...prev,
        [currentTeacherField]: fullName,
      }));
    }
  };

  const openTeacherDialog = (fieldName: string) => {
    setCurrentTeacherField(fieldName);
    setTeacherDialogOpen(true);
  };

  const handleSave = () => {
    // Save to localStorage for now
    const storageKey = makeStorageKey(basicInfo.gradeLevel, basicInfo.academicYear, basicInfo.semester);
    const data = {
      basicInfo,
      subjects,
      calendar,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    toast.success(`บันทึกข้อมูลพื้นฐานแล้ว (ป.${basicInfo.gradeLevel}/${basicInfo.academicYear}/ภาค ${basicInfo.semester})`);
  };

  const updateSubject = (id: string, updates: Partial<SubjectInfo>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Edit3 className="w-6 h-6" />
              กรอกข้อมูลพื้นฐาน ปพ.5
            </h2>
            <p className="text-muted-foreground">
                ประถมศึกษาปีที่ {basicInfo.gradeLevel} ภาคเรียนที่ {basicInfo.semester} ปีการศึกษา {basicInfo.academicYear}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="w-4 h-4 mr-2" />
          บันทึกข้อมูล
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - General Info & School Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info Card */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5" />
                ข้อมูลทั่วไป
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1 - ระดับ and ภาคเรียนที่ */}
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ระดับ</Label>
                  <Select 
                    value={basicInfo.gradeLevel} 
                    onValueChange={handleGradeLevelChange}
                  >
                    <SelectTrigger className="bg-pink-50 border-pink-200">
                      <SelectValue placeholder="เลือกระดับชั้น" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVEL_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ภาคเรียนที่</Label>
                  <Select 
                    value={basicInfo.semester} 
                    onValueChange={handleSemesterChange}
                  >
                    <SelectTrigger className="bg-pink-50 border-pink-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2 - ปีการศึกษา and วันที่อนุมัติผลการเรียน */}
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ปีการศึกษา</Label>
                  <Select 
                    value={basicInfo.academicYear} 
                    onValueChange={handleAcademicYearChange}
                  >
                    <SelectTrigger className="bg-pink-50 border-pink-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateAcademicYears().map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">วันที่อนุมัติผลการเรียน</Label>
                  <Input 
                    type="date"
                    value={basicInfo.approvalDate} 
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, approvalDate: e.target.value }))}
                    className="bg-pink-50 border-pink-200"
                  />
                </div>

                {/* Row 3 - ครูประจำชั้น */}
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ครูประจำชั้นคนที่ 1</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={basicInfo.homeTeacher1} 
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, homeTeacher1: e.target.value }))}
                      className="bg-pink-50 border-pink-200 flex-1"
                      placeholder="เลือกครูประจำชั้น"
                    />
                    <Button variant="outline" size="icon" onClick={() => openTeacherDialog('homeTeacher1')}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ครูประจำชั้นคนที่ 2</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={basicInfo.homeTeacher2} 
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, homeTeacher2: e.target.value }))}
                      className="bg-pink-50 border-pink-200 flex-1"
                      placeholder="เลือกครูประจำชั้น"
                    />
                    <Button variant="outline" size="icon" onClick={() => openTeacherDialog('homeTeacher2')}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Info Card */}
          <Card className="border-2 border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                ข้อมูลสถานศึกษา
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ชื่อโรงเรียน</Label>
                  <Input 
                    value={basicInfo.schoolName} 
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="bg-cyan-50 border-cyan-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ตำบล</Label>
                  <Input 
                    value={basicInfo.subDistrict} 
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, subDistrict: e.target.value }))}
                    className="bg-cyan-50 border-cyan-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">อำเภอ</Label>
                  <Input 
                    value={basicInfo.district} 
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, district: e.target.value }))}
                    className="bg-cyan-50 border-cyan-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">จังหวัด</Label>
                  <Input 
                    value={basicInfo.province} 
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, province: e.target.value }))}
                    className="bg-cyan-50 border-cyan-200"
                  />
                </div>

                <Separator className="col-span-full my-2" />

                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ศูนย์พัฒนาคุณภาพการศึกษา</Label>
                  <Input 
                    value={basicInfo.educationCenter} 
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, educationCenter: e.target.value }))}
                    className="bg-cyan-50 border-cyan-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">สนง.เขตพื้นที่การศึกษาประถมศึกษา</Label>
                  <Input 
                    value={basicInfo.primaryEducationArea} 
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, primaryEducationArea: e.target.value }))}
                    className="bg-cyan-50 border-cyan-200"
                  />
                </div>

                <Separator className="col-span-full my-2" />

                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">หัวหน้าระดับประถมศึกษา</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={basicInfo.supervisor} 
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, supervisor: e.target.value }))}
                      className="bg-cyan-50 border-cyan-200 flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={() => openTeacherDialog('supervisor')}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ฝ่ายวัดผลประเมินผล</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={basicInfo.assessmentEvaluator} 
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, assessmentEvaluator: e.target.value }))}
                      className="bg-cyan-50 border-cyan-200 flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={() => openTeacherDialog('assessmentEvaluator')}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">หัวหน้าฝ่ายวิชาการ</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={basicInfo.academicHead} 
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, academicHead: e.target.value }))}
                      className="bg-cyan-50 border-cyan-200 flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={() => openTeacherDialog('academicHead')}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-pink-600 font-medium">ชื่อผู้บริหาร</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={basicInfo.administratorName} 
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, administratorName: e.target.value }))}
                      className="bg-cyan-50 border-cyan-200 flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={() => openTeacherDialog('administratorName')}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-pink-600 font-medium">ตำแหน่งผู้บริหาร</Label>
                  <Input 
                    value={basicInfo.administratorPosition} 
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, administratorPosition: e.target.value }))}
                    className="bg-cyan-50 border-cyan-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Academic Calendar */}
        <div className="space-y-6">
          <Card className="border-2 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                กำหนดปฏิทินการเรียน
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-blue-200 px-2 py-1.5 text-blue-700">ที่</th>
                    <th className="border border-blue-200 px-2 py-1.5 text-blue-700">ภาคเรียนที่ 1</th>
                    <th className="border border-blue-200 px-2 py-1.5 text-blue-700">ภาคเรียนที่ 2</th>
                  </tr>
                </thead>
                <tbody>
                  {calendar.semester1Months.map((month, index) => (
                    <tr key={index}>
                      <td className="border border-gray-200 px-2 py-1.5 text-center bg-gray-50">{index + 1}</td>
                      <td className="border border-gray-200 px-2 py-1.5 text-cyan-700">{month}</td>
                      <td className="border border-gray-200 px-2 py-1.5 text-cyan-700">{calendar.semester2Months[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                สรุปชั่วโมงเรียน
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-green-600 font-medium">รวมวิชาพื้นฐาน</span>
                  <span className="font-bold">
                    {subjects.filter(s => s.category === 'core').reduce((sum, s) => sum + s.hoursPerYear, 0)} ชั่วโมง/ปี
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-orange-600 font-medium">รวมวิชาเพิ่มเติม</span>
                  <span className="font-bold">
                    {subjects.filter(s => s.category === 'elective').reduce((sum, s) => sum + s.hoursPerYear, 0)} ชั่วโมง/ปี
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-purple-600 font-medium">รวมกิจกรรมพัฒนาผู้เรียน</span>
                  <span className="font-bold">
                    {subjects.filter(s => s.category === 'activity').reduce((sum, s) => sum + s.hoursPerYear, 0)} ชั่วโมง/ปี
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-cyan-50 rounded px-2">
                  <span className="text-cyan-700 font-bold">รวมทั้งหมด</span>
                  <span className="font-bold text-cyan-700">
                    {subjects.reduce((sum, s) => sum + s.hoursPerYear, 0)} ชั่วโมง/ปี
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subject Info Table */}
      <SubjectInfoTable 
        subjects={subjects}
        onUpdateSubject={updateSubject}
        onSelectTeacher={(subjectId) => openTeacherDialog(`subject-${subjectId}`)}
      />

      {/* Teacher Select Dialog */}
      <TeacherSelectDialog
        open={teacherDialogOpen}
        onOpenChange={setTeacherDialogOpen}
        onSelect={handleTeacherSelect}
        title={
          currentTeacherField.startsWith('subject-') 
            ? 'เลือกครูผู้สอน' 
            : currentTeacherField === 'homeTeacher1' || currentTeacherField === 'homeTeacher2'
              ? 'เลือกครูประจำชั้น'
              : 'เลือกบุคลากร'
        }
      />
    </div>
  );
};

export default BasicInfoEntry;
