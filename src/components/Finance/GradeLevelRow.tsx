
import React from "react";
import PaymentOptionCheckbox from "./PaymentOptionCheckbox";
import type { Student } from "@/types/student";

interface GradeLevelInfo {
  checked: boolean;
  gradeNumbers: string;
  count: number;
}

interface GradeLevelRowProps {
  students: Student[];
}

const levels = [
  { key: "อนุบาล", label: "อนุบาลปีที่", grades: ["อ.1", "อ.2", "อ.3", "อนุบาล 1", "อนุบาล 2", "อนุบาล 3"] },
  { key: "ประถม", label: "ประถมศึกษาปีที่", grades: ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"] },
  { key: "มัธยม", label: "มัธยมศึกษาปีที่", grades: ["ม.1", "ม.2", "ม.3"] },
  { key: "ปวช", label: "ปวช. ที่จัดโดยสถานประกอบการ ปีที่", grades: ["ปวช.1", "ปวช.2", "ปวช.3"] },
];

const getSelectedLevelsInfo = (students: Student[]): { [key: string]: GradeLevelInfo } => {
  const result: { [key: string]: { numbers: Set<string>; count: number } } = {};

  students.forEach((student) => {
    const grade = student.grade;
    if (!grade) return;

    for (const level of levels) {
      if (level.grades.includes(grade)) {
        if (!result[level.key]) {
          result[level.key] = { numbers: new Set(), count: 0 };
        }
        const match = grade.match(/(\d+)$/);
        if (match) {
          result[level.key].numbers.add(match[1]);
        }
        result[level.key].count++;
        break;
      }
    }
  });

  const finalResult: { [key: string]: GradeLevelInfo } = {};
  levels.forEach((level) => {
    if (result[level.key]) {
      const sortedNumbers = Array.from(result[level.key].numbers).sort((a, b) => parseInt(a) - parseInt(b));
      finalResult[level.key] = {
        checked: true,
        gradeNumbers: sortedNumbers.join(","),
        count: result[level.key].count,
      };
    } else {
      finalResult[level.key] = { checked: false, gradeNumbers: "", count: 0 };
    }
  });

  return finalResult;
};

const GradeLevelRow: React.FC<GradeLevelRowProps> = ({ students }) => {
  const levelsInfo = getSelectedLevelsInfo(students);

  return (
    <div className="grid grid-cols-2 gap-x-10 mb-2">
      {/* ฝั่งซ้าย */}
      <div className="flex flex-col gap-2">
        {/* อนุบาล */}
        <div className="flex items-center">
          <PaymentOptionCheckbox
            checked={levelsInfo["อนุบาล"].checked}
            hideLabel
            boldCheck
            size="large"
            className="mr-1"
          />
          <span>อนุบาลปีที่</span>
          <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
            {levelsInfo["อนุบาล"].gradeNumbers}
          </span>
          {levelsInfo["อนุบาล"].count > 0 && (
            <span className="text-xs text-gray-600">({levelsInfo["อนุบาล"].count} คน)</span>
          )}
        </div>
        {/* มัธยม */}
        <div className="flex items-center">
          <PaymentOptionCheckbox
            checked={levelsInfo["มัธยม"].checked}
            hideLabel
            boldCheck
            size="large"
            className="mr-1"
          />
          <span>มัธยมศึกษาปีที่</span>
          <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
            {levelsInfo["มัธยม"].gradeNumbers}
          </span>
          {levelsInfo["มัธยม"].count > 0 && (
            <span className="text-xs text-gray-600">({levelsInfo["มัธยม"].count} คน)</span>
          )}
        </div>
      </div>
      {/* ฝั่งขวา */}
      <div className="flex flex-col gap-2">
        {/* ประถม */}
        <div className="flex items-center">
          <PaymentOptionCheckbox
            checked={levelsInfo["ประถม"].checked}
            hideLabel
            boldCheck
            size="large"
            className="mr-1"
          />
          <span>ประถมศึกษาปีที่</span>
          <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
            {levelsInfo["ประถม"].gradeNumbers}
          </span>
          {levelsInfo["ประถม"].count > 0 && (
            <span className="text-xs text-gray-600">({levelsInfo["ประถม"].count} คน)</span>
          )}
        </div>
        {/* ปวช */}
        <div className="flex items-center">
          <PaymentOptionCheckbox
            checked={levelsInfo["ปวช"].checked}
            hideLabel
            boldCheck
            size="large"
            className="mr-1"
          />
          <span>ปวช. ที่จัดโดยสถานประกอบการ ปีที่</span>
          <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
            {levelsInfo["ปวช"].gradeNumbers}
          </span>
          {levelsInfo["ปวช"].count > 0 && (
            <span className="text-xs text-gray-600">({levelsInfo["ปวช"].count} คน)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeLevelRow;
