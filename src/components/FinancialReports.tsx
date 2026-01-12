
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentTypeSelection from './Finance/form/PaymentTypeSelection';
import AcademicInfoSection from './Finance/form/AcademicInfoSection';
import GradeSelection from './Finance/form/GradeSelection';
import SignatureFields from './Finance/form/SignatureFields';
import SchoolInfoSection from './Finance/form/SchoolInfoSection';
import { Button } from '@/components/ui/button';
import PrintPreviewStatic from './Finance/PrintPreviewStatic';
import { useFinancialVoucher } from '@/hooks/useFinancialVoucher';
import PaymentDetailsSection from './Finance/form/PaymentDetailsSection';
import StudentCountInfo from './Finance/form/StudentCountInfo';
import { Printer, Eye, UserPlus } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import PrintPreviewDialog from './Finance/PrintPreviewDialog';
import StudentSelectionDialog from './Finance/StudentSelectionDialog';
import type { Student } from '@/types/student';

const FinancialReports = () => {
  const {
    teachers,
    selectedGrade,
    voucherData,
    paymentOptions,
    grades,
    setVoucherData,
    handlePaymentTypeChange,
    handleGradeChange,
    handleTeacherSelect,
    handleAutoFillPrincipal,
    handlePreview,
  } = useFinancialVoucher();

  const printRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showStudentSelection, setShowStudentSelection] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `หลักฐานการจ่ายเงิน-${voucherData.grade}-${voucherData.academicYear}-${voucherData.semester}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 1cm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          font-family: 'TH Sarabun', 'Sarabun', Arial, sans-serif !important;
          font-size: 15px !important;
        }
        table, th, td {
          border: 1px solid #000000 !important;
          border-collapse: collapse !important;
          font-size: 15px !important;
        }
        th {
          background-color: #f3f4f6 !important;
          font-size: 14px !important;
          font-weight: bold !important;
        }
        .page-break {
          page-break-before: always;
        }
        /* Ensure consistent font sizes */
        * {
          font-size: inherit !important;
        }
        /* Header styling */
        div[style*="18px"] {
          font-size: 18px !important;
        }
        div[style*="15px"] {
          font-size: 15px !important;
        }
        div[style*="14px"] {
          font-size: 14px !important;
        }
      }
    `,
    onAfterPrint: () => {
      toast({
        title: "พิมพ์เอกสารสำเร็จ",
        description: "สามารถนำเอกสารไปใช้งานต่อได้",
      });
    },
    onPrintError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาดขณะพิมพ์",
        description: "ไม่สามารถพิมพ์เอกสารได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      console.error("Print Error:", error);
    }
  });

  const handlePrintClick = () => {
    if (handlePreview()) {
      handlePrint();
    }
  };

  const handlePreviewClick = () => {
    if (handlePreview()) {
      setShowPreview(true);
    }
  };

  const handleStudentsSelected = (selectedStudents: Student[]) => {
    setVoucherData(prev => ({
      ...prev,
      students: selectedStudents,
      // Update grade based on selected students if "ค่าจัดการเรียนการสอน" is selected
      grade: prev.paymentTypes.includes('ค่าจัดการเรียนการสอน (ปัจจัยพื้นฐานสำหรับการรับนักเรียนยากจน)') 
        ? getGradeDisplayFromStudents(selectedStudents)
        : prev.grade
    }));
    
    toast({
      title: "เลือกนักเรียนสำเร็จ",
      description: `เลือกนักเรียนแล้ว ${selectedStudents.length} คน`,
    });
  };

  // Function to generate grade display from selected students
  const getGradeDisplayFromStudents = (students: Student[]): string => {
    if (students.length === 0) return '';
    
    const gradeGroups: { [key: string]: string[] } = {};
    
    students.forEach(student => {
      if (student.grade) {
        // Kindergarten can be stored as "อ.1" or "อนุบาล 1"
        if (student.grade.startsWith('อนุบาล') || student.grade.startsWith('อ.')) {
          if (!gradeGroups['อนุบาล']) gradeGroups['อนุบาล'] = [];
          const number = student.grade.startsWith('อ.')
            ? student.grade.replace('อ.', '')
            : student.grade.replace('อนุบาล ', '');
          if (!gradeGroups['อนุบาล'].includes(number)) {
            gradeGroups['อนุบาล'].push(number);
          }
        } else if (student.grade.startsWith('ป.')) {
          if (!gradeGroups['ประถม']) gradeGroups['ประถม'] = [];
          const number = student.grade.replace('ป.', '');
          if (!gradeGroups['ประถม'].includes(number)) {
            gradeGroups['ประถม'].push(number);
          }
        } else if (student.grade.startsWith('ม.')) {
          if (!gradeGroups['มัธยม']) gradeGroups['มัธยม'] = [];
          const number = student.grade.replace('ม.', '');
          if (!gradeGroups['มัธยม'].includes(number)) {
            gradeGroups['มัธยม'].push(number);
          }
        }
      }
    });

    const gradeTexts: string[] = [];
    
    if (gradeGroups['อนุบาล']) {
      gradeGroups['อนุบาล'].sort();
      gradeTexts.push(`อนุบาลปีที่ ${gradeGroups['อนุบาล'].join(',')}`);
    }
    
    if (gradeGroups['ประถม']) {
      gradeGroups['ประถม'].sort();
      gradeTexts.push(`ประถมศึกษาปีที่ ${gradeGroups['ประถม'].join(',')}`);
    }
    
    if (gradeGroups['มัธยม']) {
      gradeGroups['มัธยม'].sort();
      gradeTexts.push(`มัธยมศึกษาปีที่ ${gradeGroups['มัธยม'].join(',')}`);
    }

    return gradeTexts.join(', ');
  };

  const handlePaymentTypeChangeWrapper = (paymentTypes: string[]) => {
    setVoucherData(prev => ({ ...prev, paymentTypes }));
    
    // If "ค่าจัดการเรียนการสอน" is selected, update grade display
    if (paymentTypes.includes('ค่าจัดการเรียนการสอน (ปัจจัยพื้นฐานสำหรับการรับนักเรียนยากจน)')) {
      const gradeDisplay = getGradeDisplayFromStudents(voucherData.students);
      if (gradeDisplay) {
        setVoucherData(prev => ({ ...prev, grade: gradeDisplay }));
      }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">รายงานการเงิน</h2>
          <p className="text-muted-foreground">
            ระบบพิมพ์หลักฐานการจ่ายเงิน
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>หลักฐานการจ่ายเงิน</CardTitle>
          <CardDescription>
            เลือกประเภทการจ่ายเงินและข้อมูลที่ต้องการพิมพ์
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentTypeSelection
            paymentOptions={paymentOptions}
            selectedPaymentTypes={voucherData.paymentTypes}
            onPaymentTypeChange={handlePaymentTypeChangeWrapper}
          />
          
          <AcademicInfoSection
            academicYear={voucherData.academicYear}
            semester={voucherData.semester}
            onAcademicYearChange={(value) => setVoucherData(prev => ({ ...prev, academicYear: value }))}
            onSemesterChange={(value) => setVoucherData(prev => ({ ...prev, semester: value }))}
          />

          <GradeSelection
            grades={grades}
            selectedGrade={selectedGrade}
            onGradeChange={handleGradeChange}
          />

          <PaymentDetailsSection
            paymentDate={voucherData.paymentDate}
            amountPerStudent={voucherData.amountPerStudent}
            onPaymentDateChange={(value) => setVoucherData(prev => ({ ...prev, paymentDate: value }))}
            onAmountPerStudentChange={(value) => setVoucherData(prev => ({ ...prev, amountPerStudent: value }))}
          />

          <StudentCountInfo 
            grade={voucherData.grade}
            studentCount={voucherData.students.length}
          />

          {/* Student Selection Button */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-medium">รายชื่อนักเรียน</h3>
                <p className="text-sm text-gray-600">
                  {voucherData.students.length > 0 
                    ? `เลือกนักเรียนแล้ว ${voucherData.students.length} คน`
                    : 'ยังไม่ได้เลือกนักเรียน'
                  }
                </p>
              </div>
              <Button 
                onClick={() => setShowStudentSelection(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                เลือกนักเรียนเพิ่มเติม
              </Button>
            </div>
            
            {voucherData.students.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid gap-2">
                  {voucherData.students.slice(0, 10).map((student, index) => (
                    <div key={student.id} className="flex justify-between items-center text-sm">
                      <span>
                        {index + 1}. {student.titleTh || ''} {student.firstNameTh} {student.lastNameTh}
                      </span>
                      <span className="text-gray-500">
                        {student.grade} ({student.academicYear})
                      </span>
                    </div>
                  ))}
                  {voucherData.students.length > 10 && (
                    <div className="text-sm text-gray-500 text-center pt-2">
                      และอีก {voucherData.students.length - 10} คน
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <SignatureFields
            teachers={teachers}
            payerName={voucherData.payerName}
            selectedTeacher={voucherData.selectedTeacher}
            onPayerNameChange={(value) => setVoucherData(prev => ({ ...prev, payerName: value }))}
            onTeacherChange={handleTeacherSelect}
          />

          <SchoolInfoSection
            principalName={voucherData.principalName}
            onPrincipalNameChange={(value) => setVoucherData(prev => ({ ...prev, principalName: value }))}
            onAutoFillPrincipal={handleAutoFillPrincipal}
          />

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button 
              onClick={handlePreviewClick} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              ดูตัวอย่างก่อนพิมพ์
            </Button>
            <Button onClick={handlePrintClick} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              พิมพ์เอกสาร
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Hidden print component */}
      <div style={{ display: 'none' }}>
        <PrintPreviewStatic ref={printRef} voucherData={voucherData} paymentOptions={paymentOptions} />
      </div>

      {/* Preview Dialog */}
      <PrintPreviewDialog
        isOpen={showPreview}
        onOpenChange={setShowPreview}
        voucherData={voucherData}
        paymentOptions={paymentOptions}
      />

      {/* Student Selection Dialog */}
      <StudentSelectionDialog
        isOpen={showStudentSelection}
        onOpenChange={setShowStudentSelection}
        onStudentsSelected={handleStudentsSelected}
        selectedStudents={voucherData.students}
        selectedGrade={selectedGrade}
      />
    </div>
  );
};

export default FinancialReports;
