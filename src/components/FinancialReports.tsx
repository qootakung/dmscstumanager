
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="paymentDate">วันที่จ่ายเงิน</Label>
              <Input
                id="paymentDate"
                value={voucherData.paymentDate}
                onChange={(e) => setVoucherData(prev => ({ ...prev, paymentDate: e.target.value }))}
                placeholder="เช่น 18 มิ.ย. 68"
              />
            </div>
            <div>
              <Label htmlFor="amountPerStudent">จำนวนเงิน (ต่อคน)</Label>
              <Input
                id="amountPerStudent"
                type="number"
                value={voucherData.amountPerStudent}
                onChange={(e) => setVoucherData(prev => ({ ...prev, amountPerStudent: e.target.value }))}
                placeholder="ระบุจำนวนเงิน"
              />
            </div>
          </div>

          {voucherData.students.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                {voucherData.grade === "ทุกระดับชั้น" ? (
                  <>จำนวนนักเรียนทั้งหมด: {voucherData.students.length} คน</>
                ) : (
                  <>จำนวนนักเรียนในชั้น {voucherData.grade}: {voucherData.students.length} คน</>
                )}
              </p>
            </div>
          )}

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
