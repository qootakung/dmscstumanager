
import React from 'react';

interface StudentCountInfoProps {
  grade: string;
  studentCount: number;
}

const StudentCountInfo: React.FC<StudentCountInfoProps> = ({ grade, studentCount }) => {
  if (studentCount === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-md">
      <p className="text-sm text-blue-700">
        {grade === "ทุกระดับชั้น" ? (
          <>จำนวนนักเรียนทั้งหมด: {studentCount} คน</>
        ) : (
          <>จำนวนนักเรียนในชั้น {grade}: {studentCount} คน</>
        )}
      </p>
    </div>
  );
};

export default StudentCountInfo;
