
import React from 'react';
import { StudentHealthDetails } from '@/types/student';

interface CategoryCounts {
  [key: string]: { male: number, female: number, total: number };
}

interface HealthStatisticsTableProps {
  title: string;
  data: StudentHealthDetails[];
  categories: CategoryCounts;
  categoryLabels: Array<{
    key: string;
    label: string;
    sdRange?: string;
    highlight?: boolean;
  }>;
  genderTotals: { male: number, female: number, total: number };
  totalStudents: number;
}

const HealthStatisticsTable: React.FC<HealthStatisticsTableProps> = ({
  title,
  categories,
  categoryLabels,
  genderTotals,
  totalStudents
}) => {
  const getPercentage = (count: number) => totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) : '0.00';
  const getCategoryCount = (category: string) => categories[category] || { male: 0, female: 0, total: 0 };

  return (
    <table className="w-full border-collapse border border-black mb-2 text-xs">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-black p-1 category-col" rowSpan={2}>{title}</th>
          <th className="border border-black p-1 gender-col">ชาย<br/>(คน)</th>
          <th className="border border-black p-1 gender-col">หญิง<br/>(คน)</th>
          <th className="border border-black p-1 total-col">รวม<br/>(คน)</th>
          <th className="border border-black p-1 percent-col">ภาวะโภชนาการ<br/>(%)</th>
          <th className="border border-black p-1 coverage-col">ความ<br/>ครอบคลุม<br/>(%)</th>
        </tr>
      </thead>
      <tbody>
        {categoryLabels.map((category, index) => {
          const count = getCategoryCount(category.key);
          const isHighlightRow = category.highlight;
          
          return (
            <tr key={index} className={isHighlightRow ? "highlight-row" : ""}>
              <td className={`border border-black p-1 ${isHighlightRow ? 'font-bold' : ''}`}>
                {category.label}
                {category.sdRange && ` (${category.sdRange})`}
              </td>
              <td className={`border border-black p-1 text-center ${isHighlightRow ? 'font-bold' : ''}`}>
                {count.male}
              </td>
              <td className={`border border-black p-1 text-center ${isHighlightRow ? 'font-bold' : ''}`}>
                {count.female}
              </td>
              <td className={`border border-black p-1 text-center ${isHighlightRow ? 'font-bold' : ''}`}>
                {count.total}
              </td>
              <td className="border border-black p-1 text-center">
                {isHighlightRow ? '' : getPercentage(count.total)}
              </td>
              <td className={`border border-black p-1 text-center ${isHighlightRow ? 'font-bold' : ''}`}>
                {isHighlightRow ? '100.00' : ''}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default HealthStatisticsTable;
