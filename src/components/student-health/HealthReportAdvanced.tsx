
import React from 'react';
import { StudentHealthDetails } from '@/types/student';
import { Table, TableBody } from '@/components/ui/table';
import HealthReportStyles from './HealthReportStyles';
import HealthReportHeader from './HealthReportHeader';
import HealthReportTableHeader from './HealthReportTableHeader';
import HealthReportTableRow from './HealthReportTableRow';
import HealthReportNotes from './HealthReportNotes';

interface HealthReportAdvancedProps {
  data: StudentHealthDetails[];
  grade: string;
  month: string;
  academicYear: string;
}

const HealthReportAdvanced: React.FC<HealthReportAdvancedProps> = ({ data, grade, month, academicYear }) => {
  return (
    <div className="p-4 font-sarabun">
      <HealthReportStyles />
      <HealthReportHeader grade={grade} />
      
      <Table>
        <HealthReportTableHeader />
        <TableBody>
          {data.map((record, index) => (
            <HealthReportTableRow
              key={record.record_id}
              record={record}
              index={index}
            />
          ))}
        </TableBody>
      </Table>

      <HealthReportNotes />
    </div>
  );
};

export default HealthReportAdvanced;
