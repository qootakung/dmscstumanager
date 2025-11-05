
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, GraduationCap, Users, FileText, Award, Settings } from 'lucide-react';
import { getTeachers } from '@/utils/teacherStorage';
import type { Teacher } from '@/types/teacher';
import type { TeacherReportOptions } from '@/types/teacherReport';
import { generateTeacherExcel, formatThaiDate } from '@/utils/teacherReportExcel';
import TeacherReportForm from '@/components/teacher/TeacherReportForm';
import TeacherReportPreview from '@/components/teacher/TeacherReportPreview';
import ResizableTeacherReportPreview from '@/components/teacher/ResizableTeacherReportPreview';
import { toast } from "@/components/ui/use-toast";
import { printTeacherReport } from '@/utils/teacherReportPrint';

const TeacherReports: React.FC = () => {
  const [reportOptions, setReportOptions] = useState<TeacherReportOptions>({
    reportType: '1',
    academicYear: '2568',
    additionalFields: {
      email: false,
      citizenId: false,
      salary: false,
      birthDate: false,
      position: false,
      education: false,
      major: false,
      phone: false,
      lineId: false,
      appointmentDate: false,
      signature: false,
      signature2: false,
      timeIn: false,
      timeOut: false,
      note: false,
    },
    fieldOrder: [],
    customColumns: 0,
    showDate: false,
    selectedDate: '',
    customTitle1: '',
    customTitle2: '',
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isResizableMode, setIsResizableMode] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
        const storedTeachers = await getTeachers();
        setTeachers(storedTeachers);
        console.log('Loaded teachers:', storedTeachers);
    };
    fetchTeachers();
  }, []);

  const academicYears = useMemo(() => [...new Set(teachers.map(t => t.academicYear).filter(Boolean) as string[])].sort().reverse(), [teachers]);

  const handleOptionChange = (field: keyof TeacherReportOptions, value: any) => {
    setReportOptions(prev => {
      // ถ้าเปลี่ยน reportType เป็น 2 (แบบลงทะเบียนการประชุม) ให้เช็ค signature, timeIn, signature2, timeOut อัตโนมัติ
      if (field === 'reportType' && value === '2') {
        const fieldsToCheck = ['signature', 'timeIn', 'signature2', 'timeOut'];
        const newFieldOrder = [...prev.fieldOrder];
        const newAdditionalFields = { ...prev.additionalFields };
        
        fieldsToCheck.forEach(fieldName => {
          const typedFieldName = fieldName as keyof TeacherReportOptions['additionalFields'];
          if (!prev.additionalFields[typedFieldName]) {
            newAdditionalFields[typedFieldName] = true;
            if (!newFieldOrder.includes(fieldName)) {
              newFieldOrder.push(fieldName);
            }
          }
        });
        
        return {
          ...prev,
          [field]: value,
          additionalFields: newAdditionalFields,
          fieldOrder: newFieldOrder,
        };
      }
      
      return { ...prev, [field]: value };
    });
  };

  const handleAdditionalFieldChange = (field: keyof TeacherReportOptions['additionalFields'], checked: boolean) => {
    setReportOptions(prev => {
      const newFieldOrder = checked 
        ? [...prev.fieldOrder, field]
        : prev.fieldOrder.filter(f => f !== field);
      
      return {
        ...prev,
        additionalFields: {
          ...prev.additionalFields,
          [field]: checked,
        },
        fieldOrder: newFieldOrder,
      };
    });
  };

  const handleGenerateExcel = () => {
    generateTeacherExcel(teachers, reportOptions);
    toast({
      title: "ดาวน์โหลดรายงานสำเร็จ!",
      description: "ไฟล์ Excel กำลังถูกดาวน์โหลด...",
    });
  };

  const handlePrint = () => {
    printTeacherReport(teachers, reportOptions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl mb-6 animate-pulse">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              รายงานข้อมูลครู
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-6 h-6 text-amber-500" />
              <p className="text-xl text-slate-700 font-medium">
                จัดการและส่งออกรายงานข้อมูลครูและบุคลากรทางการศึกษา
              </p>
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-amber-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Enhanced Main Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden print:border-none print:shadow-none">
          <CardHeader className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-8 print:hidden">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  เครื่องมือสร้างรายงานครู
                </CardTitle>
                <p className="text-amber-100 text-lg">
                  จัดการข้อมูลครูและบุคลากรทางการศึกษาอย่างครบถ้วน
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8 print:p-0 print:space-y-0">
            {/* Enhanced Form Section */}
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl p-6 border border-amber-100 print:hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">ตัวเลือกรายงาน</h3>
              </div>
              <TeacherReportForm
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
                <ResizableTeacherReportPreview
                  reportOptions={reportOptions}
                  teachers={teachers}
                  formatThaiDate={formatThaiDate}
                />
              ) : (
                <TeacherReportPreview
                  reportOptions={reportOptions}
                  teachers={teachers}
                  formatThaiDate={formatThaiDate}
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
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-sarabun px-8 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
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
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>👨‍🏫</span>
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

export default TeacherReports;
