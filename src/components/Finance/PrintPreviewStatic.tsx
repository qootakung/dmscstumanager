import React from "react";
import type { Student } from "@/types/student";
import type { Teacher } from "@/types/teacher";
import StudentTable from "./StudentTable";
import SignatureSection from "./SignatureSection";

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
  };
  paymentOptions: string[];
}

const levels = [
  { key: "อนุบาล", label: "อนุบาลปีที่", grades: ["อนุบาล 1", "อนุบาล 2", "อนุบาล 3"] },
  { key: "ประถม", label: "ประถมศึกษาปีที่", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] },
  { key: "มัธยม", label: "มัธยมศึกษาปีที่", grades: ["ม.1", "ม.2", "ม.3"] },
  { key: "ปวช", label: "ปวช. ที่จัดโดยสถานประกอบการ ปีที่", grades: ["ปวช.1", "ปวช.2", "ปวช.3"] },
];

const getSelectedLevel = (selectedGrade: string) => {
  for (const level of levels) {
    if (level.grades.includes(selectedGrade)) {
      let gradeNumber = "";
      const match = selectedGrade.match(/(\d+)$/);
      if (match) gradeNumber = match[1];
      return { ...level, selectedGrade, gradeNumber };
    }
  }
  return null;
};

const PrintPreviewStatic = ({ voucherData, paymentOptions }: PrintPreviewStaticProps) => {
  const selectedLevel = getSelectedLevel(voucherData.grade);

  return (
    <div style={{
      fontFamily: "'Sarabun', Arial, sans-serif",
      fontSize: "18px",
      padding: "24px"
    }}>
      {/* ส่วนหัว */}
      <div className="text-center font-bold text-xl mb-2">แบบหลักฐานการจ่ายเงิน</div>
      <div className="flex justify-center items-center gap-2 mb-1" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span>ภาคเรียนที่</span>
        <span style={{
          display: "inline-block",
          borderBottom: "1px dotted #000",
          width: 56,
          textAlign: "center"
        }}>{voucherData.semester}</span>
        <span className="ml-4">ปีการศึกษา</span>
        <span style={{
          display: "inline-block",
          borderBottom: "1px dotted #000",
          width: 80,
          textAlign: "center"
        }}>{voucherData.academicYear}</span>
      </div>

      {/* Checkbox rows */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 32, rowGap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #000",
              borderRadius: 4,
              width: 24, height: 24,
              marginRight: 8
            }}>
              {voucherData.paymentTypes.includes(paymentOptions[0]) && (
                <span style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  background: "#059669",
                  margin: 1,
                  borderRadius: 2,
                  position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>ค่าอุปกรณ์การเรียน</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #000",
              borderRadius: 4,
              width: 24, height: 24,
              marginRight: 8
            }}>
              {voucherData.paymentTypes.includes(paymentOptions[2]) && (
                <span style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  background: "#059669",
                  margin: 1,
                  borderRadius: 2,
                  position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>ค่าจัดการเรียนการสอน (ปัจจัยพื้นฐานสำหรับการรับนักเรียนยากจน)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #000",
              borderRadius: 4,
              width: 24, height: 24,
              marginRight: 8
            }}>
              {voucherData.paymentTypes.includes(paymentOptions[4]) && (
                <span style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  background: "#059669",
                  margin: 1,
                  borderRadius: 2,
                  position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>ค่าอุปกรณ์การเรียน (เพิ่มเติม)</span>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #000",
              borderRadius: 4,
              width: 24, height: 24,
              marginRight: 8
            }}>
              {voucherData.paymentTypes.includes(paymentOptions[1]) && (
                <span style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  background: "#059669",
                  margin: 1,
                  borderRadius: 2,
                  position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>ค่าเครื่องแบบนักเรียน</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #000",
              borderRadius: 4,
              width: 24, height: 24,
              marginRight: 8
            }}>
              {voucherData.paymentTypes.includes(paymentOptions[3]) && (
                <span style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  background: "#059669",
                  margin: 1,
                  borderRadius: 2,
                  position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>ค่าเครื่องแบบนักเรียน (เพิ่มเติม)</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: "100%", borderBottom: "2px dashed #444", margin: "12px 0" }}></div>

      {/* Grade Level row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 48, marginBottom: 10
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #000", borderRadius: 4, width: 24, height: 24, marginRight: 8
            }}>
              {selectedLevel && selectedLevel.key === "อนุบาล" && (
                <span style={{
                  display: "inline-block",
                  width: 18, height: 18,
                  background: "#059669", margin: 1,
                  borderRadius: 2, position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>อนุบาลปีที่</span>
            <span style={{
              display: "inline-block",
              borderBottom: "1px dotted #000",
              width: 48,
              marginLeft: 8, marginRight: 8,
              textAlign: "center"
            }}>{selectedLevel && selectedLevel.key === "อนุบาล" ? selectedLevel.gradeNumber : ""}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #000", borderRadius: 4, width: 24, height: 24, marginRight: 8
            }}>
              {selectedLevel && selectedLevel.key === "มัธยม" && (
                <span style={{
                  display: "inline-block",
                  width: 18, height: 18,
                  background: "#059669", margin: 1,
                  borderRadius: 2, position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>มัธยมศึกษาปีที่</span>
            <span style={{
              display: "inline-block",
              borderBottom: "1px dotted #000",
              width: 48,
              marginLeft: 8, marginRight: 8,
              textAlign: "center"
            }}>{selectedLevel && selectedLevel.key === "มัธยม" ? selectedLevel.gradeNumber : ""}</span>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #000", borderRadius: 4, width: 24, height: 24, marginRight: 8
            }}>
              {selectedLevel && selectedLevel.key === "ประถม" && (
                <span style={{
                  display: "inline-block",
                  width: 18, height: 18,
                  background: "#059669", margin: 1,
                  borderRadius: 2, position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>ประถมศึกษาปีที่</span>
            <span style={{
              display: "inline-block",
              borderBottom: "1px dotted #000",
              width: 48,
              marginLeft: 8, marginRight: 8,
              textAlign: "center"
            }}>{selectedLevel && selectedLevel.key === "ประถม" ? selectedLevel.gradeNumber : ""}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #000", borderRadius: 4, width: 24, height: 24, marginRight: 8
            }}>
              {selectedLevel && selectedLevel.key === "ปวช" && (
                <span style={{
                  display: "inline-block",
                  width: 18, height: 18,
                  background: "#059669", margin: 1,
                  borderRadius: 2, position: "relative"
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                    <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                  </svg>
                </span>
              )}
            </span>
            <span>ปวช. ที่จัดโดยสถานประกอบการ ปีที่</span>
            <span style={{
              display: "inline-block",
              borderBottom: "1px dotted #000",
              width: 48,
              marginLeft: 8, marginRight: 8,
              textAlign: "center"
            }}>{selectedLevel && selectedLevel.key === "ปวช" ? selectedLevel.gradeNumber : ""}</span>
          </div>
        </div>
      </div>

      {/* Student summary */}
      <div style={{ marginBottom: 6 }}>
        <span>นักเรียนจำนวนทั้งสิ้น</span>
        <span style={{
          display: "inline-block",
          borderBottom: "1px dotted #000",
          width: 32,
          marginLeft: 5,
          marginRight: 5,
          textAlign: "center"
        }}>{voucherData.students.length}</span>
        <span>คน ได้รับเงินจากโรงเรียน{voucherData.schoolName}</span>
      </div>
      <div style={{ marginBottom: 10 }}>
        <span>
          สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาลำพูนเขต 2 <br />
          ข้าพเจ้าขอรับรองว่าเงินที่ได้รับไปได้นำไปตามวัตถุประสงค์ของทางราชการ หากไม่ดำเนินการดังกล่าวข้าพเจ้ายินยอมชดใช้เงินคืนให้กับโรงเรียนต่อไป
        </span>
      </div>

      {/* ตารางนักเรียน */}
      <div style={{ marginBottom: 12 }}>
        <StudentTable students={voucherData.students} />
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
