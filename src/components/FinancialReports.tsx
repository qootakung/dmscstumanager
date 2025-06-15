
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

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
  } = useFinancialVoucher();

  const printComponentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    // @ts-ignore - Bypassing a type error that seems incorrect for react-to-print v3
    content: () => {
      if (!printComponentRef.current) {
        toast({
          title: "ไม่พบเนื้อหาเอกสาร",
          description: "เนื้อหาสำหรับพิมพ์ไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
        return null;
      }
      return printComponentRef.current;
    },
    documentTitle: `หลักฐานการจ่ายเงิน-${voucherData.grade}-${voucherData.academicYear}_${voucherData.semester}`,
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
      }
    `,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      toast({
        title: "พิมพ์เอกสารสำเร็จ",
        description: "สามารถนำเอกสารไปใช้งานต่อได้",
      });
    },
    onPrintError: (errorLocation: string, error: Error) => {
      setIsPrinting(false);
      toast({
        title: "เกิดข้อผิดพลาดขณะพิมพ์",
        description: `ไม่สามารถพิมพ์เอกสารได้ โปรดลองใหม่ (${error.message})`,
        variant: "destructive",
      });
      console.error("Print Error:", errorLocation, error);
    }
  });

  const validateAndPrint = () => {
    if (voucherData.paymentTypes.length === 0) {
      toast({ title: 'ข้อมูลไม่ครบถ้วน', description: 'กรุณาเลือกประเภทการจ่ายเงิน', variant: 'destructive' });
      return;
    }
    if (!voucherData.grade) {
      toast({ title: 'ข้อมูลไม่ครบถ้วน', description: 'กรุณาเลือกชั้นเรียน', variant: 'destructive' });
      return;
    }
    handlePrint();
  };

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

          {/* New Preview Section */}
          {voucherData.students.length > 0 && (
            <div className="pt-6 mt-6 border-t">
              <div className="flex flex-row justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold leading-none tracking-tight">ตัวอย่างก่อนพิมพ์</h3>
                  <p className="text-sm text-muted-foreground mt-1">เอกสารที่จะถูกพิมพ์มีลักษณะดังนี้</p>
                </div>
                <Button onClick={validateAndPrint} disabled={isPrinting}>
                  <Printer className="mr-2 h-4 w-4" />
                  {isPrinting ? "กำลังเตรียมพิมพ์..." : "พิมพ์เอกสาร"}
                </Button>
              </div>
              <div className="p-4 sm:p-8 bg-gray-100 overflow-auto rounded-md">
                  <div className="p-6 bg-white shadow-lg mx-auto border max-w-4xl">
                      <PrintPreviewStatic ref={printComponentRef} voucherData={voucherData} paymentOptions={paymentOptions} />
                  </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;
