
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Printer, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import { supabase } from '@/integrations/supabase/client';
import type { Student } from '@/types/student';
import { toast } from '@/components/ui/use-toast';
import {
  getThaiHolidays,
  isThaiHoliday,
  isWeekend,
  getThaiDayAbbr,
  getThaiMonthName,
  getSemesterMonths,
  getDaysInMonth,
  getStartDay,
} from '@/utils/thaiHolidays';
import PP5AttendancePrint from './PP5AttendancePrint';
import { createRoot } from 'react-dom/client';

const primaryGrades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
const statusCycle = ['', '/', 'ป', 'ล', 'ข'];

interface PP5AttendanceProps {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

const PP5Attendance: React.FC<PP5AttendanceProps> = ({
  selectedGrade: initialGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack
}) => {
  const [currentGrade, setCurrentGrade] = useState(initialGrade);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  
  // Attendance data: { [studentId_date]: status }
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  
  const semesterMonths = getSemesterMonths(selectedSemester, selectedAcademicYear);
  const holidays = getThaiHolidays(parseInt(selectedAcademicYear));
  
  const currentMonthInfo = semesterMonths[currentMonthIndex];
  const daysInMonth = getDaysInMonth(currentMonthInfo.month, currentMonthInfo.ceYear);
  const startDay = getStartDay(selectedSemester, currentMonthInfo.month);

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      const filtered = allStudents.filter(s =>
        s.grade === currentGrade &&
        s.academicYear === selectedAcademicYear &&
        s.semester === selectedSemester
      );
      filtered.sort((a, b) => {
        const aId = a.studentId || '';
        const bId = b.studentId || '';
        const aIs3Digit = aId.length === 3;
        const bIs3Digit = bId.length === 3;
        if (aIs3Digit && !bIs3Digit) return -1;
        if (!aIs3Digit && bIs3Digit) return 1;
        return parseInt(aId) - parseInt(bId);
      });
      setStudents(filtered);
      setLoading(false);
    };
    loadStudents();
  }, [currentGrade, selectedAcademicYear, selectedSemester]);

  // Load attendance data for current month
  useEffect(() => {
    const loadAttendance = async () => {
      if (students.length === 0) return;
      
      const startDate = `${currentMonthInfo.ceYear}-${String(currentMonthInfo.month + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
      const endDate = `${currentMonthInfo.ceYear}-${String(currentMonthInfo.month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      
      const studentIds = students.map(s => s.id);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .in('student_id', studentIds)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);
      
      if (error) {
        console.error('Error loading attendance:', error);
        return;
      }
      
      const newData: Record<string, string> = {};
      data?.forEach(record => {
        const key = `${record.student_id}_${record.attendance_date}`;
        newData[key] = record.status;
      });
      setAttendanceData(newData);
    };
    loadAttendance();
  }, [students, currentMonthInfo, startDay, daysInMonth]);

  // Toggle attendance status
  const toggleAttendance = useCallback(async (studentId: string, day: number) => {
    const dateStr = `${currentMonthInfo.ceYear}-${String(currentMonthInfo.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const key = `${studentId}_${dateStr}`;
    
    const currentStatus = attendanceData[key] || '';
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    
    // Update local state immediately
    setAttendanceData(prev => {
      const updated = { ...prev };
      if (nextStatus === '') {
        delete updated[key];
      } else {
        updated[key] = nextStatus;
      }
      return updated;
    });
    
    // Save to database
    if (nextStatus === '') {
      await supabase
        .from('attendance_records')
        .delete()
        .eq('student_id', studentId)
        .eq('attendance_date', dateStr);
    } else {
      const student = students.find(s => s.id === studentId);
      await supabase
        .from('attendance_records')
        .upsert({
          student_id: studentId,
          attendance_date: dateStr,
          status: nextStatus,
          academic_year: selectedAcademicYear,
          semester: selectedSemester,
          grade: student?.grade || currentGrade,
        }, { onConflict: 'student_id,attendance_date' });
    }
  }, [attendanceData, currentMonthInfo, students, selectedAcademicYear, selectedSemester, currentGrade]);

  // Mark all students for a day
  const markAllForDay = useCallback(async (day: number, status: string) => {
    setSaving(true);
    const dateStr = `${currentMonthInfo.ceYear}-${String(currentMonthInfo.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const newData = { ...attendanceData };
    const records = students.map(student => {
      const key = `${student.id}_${dateStr}`;
      if (status === '') {
        delete newData[key];
      } else {
        newData[key] = status;
      }
      return {
        student_id: student.id,
        attendance_date: dateStr,
        status: status || '/',
        academic_year: selectedAcademicYear,
        semester: selectedSemester,
        grade: student.grade || currentGrade,
      };
    });
    
    setAttendanceData(newData);
    
    if (status === '') {
      await supabase
        .from('attendance_records')
        .delete()
        .in('student_id', students.map(s => s.id))
        .eq('attendance_date', dateStr);
    } else {
      await supabase
        .from('attendance_records')
        .upsert(records, { onConflict: 'student_id,attendance_date' });
    }
    
    setSaving(false);
  }, [attendanceData, currentMonthInfo, students, selectedAcademicYear, selectedSemester, currentGrade]);

  // Generate day columns
  const dayColumns: { day: number; date: Date; dayAbbr: string; weekend: boolean; holiday: string | null }[] = [];
  for (let d = startDay; d <= daysInMonth; d++) {
    const date = new Date(currentMonthInfo.ceYear, currentMonthInfo.month, d);
    const weekend = isWeekend(date);
    const holiday = isThaiHoliday(date, holidays);
    dayColumns.push({
      day: d,
      date,
      dayAbbr: getThaiDayAbbr(date),
      weekend,
      holiday,
    });
  }

  // Count school days for summary
  const schoolDays = dayColumns.filter(d => !d.weekend && !d.holiday).length;

  // Print handler
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    if (!printWindow) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาอนุญาต pop-ups เพื่อพิมพ์รายงาน",
        variant: "destructive",
      });
      return;
    }

    document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });

    printWindow.document.title = `เช็คเวลาเรียน ${currentGrade} ${getThaiMonthName(currentMonthInfo.month)}`;
    const printRootEl = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(printRootEl);

    const root = createRoot(printRootEl);
    root.render(
      <PP5AttendancePrint
        students={students}
        grade={currentGrade}
        semester={selectedSemester}
        academicYear={selectedAcademicYear}
        monthName={getThaiMonthName(currentMonthInfo.month)}
        dayColumns={dayColumns}
        attendanceData={attendanceData}
        ceYear={currentMonthInfo.ceYear}
        month={currentMonthInfo.month}
      />
    );

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  const buddhistYear = currentMonthInfo.month >= 0 && currentMonthInfo.month <= 2 && selectedSemester === '2'
    ? parseInt(selectedAcademicYear) + 1
    : parseInt(selectedAcademicYear);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-6 h-6" />
              เช็คเวลาเรียน (วัน)
            </CardTitle>
            <div className="text-white text-sm">
              ภาคเรียนที่ {selectedSemester} / {selectedAcademicYear}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card className="shadow-md">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="font-medium whitespace-nowrap">ระดับชั้น:</Label>
              <Select value={currentGrade} onValueChange={setCurrentGrade}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {primaryGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      ประถมศึกษาปีที่ {grade.replace('ป.', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Month navigation */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={currentMonthIndex === 0}
                onClick={() => setCurrentMonthIndex(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 py-1 bg-primary/10 rounded-lg font-medium text-primary min-w-[140px] text-center">
                {getThaiMonthName(currentMonthInfo.month)} {buddhistYear}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentMonthIndex === semesterMonths.length - 1}
                onClick={() => setCurrentMonthIndex(prev => prev + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="shadow-md">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">สัญลักษณ์:</span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-green-600 font-bold">/</span>
              มาเรียน
            </span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-red-600 font-bold">ป</span>
              ป่วย
            </span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-blue-600 font-bold">ล</span>
              ลา
            </span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-orange-600 font-bold">ข</span>
              ขาด
            </span>
            <span className="ml-2 flex items-center gap-1">
              <span className="w-6 h-6 bg-gray-200 rounded"></span>
              เสาร์-อาทิตย์
            </span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 bg-red-100 rounded"></span>
              วันหยุดราชการ
            </span>
            <span className="ml-auto text-muted-foreground">
              วันเรียนในเดือนนี้: <strong className="text-primary">{schoolDays}</strong> วัน
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบข้อมูลนักเรียนในระดับชั้น {currentGrade}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs" style={{ minWidth: '100%' }}>
                <thead>
                  {/* Row 1: Month header */}
                  <tr className="bg-orange-50">
                    <th colSpan={2} rowSpan={3} className="border border-gray-300 px-2 py-1 text-center font-semibold sticky left-0 bg-orange-50 z-10 min-w-[40px]">
                      เลข<br/>ที่
                    </th>
                    <th rowSpan={3} className="border border-gray-300 px-2 py-1 text-left font-semibold sticky left-[40px] bg-orange-50 z-10 min-w-[160px]">
                      ชื่อ-นามสกุล
                    </th>
                    <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center font-semibold text-[10px] w-8">
                      เดือน<br/>วันที่
                    </th>
                    <th colSpan={dayColumns.length} className="border border-gray-300 px-2 py-1 text-center font-bold text-orange-700 text-sm">
                      {getThaiMonthName(currentMonthInfo.month)}
                    </th>
                  </tr>
                  {/* Row 2: Day numbers */}
                  <tr className="bg-orange-50">
                    {dayColumns.map(({ day, weekend, holiday }) => (
                      <th
                        key={day}
                        className={`border border-gray-300 px-0 py-0.5 text-center font-medium w-7 text-[10px] ${
                          weekend ? 'bg-gray-200 text-gray-500' :
                          holiday ? 'bg-red-100 text-red-500' : ''
                        }`}
                        title={holiday || undefined}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                  {/* Row 3: Day abbreviations */}
                  <tr className="bg-orange-50">
                    <th className="border border-gray-300 px-1 py-0.5 text-center font-medium text-[10px]">
                      วัน
                    </th>
                    {dayColumns.map(({ day, dayAbbr, weekend, holiday }) => (
                      <th
                        key={day}
                        className={`border border-gray-300 px-0 py-0.5 text-center font-medium text-[10px] ${
                          weekend ? 'bg-gray-200 text-gray-500' :
                          holiday ? 'bg-red-100 text-red-500' : ''
                        }`}
                      >
                        {dayAbbr}
                      </th>
                    ))}
                  </tr>
                  {/* Mark all row */}
                  <tr className="bg-yellow-50">
                    <td colSpan={2} className="border border-gray-300 px-2 py-1 text-center font-medium sticky left-0 bg-yellow-50 z-10 text-[10px]">
                      
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center font-medium sticky left-[40px] bg-yellow-50 z-10 text-[10px]">
                      เช็คทั้งหมด
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-center text-[10px]"></td>
                    {dayColumns.map(({ day, weekend, holiday }) => (
                      <td
                        key={day}
                        className={`border border-gray-300 px-0 py-0.5 text-center ${
                          weekend ? 'bg-gray-200' :
                          holiday ? 'bg-red-100' : ''
                        }`}
                      >
                        {!weekend && !holiday && (
                          <button
                            onClick={() => markAllForDay(day, '/')}
                            className="w-full h-full text-green-600 font-bold text-[10px] hover:bg-green-100 py-0.5"
                            title="เช็คมาทั้งหมด"
                          >
                            ✓
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-blue-50/30">
                      <td colSpan={2} className="border border-gray-300 px-2 py-1 text-center sticky left-0 bg-white z-10">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 whitespace-nowrap sticky left-[40px] bg-white z-10">
                        {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                      </td>
                      <td className="border border-gray-300 px-1 py-1 text-center text-[10px]"></td>
                      {dayColumns.map(({ day, weekend, holiday }) => {
                        const dateStr = `${currentMonthInfo.ceYear}-${String(currentMonthInfo.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const key = `${student.id}_${dateStr}`;
                        const status = attendanceData[key] || '';
                        const isDisabled = weekend || !!holiday;

                        return (
                          <td
                            key={day}
                            className={`border border-gray-300 px-0 py-0 text-center cursor-pointer select-none w-7 h-7 ${
                              isDisabled ? (weekend ? 'bg-gray-200' : 'bg-red-100') : 'hover:bg-blue-50'
                            }`}
                            onClick={() => !isDisabled && toggleAttendance(student.id, day)}
                          >
                            <span className={`text-xs font-bold ${
                              status === '/' ? 'text-green-600' :
                              status === 'ป' ? 'text-red-600' :
                              status === 'ล' ? 'text-blue-600' :
                              status === 'ข' ? 'text-orange-600' : ''
                            }`}>
                              {status}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PP5Attendance;
