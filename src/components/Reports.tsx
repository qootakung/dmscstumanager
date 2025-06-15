
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, FileText, Users, BarChart3 } from 'lucide-react';
import ReportOptionsForm from './student/ReportOptionsForm';
import ReportPreview from './student/ReportPreview';
import { useStudentReport } from '@/hooks/useStudentReport';
import { generateStudentExcel } from '@/utils/studentReportExcel';
import { printStudentReport } from '@/utils/studentReportPrint';

const Reports: React.FC = () => {
  const {
    reportOptions,
    academicYears,
    classLevels,
    handleOptionChange,
    handleAdditionalFieldChange,
    filteredStudents,
  } = useStudentReport();

  const handleGenerateExcel = () => {
    generateStudentExcel(filteredStudents, reportOptions);
  }

  const handlePrint = () => {
    printStudentReport(filteredStudents, reportOptions);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 rounded-3xl"></div>
          <div className="relative text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 animate-pulse">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              รายงานข้อมูลนักเรียน
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <p className="text-xl text-slate-700 font-medium">
                จัดการและส่งออกรายงานข้อมูลนักเรียนอย่างมีประสิทธิภาพ
              </p>
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
              <span className="text-sm font-semibold text-blue-700">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Enhanced Main Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  เครื่องมือสร้างรายงาน
                </CardTitle>
                <p className="text-blue-100 text-lg">
                  เลือกตัวเลือกและปรับแต่งรายงานตามความต้องการ
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            {/* Enhanced Form Section */}
            <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">ตัวเลือกรายงาน</h3>
              </div>
              <ReportOptionsForm
                reportOptions={reportOptions}
                handleOptionChange={handleOptionChange}
                handleAdditionalFieldChange={handleAdditionalFieldChange}
                classLevels={classLevels}
                academicYears={academicYears}
              />
            </div>

            {/* Enhanced Preview Section */}
            <div className="bg-gradient-to-br from-slate-50/50 to-gray-50/50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">ตัวอย่างรายงาน</h3>
              </div>
              <ReportPreview students={filteredStudents} reportOptions={reportOptions} />
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
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
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>📊</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>📋</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>📈</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>👥</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>📑</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
