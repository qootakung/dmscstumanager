
import React from "react";
import type { Student } from "@/types/student";
import type { Teacher } from "@/types/teacher";
import StudentTable from "./StudentTable";
import SignatureSection from "./SignatureSection";
import PrintHeader from "./print/PrintHeader";
import PrintPaymentTypes from "./print/PrintPaymentTypes";
import PrintGradeLevel from "./print/PrintGradeLevel";
import PrintStudentSummary from "./print/PrintStudentSummary";

interface PrintPreviewStaticProps {
  voucherData: {
    paymentTypes: string[];
    academicYear: string;
    semester: string;
    grade: string;
    students: Student[];
    schoolName: string;
    principalName: string;
    managerName: string;
    selectedTeacher: Teacher | null;
    payerName: string;
    amountPerStudent: string;
    paymentDate: string;
  };
  paymentOptions: string[];
}

const PrintPreviewStatic = ({ voucherData, paymentOptions }: PrintPreviewStaticProps) => {

  return (
    <div style={{
      fontFamily: "'TH Sarabun', 'Sarabun', Arial, sans-serif",
      fontSize: "14px",
      padding: "24px",
      color: "black"
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
      <div style={{ width: "100%", borderBottom: "2px dashed #444", margin: "12px 0" }}></div>

      <PrintGradeLevel grade={voucherData.grade} />
      
      <PrintStudentSummary 
        studentCount={voucherData.students.length}
        schoolName={voucherData.schoolName}
      />

      {/* ตารางนักเรียน */}
      <div style={{ marginBottom: 12 }}>
        <StudentTable 
          students={voucherData.students} 
          amountPerStudent={voucherData.amountPerStudent}
          paymentDate={voucherData.paymentDate}
        />
      </div>

      {/* ลายเซ็น */}
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
};

export default PrintPreviewStatic;
