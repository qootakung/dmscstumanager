
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Printer, ClipboardList } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import { supabase } from '@/integrations/supabase/client';
import type { Student } from '@/types/student';
import { toast } from '@/components/ui/use-toast';
import {
  getThaiHolidays,
  isThaiHoliday,
  isWeekend,
  getThaiMonthName,
  getSemesterMonths,
  getDaysInMonth,
  getStartDay,
} from '@/utils/thaiHolidays';
import PP5AttendanceHoursPrint from './PP5AttendanceHoursPrint';
import { createRoot } from 'react-dom/client';

const primaryGrades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

interface PP5AttendanceHoursSummaryProps {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

export interface MonthSummary {
  month: number;
  ceYear: number;
  monthName: string;
  schoolDays: number;
}

export interface StudentMonthAttendance {
  present: number;
  sick: number;
  leave: number;
  absent: number;
}

export type ReportType = 'semester1' | 'semester2' | 'fullYear';

const PP5AttendanceHoursSummary: React.FC<PP5AttendanceHoursSummaryProps> = ({
  selectedGrade: initialGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  const [currentGrade, setCurrentGrade] = useState(initialGrade);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>(
    selectedSemester === '1' ? 'semester1' : selectedSemester === '2' ? 'semester2' : 'semester1'
  );

  // Attendance data keyed by studentId_date
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  const holidays = getThaiHolidays(parseInt(selectedAcademicYear));

  // Get months based on report type
  const getReportMonths = () => {
    if (reportType === 'semester1') return getSemesterMonths('1', selectedAcademicYear);
    if (reportType === 'semester2') return getSemesterMonths('2', selectedAcademicYear);
    return [...getSemesterMonths('1', selectedAcademicYear), ...getSemesterMonths('2', selectedAcademicYear)];
  };

  const reportMonths = getReportMonths();

  // Calculate school days per month
  const monthSummaries: MonthSummary[] = reportMonths.map(m => {
    const daysInMonth = getDaysInMonth(m.month, m.ceYear);
    const startDay = getStartDay(
      reportType === 'semester2' ? '2' : (reportType === 'semester1' ? '1' : (m.month >= 4 && m.month <= 9 ? '1' : '2')),
      m.month
    );
    let schoolDays = 0;
    for (let d = startDay; d <= daysInMonth; d++) {
      const date = new Date(m.ceYear, m.month, d);
      if (!isWeekend(date) && !isThaiHoliday(date, holidays)) {
        schoolDays++;
      }
    }
    return {
      month: m.month,
      ceYear: m.ceYear,
      monthName: getThaiMonthName(m.month),
      schoolDays,
    };
  });

  const totalSchoolDays = monthSummaries.reduce((sum, m) => sum + m.schoolDays, 0);
  const minRequiredDays = Math.floor(totalSchoolDays * 0.8);

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      const semesterFilter = reportType === 'semester1' ? '1' : reportType === 'semester2' ? '2' : null;
      const filtered = allStudents.filter(
        s => s.grade === currentGrade && s.academicYear === selectedAcademicYear &&
          (semesterFilter ? s.semester === semesterFilter : true)
      );
      filtered.sort((a, b) => {
        const aId = a.studentId || '';
        const bId = b.studentId || '';
        const aIs3 = aId.length === 3;
        const bIs3 = bId.length === 3;
        if (aIs3 && !bIs3) return -1;
        if (!aIs3 && bIs3) return 1;
        return parseInt(aId) - parseInt(bId);
      });
      setStudents(filtered);
      setLoading(false);
    };
    loadStudents();
  }, [currentGrade, selectedAcademicYear, reportType]);

  // Load all attendance data for the relevant months
  useEffect(() => {
    const loadAllAttendance = async () => {
      if (students.length === 0) return;
      const studentIds = students.map(s => s.id);

      // Build date ranges for all months
      const allData: Record<string, string> = {};
      for (const m of reportMonths) {
        const startDay = getStartDay(
          reportType === 'semester2' ? '2' : (reportType === 'semester1' ? '1' : (m.month >= 4 && m.month <= 9 ? '1' : '2')),
          m.month
        );
        const daysInMonth = getDaysInMonth(m.month, m.ceYear);
        const startDate = `${m.ceYear}-${String(m.month + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        const endDate = `${m.ceYear}-${String(m.month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

        const { data, error } = await supabase
          .from('attendance_records')
          .select('*')
          .in('student_id', studentIds)
          .gte('attendance_date', startDate)
          .lte('attendance_date', endDate);

        if (!error && data) {
          data.forEach(record => {
            allData[`${record.student_id}_${record.attendance_date}`] = record.status;
          });
        }
      }
      setAttendanceData(allData);
    };
    loadAllAttendance();
  }, [students, reportType, selectedAcademicYear]);

  // Calculate per-student per-month attendance
  const getStudentMonthAttendance = (studentId: string, m: MonthSummary): StudentMonthAttendance => {
    const daysInMonth = getDaysInMonth(m.month, m.ceYear);
    const semester = (m.month >= 4 && m.month <= 9) ? '1' : '2';
    const startDay = getStartDay(semester, m.month);
    let present = 0, sick = 0, leave = 0, absent = 0;

    for (let d = startDay; d <= daysInMonth; d++) {
      const date = new Date(m.ceYear, m.month, d);
      if (isWeekend(date) || isThaiHoliday(date, holidays)) continue;
      const dateStr = `${m.ceYear}-${String(m.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const status = attendanceData[`${studentId}_${dateStr}`] || '';
      if (status === '/') present++;
      else if (status === 'ป') sick++;
      else if (status === 'ล') leave++;
      else if (status === 'ข') absent++;
    }
    return { present, sick, leave, absent };
  };

  const getSemesterLabel = () => {
    if (reportType === 'semester1') return `ภาคเรียนที่ 1/${selectedAcademicYear}`;
    if (reportType === 'semester2') return `ภาคเรียนที่ 2/${selectedAcademicYear}`;
    return `ปีการศึกษา ${selectedAcademicYear}`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=700');
    if (!printWindow) {
      toast({ title: 'เกิดข้อผิดพลาด', description: 'กรุณาอนุญาต pop-ups', variant: 'destructive' });
      return;
    }

    document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
      printWindow.document.head.appendChild(style.cloneNode(true));
    });

    printWindow.document.title = `แบบสรุปเวลาเรียน ${currentGrade} ${getSemesterLabel()}`;
    const el = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(el);

    const root = createRoot(el);
    root.render(
      <PP5AttendanceHoursPrint
        students={students}
        grade={currentGrade}
        academicYear={selectedAcademicYear}
        reportType={reportType}
        monthSummaries={monthSummaries}
        totalSchoolDays={totalSchoolDays}
        minRequiredDays={minRequiredDays}
        attendanceData={attendanceData}
        holidays={holidays}
        getStudentMonthAttendance={getStudentMonthAttendance}
      />
    );

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              แบบนับเวลาเรียน (ชั่วโมง)
            </CardTitle>
            <div className="text-white text-sm">{getSemesterLabel()}</div>
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
                  {primaryGrades.map(g => (
                    <SelectItem key={g} value={g}>ประถมศึกษาปีที่ {g.replace('ป.', '')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="font-medium whitespace-nowrap">ประเภทรายงาน:</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semester1">รวมภาค 1</SelectItem>
                  <SelectItem value="semester2">รวมภาค 2</SelectItem>
                  <SelectItem value="fullYear">รวมทั้งปี</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePrint} className="ml-auto bg-primary hover:bg-primary/90">
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="shadow-md">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>
              เวลาเรียน{reportType === 'fullYear' ? 'ตลอดปีการศึกษา' : 'ตลอดภาคเรียน'}จำนวน <strong className="text-primary">{totalSchoolDays}</strong> วัน
            </span>
            <span>
              เวลาเรียนร้อยละ 80 คิดเป็นเวลาเรียนจริง <strong className="text-primary">{minRequiredDays}</strong> วัน
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">ไม่พบข้อมูลนักเรียนในระดับชั้น {currentGrade}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs w-full">
                <thead>
                  <tr className="bg-orange-50">
                    <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center font-semibold min-w-[30px]">ที่</th>
                    <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-left font-semibold min-w-[140px]">ชื่อ - นามสกุล</th>
                    <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center font-semibold text-[10px] w-16">เวลาเรียน<br/>(วัน)</th>
                    {reportType === 'fullYear' ? (
                      <>
                        <th colSpan={5} className="border border-gray-300 px-2 py-1 text-center font-bold text-orange-700">รวมภาค 1</th>
                        <th colSpan={5} className="border border-gray-300 px-2 py-1 text-center font-bold text-blue-700">รวมภาค 2</th>
                        <th colSpan={5} className="border border-gray-300 px-2 py-1 text-center font-bold text-green-700">รวมทั้งปี</th>
                      </>
                    ) : (
                      <>
                        {monthSummaries.map((m, i) => (
                          <th key={i} colSpan={4} className="border border-gray-300 px-1 py-1 text-center font-bold text-orange-700 text-[10px]">
                            {m.monthName}<br/><span className="font-normal text-gray-600">{m.schoolDays}</span>
                          </th>
                        ))}
                        <th colSpan={5} className="border border-gray-300 px-2 py-1 text-center font-bold text-green-700">
                          {reportType === 'semester1' ? 'รวมภาค 1' : 'รวมภาค 2'}
                        </th>
                      </>
                    )}
                  </tr>
                  <tr className="bg-orange-50">
                    {reportType === 'fullYear' ? (
                      <>
                        {/* Semester 1 sub-headers */}
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">มา</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ป</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ล</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ข</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-8">%</th>
                        {/* Semester 2 sub-headers */}
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">มา</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ป</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ล</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ข</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-8">%</th>
                        {/* Full year sub-headers */}
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">มา</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ป</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ล</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ข</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-8">%</th>
                      </>
                    ) : (
                      <>
                        {monthSummaries.map((_, i) => (
                          <React.Fragment key={i}>
                            <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">มา</th>
                            <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ป</th>
                            <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ล</th>
                            <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ข</th>
                          </React.Fragment>
                        ))}
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-8">{totalSchoolDays}</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-8">%</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">มา</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ป</th>
                        <th className="border border-gray-300 px-0.5 py-0.5 text-center text-[9px] w-6">ล</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const monthData = monthSummaries.map(m => getStudentMonthAttendance(student.id, m));

                    if (reportType === 'fullYear') {
                      const sem1Months = getSemesterMonths('1', selectedAcademicYear);
                      const sem2Months = getSemesterMonths('2', selectedAcademicYear);

                      const sem1Data = sem1Months.map(m => {
                        const ms: MonthSummary = { month: m.month, ceYear: m.ceYear, monthName: getThaiMonthName(m.month), schoolDays: 0 };
                        return getStudentMonthAttendance(student.id, ms);
                      });
                      const sem2Data = sem2Months.map(m => {
                        const ms: MonthSummary = { month: m.month, ceYear: m.ceYear, monthName: getThaiMonthName(m.month), schoolDays: 0 };
                        return getStudentMonthAttendance(student.id, ms);
                      });

                      const s1 = { present: sem1Data.reduce((s, d) => s + d.present, 0), sick: sem1Data.reduce((s, d) => s + d.sick, 0), leave: sem1Data.reduce((s, d) => s + d.leave, 0), absent: sem1Data.reduce((s, d) => s + d.absent, 0) };
                      const s2 = { present: sem2Data.reduce((s, d) => s + d.present, 0), sick: sem2Data.reduce((s, d) => s + d.sick, 0), leave: sem2Data.reduce((s, d) => s + d.leave, 0), absent: sem2Data.reduce((s, d) => s + d.absent, 0) };
                      const total = { present: s1.present + s2.present, sick: s1.sick + s2.sick, leave: s1.leave + s2.leave, absent: s1.absent + s2.absent };

                      const sem1Total = monthSummaries.filter((_, i) => i < 6).reduce((s, m) => s + m.schoolDays, 0);
                      const sem2Total = monthSummaries.filter((_, i) => i >= 6).reduce((s, m) => s + m.schoolDays, 0);
                      const s1Pct = sem1Total > 0 ? ((s1.present / sem1Total) * 100).toFixed(2) : '0';
                      const s2Pct = sem2Total > 0 ? ((s2.present / sem2Total) * 100).toFixed(2) : '0';
                      const totalPct = totalSchoolDays > 0 ? ((total.present / totalSchoolDays) * 100).toFixed(2) : '0';

                      return (
                        <tr key={student.id} className="hover:bg-blue-50/30">
                          <td className="border border-gray-300 px-2 py-0.5 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-2 py-0.5 whitespace-nowrap">{student.titleTh}{student.firstNameTh} {student.lastNameTh}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{total.present}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-green-600">{s1.present || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-red-600">{s1.sick || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-blue-600">{s1.leave || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-orange-600">{s1.absent || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center font-medium">{s1Pct}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-green-600">{s2.present || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-red-600">{s2.sick || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-blue-600">{s2.leave || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-orange-600">{s2.absent || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center font-medium">{s2Pct}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-green-600">{total.present || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-red-600">{total.sick || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-blue-600">{total.leave || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center text-orange-600">{total.absent || ''}</td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center font-medium">{totalPct}</td>
                        </tr>
                      );
                    }

                    // Semester view
                    const totals = monthData.reduce((acc, d) => ({
                      present: acc.present + d.present,
                      sick: acc.sick + d.sick,
                      leave: acc.leave + d.leave,
                      absent: acc.absent + d.absent,
                    }), { present: 0, sick: 0, leave: 0, absent: 0 });
                    const pct = totalSchoolDays > 0 ? ((totals.present / totalSchoolDays) * 100).toFixed(2) : '0';

                    return (
                      <tr key={student.id} className="hover:bg-blue-50/30">
                        <td className="border border-gray-300 px-2 py-0.5 text-center">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-0.5 whitespace-nowrap">{student.titleTh}{student.firstNameTh} {student.lastNameTh}</td>
                        <td className="border border-gray-300 px-1 py-0.5 text-center">{totals.present}</td>
                        {monthData.map((d, i) => (
                          <React.Fragment key={i}>
                            <td className="border border-gray-300 px-0.5 py-0.5 text-center text-green-600">{d.present || ''}</td>
                            <td className="border border-gray-300 px-0.5 py-0.5 text-center text-red-600">{d.sick || ''}</td>
                            <td className="border border-gray-300 px-0.5 py-0.5 text-center text-blue-600">{d.leave || ''}</td>
                            <td className="border border-gray-300 px-0.5 py-0.5 text-center text-orange-600">{d.absent || ''}</td>
                          </React.Fragment>
                        ))}
                        <td className="border border-gray-300 px-0.5 py-0.5 text-center font-bold">{totals.present}</td>
                        <td className="border border-gray-300 px-0.5 py-0.5 text-center font-medium">{pct}</td>
                        <td className="border border-gray-300 px-0.5 py-0.5 text-center text-green-600 font-bold">{totals.present || ''}</td>
                        <td className="border border-gray-300 px-0.5 py-0.5 text-center text-red-600">{totals.sick || ''}</td>
                        <td className="border border-gray-300 px-0.5 py-0.5 text-center text-blue-600">{totals.leave || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PP5AttendanceHoursSummary;
