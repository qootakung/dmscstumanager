
import React, { useRef } from 'react';
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
import { Printer } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `หลักฐานการจ่ายเงิน-${voucherData.grade}-${voucherData.academicYear}-${voucherData.semester}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 1.5cm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        table, th, td {
          border: 1px solid #d1d5db !important;
          border-collapse: collapse !important;
        }
        th {
          background-color: #f3f4f6 !important;
        }
      }
    `,
    onBeforeGetContent: () => {
      return Promise.resolve();
    },
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
            onPaymentTypeChange={handlePaymentTypeChange}
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

          <div className="flex justify-end pt-6 mt-6 border-t">
            <Button onClick={handlePrintClick} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              พิมพ์เอกสาร
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {selectedGrade && voucherData.students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ตัวอย่างเอกสาร</CardTitle>
            <CardDescription>
              นี่คือตัวอย่างเอกสารที่จะถูกพิมพ์
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md bg-white">
              <PrintPreviewStatic ref={printRef} voucherData={voucherData} paymentOptions={paymentOptions} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialReports;
