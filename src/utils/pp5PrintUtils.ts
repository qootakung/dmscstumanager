
// Utility for generating empty rows to fill A4 pages in PP5 print outputs

const TARGET_ROWS_PORTRAIT = 35; // typical A4 portrait row capacity
const MIN_EMPTY_ROWS = 15;

/**
 * Calculate how many empty rows to add after student data rows to fill A4 page
 */
export const getEmptyRowCount = (studentCount: number, targetRows = TARGET_ROWS_PORTRAIT): number => {
  const needed = targetRows - studentCount;
  return Math.max(needed, MIN_EMPTY_ROWS);
};

/**
 * Generate empty HTML table rows (string) for print windows
 * @param studentCount - number of actual student rows
 * @param colCount - number of columns in the table
 * @param startNumber - starting row number (studentCount + 1)
 * @param showRowNumber - whether to show row numbers in first column
 */
export const generateEmptyRowsHtml = (
  studentCount: number,
  colCount: number,
  showRowNumber = true,
  targetRows = TARGET_ROWS_PORTRAIT
): string => {
  const emptyCount = getEmptyRowCount(studentCount, targetRows);
  let html = '';
  for (let i = 0; i < emptyCount; i++) {
    const rowNum = studentCount + i + 1;
    const firstCell = showRowNumber 
      ? `<td class="text-center" style="color:#ccc">${rowNum}</td>` 
      : `<td></td>`;
    const emptyCells = Array(colCount - 1).fill('<td>&nbsp;</td>').join('');
    html += `<tr>${firstCell}${emptyCells}</tr>`;
  }
  return html;
};

/**
 * Generate empty React table row elements for print components
 */
export const generateEmptyRows = (
  studentCount: number,
  colCount: number,
  showRowNumber = true,
  targetRows = TARGET_ROWS_PORTRAIT
): React.ReactNode[] => {
  const emptyCount = getEmptyRowCount(studentCount, targetRows);
  const rows: React.ReactNode[] = [];
  // We return raw data, let the component create elements
  return rows;
};

/**
 * Get empty row data (count + start number) for React components
 */
export const getEmptyRowData = (
  studentCount: number,
  targetRows = TARGET_ROWS_PORTRAIT
): { count: number; startNumber: number } => {
  return {
    count: getEmptyRowCount(studentCount, targetRows),
    startNumber: studentCount + 1,
  };
};
