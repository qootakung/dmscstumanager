
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentTypeSelection from './Finance/form/PaymentTypeSelection';
import AcademicInfoSection from './Finance/form/AcademicInfoSection';
import GradeSelection from './Finance/form/GradeSelection';
import SignatureFields from './Finance/form/SignatureFields';
import SchoolInfoSection from './Finance/form/SchoolInfoSection';
import { Button } from '@/components/ui/button';
import PrintPreviewDialog from './Finance/PrintPreviewDialog';
import { useFinancialVoucher } from '@/hooks/useFinancialVoucher';
import PaymentDetailsSection from './Finance/form/PaymentDetailsSection';
import StudentCountInfo from './Finance/form/StudentCountInfo';

const FinancialReports = () => {
  const {
    teachers,
    selectedGrade,
    isPreviewOpen,
    voucherData,
    paymentOptions,
    grades,
    setVoucherData,
    setIsPreviewOpen,
    handlePaymentTypeChange,
    handleGradeChange,
    handleTeacherSelect,
    handleAutoFillPrincipal,
    handlePreview,
  } = useFinancialVoucher();

  return (
    <div className="space-y-6">
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
            <Button onClick={handlePreview}>ตัวอย่างก่อนพิมพ์</Button>
          </div>
        </CardContent>
      </Card>
      
      <PrintPreviewDialog 
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        voucherData={voucherData}
        paymentOptions={paymentOptions}
      />
    </div>
  );
};

export default FinancialReports;
