
import React from 'react';

const HealthReportStyles: React.FC = () => {
  return (
    <style>{`
      body { 
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @media print {
        @page {
          size: A4 landscape;
          margin: 1cm;
        }
        body {
          font-size: 8pt;
        }
        .p-4 {
           padding: 0 !important;
        }
        header {
          margin-bottom: 1rem !important;
        }
        h1, h2, h3 {
          font-size: 10pt;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 2px 4px !important;
          vertical-align: middle;
          font-size: 8pt !important;
        }
        th {
          background-color: #90EE90 !important;
          text-align: center;
          font-weight: bold;
        }
        td.text-center {
          text-align: center;
        }
        .bmi-header {
          background-color: #FFB6C1 !important;
        }
      }
    `}</style>
  );
};

export default HealthReportStyles;
