
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, GraduationCap, Users, FileText, Award, Settings } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import type { Student, ReportOptions } from '@/types/student';
import { generateStudentExcel } from '@/utils/studentReportExcel';
import { printStudentReport } from '@/utils/studentReportPrint';
import ReportOptionsForm from '@/components/student/ReportOptionsForm';
import ReportPreview from '@/components/student/ReportPreview';
import ResizableReportPreview from '@/components/student/ResizableReportPreview';
import { sortGrades } from '@/utils/studentReportUtils';
import { toast } from "@/components/ui/use-toast";

const Reports: React.FC = () => {
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    reportType: '1',
    classLevel: 'all',
    academicYear: '2568',
    additionalFields: {
      gender: false,
      citizenId: false,
      signature: false,
      guardianSignature: false,
      timeIn: false,
      timeOut: false,
      phone: false,
      note: false,
    },
    customColumns: 0,
    customColumn1: '',
    customColumn2: '',
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [isResizableMode, setIsResizableMode] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const storedStudents = await getStudents();
      setStudents(storedStudents);
      console.log('Loaded students:', storedStudents);
    };
    fetchStudents();
  }, []);

  const academicYears = useMemo(() => [...new Set(students.map(s => s.academicYear).filter(Boolean) as string[])].sort().reverse(), [students]);
  const grades = useMemo(() => sortGrades([...new Set(students.map(s => s.grade).filter(Boolean) as string[])]), [students]);

  const handleOptionChange = (field: keyof ReportOptions, value: any) => {
    setReportOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleAdditionalFieldChange = (field: keyof ReportOptions['additionalFields'], checked: boolean) => {
    setReportOptions(prev => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [field]: checked,
      },
    }));
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesClass = reportOptions.classLevel === 'all' || student.grade === reportOptions.classLevel;
      const matchesYear = student.academicYear === reportOptions.academicYear;
      return matchesClass && matchesYear;
    });
  }, [students, reportOptions.classLevel, reportOptions.academicYear]);

  const handleGenerateExcel = () => {
    generateStudentExcel(filteredStudents, reportOptions);
    toast({
      title: "ดาวน์โหลดรายงานสำเร็จ!",
      description: "ไฟล์ Excel กำลังถูกดาวน์โหลด...",
    });
  };

  const handlePrint = () => {
    printStudentReport(filteredStudents, reportOptions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 animate-pulse">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              รายงานข้อมูลนักเรียน
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-6 h-6 text-blue-500" />
              <p className="text-xl text-slate-700 font-medium">
                จัดการและส่งออกรายงานข้อมูลนักเรียนอย่างครบถ้วน
              </p>
              <FileText className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-blue-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Enhanced Main Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden print:border-none print:shadow-none">
          <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white p-8 print:hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  เครื่องมือสร้างรายงานนักเรียน
                </CardTitle>
                <p className="text-blue-100 text-lg">
                  จัดการข้อมูลนักเรียนและสร้างรายงานที่ต้องการได้อย่างง่ายดาย
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8 print:p-0 print:space-y-0">
            {/* Enhanced Form Section */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100 print:hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">ตัวเลือกรายงาน</h3>
              </div>
              <ReportOptionsForm
                reportOptions={reportOptions}
                academicYears={academicYears}
                onOptionChange={handleOptionChange}
                onAdditionalFieldChange={handleAdditionalFieldChange}
              />
            </div>

            {/* Enhanced Preview Section */}
            <div className="bg-gradient-to-br from-slate-50/50 to-gray-50/50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-6 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700">ตัวอย่างรายงาน</h3>
                </div>
                <Button
                  onClick={() => setIsResizableMode(!isResizableMode)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {isResizableMode ? 'โหมดปกติ' : 'ปรับขนาดคอลัมน์'}
                </Button>
              </div>
              
              {isResizableMode ? (
                <ResizableReportPreview
                  students={filteredStudents}
                  reportOptions={reportOptions}
                />
              ) : (
                <ReportPreview
                  students={filteredStudents}
                  reportOptions={reportOptions}
                />
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-wrap gap-4 print:hidden">
              <Button 
                onClick={handleGenerateExcel} 
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-sarabun px-8 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Download className="h-5 w-5 mr-3" />
                ส่งออก Excel
              </Button>
              <Button 
                onClick={handlePrint} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-sarabun px-8 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Printer className="h-5 w-5 mr-3" />
                พิมพ์รายงาน
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <div className="flex justify-center">
          <div className="flex items-center gap-6 text-5xl opacity-20">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>👨‍🎓</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>📚</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🏆</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>📊</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>📋</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
