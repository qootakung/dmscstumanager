
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
  const studentsPerPage = 15;
  const totalStudents = voucherData.students.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  
  // Create pages array
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * studentsPerPage;
    const endIndex = Math.min(startIndex + studentsPerPage, totalStudents);
    pages.push({
      students: voucherData.students.slice(startIndex, endIndex),
      startIndex,
      isFirstPage: i === 0,
      pageNumber: i + 1
    });
  }

  // If no students, show at least one page
  if (totalStudents === 0) {
    pages.push({
      students: [],
      startIndex: 0,
      isFirstPage: true,
      pageNumber: 1
    });
  }

  return (
    <div ref={ref} style={{
      fontFamily: "'TH Sarabun', 'Sarabun', Arial, sans-serif",
      fontSize: "12px",
      color: "black"
    }}>
      {pages.map((page, pageIndex) => (
        <div key={pageIndex} style={{ 
          padding: "16px",
          minHeight: "297mm", // A4 height
          width: "210mm", // A4 width
          pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
          boxSizing: "border-box"
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
          <div style={{ width: "100%", borderBottom: "2px dashed #444", margin: "8px 0" }}></div>

          <PrintGradeLevel grade={voucherData.grade} />
          
          <PrintStudentSummary 
            studentCount={voucherData.students.length}
            schoolName={voucherData.schoolName}
          />

          {/* Student Table */}
          <div style={{ marginBottom: 8 }}>
            <StudentTable 
              students={page.students} 
              amountPerStudent={voucherData.amountPerStudent}
              paymentDate={voucherData.paymentDate}
              isFirstPage={page.isFirstPage}
              startIndex={page.startIndex}
            />
          </div>

          {/* Show signatures on last page only */}
          {(pageIndex === pages.length - 1) && (
            <SignatureSection
              payerName={voucherData.payerName}
              teacherName={
                voucherData.selectedTeacher
                  ? `${voucherData.selectedTeacher.firstName} ${voucherData.selectedTeacher.lastName}`
                  : ""
              }
              principalName={voucherData.principalName}
            />
          )}

          {/* Page number for multi-page documents */}
          {totalPages > 1 && (
            <div style={{ 
              position: "absolute", 
              bottom: "10px", 
              right: "20px", 
              fontSize: "10px",
              color: "#666"
            }}>
              หน้า {page.pageNumber} จาก {totalPages}
            </div>
          )}
        </div>
      ))}
      
      {/* Summary page for total if more than one page */}
      {totalPages > 1 && (
        <div style={{ 
          padding: "16px",
          minHeight: "297mm",
          width: "210mm",
          boxSizing: "border-box",
          pageBreakBefore: "always"
        }}>
          <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", marginBottom: "20px" }}>
            สรุปรวมทั้งหมด
          </div>
          
          <PrintHeader
            semester={voucherData.semester}
            academicYear={voucherData.academicYear}
          />
          
          <PrintGradeLevel grade={voucherData.grade} />
          
          <div style={{ marginTop: "20px", fontSize: "14px" }}>
            <p>จำนวนนักเรียนทั้งหมด: {totalStudents} คน</p>
            <p>จำนวนเงินต่อคน: {parseFloat(voucherData.amountPerStudent || '0').toLocaleString('th-TH')} บาท</p>
            <p style={{ fontWeight: "bold", fontSize: "16px" }}>
              รวมเงินทั้งหมด: {(parseFloat(voucherData.amountPerStudent || '0') * totalStudents).toLocaleString('th-TH')} บาท
            </p>
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
      )}
    </div>
  );
});

PrintPreviewStatic.displayName = "PrintPreviewStatic";

export default PrintPreviewStatic;
