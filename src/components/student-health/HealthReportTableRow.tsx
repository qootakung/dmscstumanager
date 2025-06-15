
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { StudentHealthDetails } from '@/types/student';
import {
  calculateBMI,
  calculateHeightForAge,
  calculateWeightForAge,
  calculateWeightForHeight,
  evaluateHealthByAge
} from '@/utils/healthCalculations';

interface HealthReportTableRowProps {
  record: StudentHealthDetails;
  index: number;
}

const HealthReportTableRow: React.FC<HealthReportTableRowProps> = ({ record, index }) => {
  const bmi = calculateBMI(record.weight_kg, record.height_cm);
  const healthEvaluation = evaluateHealthByAge(bmi, record.age_years);
  const heightForAgeEvaluation = calculateHeightForAge(record.age_years, record.height_cm);
  const weightForAgeEvaluation = calculateWeightForAge(record.age_years, record.weight_kg, record.height_cm);
  const weightForHeightEvaluation = calculateWeightForHeight(record.height_cm, record.weight_kg);

  return (
    <TableRow key={record.record_id}>
      <TableCell className="text-center">{index + 1}</TableCell>
      <TableCell>{record.full_name}</TableCell>
      <TableCell className="text-center">-</TableCell>
      <TableCell className="text-center">{record.age_years}</TableCell>
      <TableCell className="text-center">{record.weight_kg?.toFixed(2) ?? '-'}</TableCell>
      <TableCell className="text-center">{record.height_cm?.toFixed(2) ?? '-'}</TableCell>
      <TableCell className="text-center">{bmi ? bmi.toFixed(2) : '-'}</TableCell>
      <TableCell className="text-center">{weightForAgeEvaluation}</TableCell>
      <TableCell className="text-center">{healthEvaluation}</TableCell>
      <TableCell className="text-center">{heightForAgeEvaluation}</TableCell>
      <TableCell className="text-center">สูงตามเกณฑ์</TableCell>
      <TableCell className="text-center">{weightForHeightEvaluation}</TableCell>
      <TableCell className="text-center">ปกติ</TableCell>
    </TableRow>
  );
};

export default HealthReportTableRow;
