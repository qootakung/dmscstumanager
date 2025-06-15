
import React from "react";
import PaymentOptionCheckbox from "./PaymentOptionCheckbox";

interface GradeLevelRowProps {
  selectedLevel: {
    key: string;
    gradeNumber: string;
  } | null;
  studentsCount: number;
}

const gradeFields = [
  {
    key: "อนุบาล",
    label: "อนุบาลปีที่",
  },
  {
    key: "ประถม",
    label: "ประถมศึกษาปีที่",
  },
  {
    key: "มัธยม",
    label: "มัธยมศึกษาปีที่",
  },
  {
    key: "ปวช",
    label: "ปวช. ที่จัดโดยสถานประกอบการ ปีที่",
  },
];

const GradeLevelRow: React.FC<GradeLevelRowProps> = ({ selectedLevel, studentsCount }) => (
  <div className="grid grid-cols-2 gap-x-10 mb-2">
    {/* ฝั่งซ้าย */}
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <PaymentOptionCheckbox
          checked={selectedLevel?.key === "อนุบาล"}
          hideLabel
          boldCheck
          size="large"
          className="mr-1"
        />
        <span>{gradeFields[0].label}</span>
        <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
          {selectedLevel?.key === "อนุบาล" ? selectedLevel.gradeNumber : ""}
        </span>
      </div>
      <div className="flex items-center">
        <PaymentOptionCheckbox
          checked={selectedLevel?.key === "มัธยม"}
          hideLabel
          boldCheck
          size="large"
          className="mr-1"
        />
        <span>{gradeFields[2].label}</span>
        <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
          {selectedLevel?.key === "มัธยม" ? selectedLevel.gradeNumber : ""}
        </span>
      </div>
    </div>
    {/* ฝั่งขวา */}
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <PaymentOptionCheckbox
          checked={selectedLevel?.key === "ประถม"}
          hideLabel
          boldCheck
          size="large"
          className="mr-1"
        />
        <span>{gradeFields[1].label}</span>
        <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
          {selectedLevel?.key === "ประถม" ? selectedLevel.gradeNumber : ""}
        </span>
      </div>
      <div className="flex items-center">
        <PaymentOptionCheckbox
          checked={selectedLevel?.key === "ปวช"}
          hideLabel
          boldCheck
          size="large"
          className="mr-1"
        />
        <span>{gradeFields[3].label}</span>
        <span className="inline-block border-b border-dotted w-12 mx-1 text-center">
          {selectedLevel?.key === "ปวช" ? selectedLevel.gradeNumber : ""}
        </span>
      </div>
    </div>
  </div>
);

export default GradeLevelRow;
