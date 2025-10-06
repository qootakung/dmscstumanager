
import React from "react";
import StudentTable from "./StudentTable";
import SignatureSection from "./SignatureSection";
import PrintHeader from "./print/PrintHeader";
import PrintPaymentTypes from "./print/PrintPaymentTypes";
import PrintGradeLevel from "./print/PrintGradeLevel";
import PrintStudentSummary from "./print/PrintStudentSummary";
import type { PaymentVoucherData } from "@/types/finance";

interface PrintPreviewStaticProps {
  voucherData: PaymentVoucherData;
  paymentOptions: string[];
}

const PrintPreviewStatic = React.forwardRef<HTMLDivElement, PrintPreviewStaticProps>(({ voucherData, paymentOptions }, ref) => {
  return (
    <div ref={ref} style={{
      fontFamily: "'TH Sarabun', 'Sarabun', Arial, sans-serif",
      fontSize: "11px",
      color: "black",
      padding: "12px",
      maxHeight: "297mm",
      width: "210mm",
      boxSizing: "border-box",
      overflow: "hidden"
    }}>
      <PrintHeader
        semester={voucherData.semester}
        academicYear={voucherData.academicYear}
      />

      <PrintPaymentTypes
        paymentTypes={voucherData.paymentTypes}
        paymentOptions={paymentOptions}
      />

      {/* Divider */}
      <div style={{ width: "100%", borderBottom: "2px dashed #444", margin: "6px 0" }}></div>

      <PrintGradeLevel grade={voucherData.grade} />
      
      <PrintStudentSummary 
        studentCount={voucherData.students.length}
        schoolName={voucherData.schoolName}
      />

      {/* Student Table */}
      <div style={{ marginBottom: 6 }}>
        <StudentTable 
          students={voucherData.students} 
          amountPerStudent={voucherData.amountPerStudent}
          paymentDate={voucherData.paymentDate}
          isFirstPage={true}
          startIndex={0}
        />
      </div>

      <SignatureSection
        payerName={voucherData.payerName}
        teacherName={
          voucherData.selectedTeacher
            ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}`
            : ""
        }
        principalName={voucherData.principalName}
      />
    </div>
  );
});

PrintPreviewStatic.displayName = "PrintPreviewStatic";

export default PrintPreviewStatic;
