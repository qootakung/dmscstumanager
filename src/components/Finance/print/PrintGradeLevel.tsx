
import React from 'react';
import type { Student } from '@/types/student';

interface GradeLevel {
  key: string;
  label: string;
  grades: string[];
}

const levels: GradeLevel[] = [
  { key: "อนุบาล", label: "อนุบาลปีที่", grades: ["อ.1", "อ.2", "อ.3", "อนุบาล 1", "อนุบาล 2", "อนุบาล 3"] },
  { key: "ประถม", label: "ประถมศึกษาปีที่", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] },
  { key: "มัธยม", label: "มัธยมศึกษาปีที่", grades: ["ม.1", "ม.2", "ม.3"] },
  { key: "ปวช", label: "ปวช. ที่จัดโดยสถานประกอบการ ปีที่", grades: ["ปวช.1", "ปวช.2", "ปวช.3"] },
];

// Get selected levels info based on students (handles mixed grades)
const getSelectedLevelsInfo = (students: Student[]) => {
  const result: { [key: string]: { numbers: Set<string>; count: number } } = {};

  students.forEach((student) => {
    const grade = student.grade;
    if (!grade) return;

    for (const level of levels) {
      if (level.grades.includes(grade)) {
        if (!result[level.key]) {
          result[level.key] = { numbers: new Set(), count: 0 };
        }
        // Extract grade number
        const match = grade.match(/(\d+)$/);
        if (match) {
          result[level.key].numbers.add(match[1]);
        }
        result[level.key].count++;
        break;
      }
    }
  });

  return result;
};

interface PrintGradeLevelProps {
  grade: string;
  students?: Student[];
}

const GradeLevelRow: React.FC<{
  label: string;
  checked: boolean;
  gradeNumbers: string;
  studentCount: number;
}> = ({ label, checked, gradeNumbers, studentCount }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
    {/* Checkbox */}
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #000",
        borderRadius: 2,
        width: 16,
        height: 16,
        marginRight: 8,
      }}
    >
      {checked && (
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 12,
            background: "#059669",
            margin: 1,
            borderRadius: 1,
            position: "relative",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 18 18"
            style={{ display: "block" }}
          >
            <polyline
              points="3,10 8,15 15,5"
              style={{ fill: "none", stroke: "white", strokeWidth: 3 }}
            />
          </svg>
        </span>
      )}
    </span>

    {/* Label */}
    <span>{label}</span>

    {/* Grade numbers */}
    <span
      style={{
        display: "inline-block",
        borderBottom: "1px dotted #000",
        width: 48,
        marginLeft: 8,
        marginRight: 8,
        textAlign: "center",
      }}
    >
      {checked ? gradeNumbers : ""}
    </span>

    {/* Student count */}
    <span style={{ marginLeft: 4, fontSize: 10, color: "#333" }}>
      {checked && studentCount > 0 ? `(${studentCount} คน)` : ""}
    </span>
  </div>
);

const PrintGradeLevel: React.FC<PrintGradeLevelProps> = ({ grade, students = [] }) => {
  // If we have students, use them to determine which levels are selected
  const levelsInfo = students.length > 0 ? getSelectedLevelsInfo(students) : null;

  // Fallback: if no students provided, use the grade prop
  const getFallbackInfo = (levelKey: string) => {
    if (!grade) return { checked: false, gradeNumbers: "", count: 0 };
    const level = levels.find((l) => l.key === levelKey);
    if (!level) return { checked: false, gradeNumbers: "", count: 0 };

    const isChecked = level.grades.includes(grade);
    if (isChecked) {
      const match = grade.match(/(\d+)$/);
      return { checked: true, gradeNumbers: match ? match[1] : "", count: 0 };
    }
    return { checked: false, gradeNumbers: "", count: 0 };
  };

  const getLevelInfo = (levelKey: string) => {
    if (levelsInfo && levelsInfo[levelKey]) {
      const info = levelsInfo[levelKey];
      const sortedNumbers = Array.from(info.numbers).sort((a, b) => parseInt(a) - parseInt(b));
      return {
        checked: true,
        gradeNumbers: sortedNumbers.join(","),
        count: info.count,
      };
    }
    return getFallbackInfo(levelKey);
  };

  const kindergartenInfo = getLevelInfo("อนุบาล");
  const primaryInfo = getLevelInfo("ประถม");
  const secondaryInfo = getLevelInfo("มัธยม");
  const vocationalInfo = getLevelInfo("ปวช");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 10 }}>
      <span style={{ marginRight: 16, paddingTop: "4px" }}>ระดับชั้น</span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          columnGap: 24,
          rowGap: 4,
          flexGrow: 1,
        }}
      >
        <GradeLevelRow
          label="อนุบาลปีที่"
          checked={kindergartenInfo.checked}
          gradeNumbers={kindergartenInfo.gradeNumbers}
          studentCount={kindergartenInfo.count}
        />
        <GradeLevelRow
          label="ประถมศึกษาปีที่"
          checked={primaryInfo.checked}
          gradeNumbers={primaryInfo.gradeNumbers}
          studentCount={primaryInfo.count}
        />
        <GradeLevelRow
          label="มัธยมศึกษาปีที่"
          checked={secondaryInfo.checked}
          gradeNumbers={secondaryInfo.gradeNumbers}
          studentCount={secondaryInfo.count}
        />
        <GradeLevelRow
          label="ปวช. ที่จัดโดยสถานประกอบการ ปีที่"
          checked={vocationalInfo.checked}
          gradeNumbers={vocationalInfo.gradeNumbers}
          studentCount={vocationalInfo.count}
        />
      </div>
    </div>
  );
};

export default PrintGradeLevel;
