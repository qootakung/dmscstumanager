
import React from 'react';

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

interface PrintGradeLevelProps {
  grade: string;
}

const GradeLevelRow: React.FC<{ label: string; checked: boolean; gradeNumber: string }> = ({ label, checked, gradeNumber }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            border: "1px solid #000", borderRadius: 2, width: 16, height: 16, marginRight: 8
        }}>
            {checked && (
                <span style={{
                    display: "inline-block", width: 12, height: 12,
                    background: "#059669", margin: 1, borderRadius: 1, position: "relative"
                }}>
                    <svg width="12" height="12" viewBox="0 0 18 18" style={{ display: "block" }}>
                        <polyline points="3,10 8,15 15,5" style={{ fill: "none", stroke: "white", strokeWidth: 3 }} />
                    </svg>
                </span>
            )}
        </span>
        <span>{label}</span>
        <span style={{
            display: "inline-block", borderBottom: "1px dotted #000",
            width: 48, marginLeft: 8, marginRight: 8, textAlign: "center"
        }}>{checked ? gradeNumber : ""}</span>
    </div>
);


const PrintGradeLevel: React.FC<PrintGradeLevelProps> = ({ grade }) => {
  const selectedLevel = getSelectedLevel(grade);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ marginRight: 16, paddingTop: '4px' }}>ระดับชั้น</span>
        <div style={{
            display: "grid", gridTemplateColumns: "auto auto", columnGap: 24, rowGap: 4, flexGrow: 1
        }}>
            <GradeLevelRow
            label="อนุบาลปีที่"
            checked={!!(selectedLevel && selectedLevel.key === "อนุบาล")}
            gradeNumber={selectedLevel?.gradeNumber || ""}
            />
            <GradeLevelRow
            label="ประถมศึกษาปีที่"
            checked={!!(selectedLevel && selectedLevel.key === "ประถม")}
            gradeNumber={selectedLevel?.gradeNumber || ""}
            />
            <GradeLevelRow
            label="มัธยมศึกษาปีที่"
            checked={!!(selectedLevel && selectedLevel.key === "มัธยม")}
            gradeNumber={selectedLevel?.gradeNumber || ""}
            />
            <GradeLevelRow
            label="ปวช. ที่จัดโดยสถานประกอบการ ปีที่"
            checked={!!(selectedLevel && selectedLevel.key === "ปวช")}
            gradeNumber={selectedLevel?.gradeNumber || ""}
            />
        </div>
    </div>
  );
};

export default PrintGradeLevel;
