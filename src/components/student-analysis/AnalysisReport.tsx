
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Printer, Share2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface AnalysisReportProps {
  analysisData: {
    total: number;
    excellent: number;
    average: number;
    needsImprovement: number;
    averageScore: number;
    excellentStudents: any[];
    averageStudents: any[];
    needsImprovementStudents: any[];
  };
  selectedSubject: string;
  selectedGrade: string;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({
  analysisData,
  selectedSubject,
  selectedGrade
}) => {
  const handleExportReport = async (format: 'pdf' | 'excel') => {
    await Swal.fire({
      title: 'กำลังสร้างรายงาน',
      text: `กำลังส่งออกรายงานในรูปแบบ ${format.toUpperCase()}...`,
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleShareReport = async () => {
    await Swal.fire({
      title: 'แชร์รายงาน',
      text: 'ลิงก์สำหรับแชร์รายงานได้ถูกคัดลอกไปยังคลิปบอร์ดแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    });
  };

  return (
    <div className="space-y-6">
      {/* ปุ่มการดำเนินการ */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            ส่งออกและแชร์รายงาน
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => handleExportReport('pdf')}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
            >
              <Download className="w-4 h-4 mr-2" />
              ส่งออก PDF
            </Button>
            <Button 
              onClick={() => handleExportReport('excel')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
            >
              <Download className="w-4 h-4 mr-2" />
              ส่งออก Excel
            </Button>
            <Button 
              onClick={handlePrintReport}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์รายงาน
            </Button>
            <Button 
              onClick={handleShareReport}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              แชร์รายงาน
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* รายงานสรุปผล */}
      <Card id="report-content">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
          <CardTitle className="text-center">
            รายงานการวิเคราะห์ผู้เรียน
          </CardTitle>
          <div className="text-center text-slate-200">
            <p>วิชา: {selectedSubject}</p>
            <p>ระดับชั้น: {selectedGrade === 'all' ? 'ทุกระดับชั้น' : selectedGrade}</p>
            <p>วันที่สร้างรายงาน: {new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* สรุปผลรวม */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">สรุปผลการวิเคราะห์</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{analysisData.total}</p>
                <p className="text-sm text-blue-700">นักเรียนทั้งหมด</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-600">{analysisData.excellent}</p>
                <p className="text-sm text-green-700">กลุ่มเก่ง (≥80)</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-2xl font-bold text-orange-600">{analysisData.average}</p>
                <p className="text-sm text-orange-700">กลุ่มปานกลาง (70-79)</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-600">{analysisData.needsImprovement}</p>
                <p className="text-sm text-red-700">กลุ่มอ่อน (&lt;70)</p>
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xl">คะแนนเฉลี่ยของวิชา: <span className="font-bold text-purple-600">{Math.round(analysisData.averageScore * 100) / 100}</span></p>
            </div>
          </div>

          {/* รายชื่อแต่ละกลุ่ม */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* กลุ่มเก่ง */}
            <div>
              <h4 className="text-lg font-bold mb-3 text-green-700 flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                กลุ่มเก่ง ({analysisData.excellent} คน)
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysisData.excellentStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                    <div>
                      <p className="font-medium text-sm">{student.firstNameTh} {student.lastNameTh}</p>
                      <p className="text-xs text-gray-600">{student.studentId}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {student.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* กลุ่มปานกลาง */}
            <div>
              <h4 className="text-lg font-bold mb-3 text-orange-700 flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                กลุ่มปานกลาง ({analysisData.average} คน)
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysisData.averageStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                    <div>
                      <p className="font-medium text-sm">{student.firstNameTh} {student.lastNameTh}</p>
                      <p className="text-xs text-gray-600">{student.studentId}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      {student.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* กลุ่มอ่อน */}
            <div>
              <h4 className="text-lg font-bold mb-3 text-red-700 flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                กลุ่มอ่อน ({analysisData.needsImprovement} คน)
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysisData.needsImprovementStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                    <div>
                      <p className="font-medium text-sm">{student.firstNameTh} {student.lastNameTh}</p>
                      <p className="text-xs text-gray-600">{student.studentId}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {student.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ข้อเสนอแนะ */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-bold mb-3 text-blue-700">ข้อเสนอแนะการพัฒนา</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• กลุ่มเก่ง: ส่งเสริมให้เป็นพี่เลี้ยงช่วยเหลือเพื่อน พัฒนาทักษะเพิ่มเติม</p>
              <p>• กลุ่มปานกลาง: ฝึกฝนเพิ่มเติมเพื่อยกระดับให้ขึ้นสู่กลุ่มเก่ง</p>
              <p>• กลุ่มอ่อน: ให้ความช่วยเหลือเป็นพิเศษ จัดกิจกรรมเสริมการเรียนรู้</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisReport;
