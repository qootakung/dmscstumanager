
// Utility functions for storing and retrieving column widths
export const saveColumnWidths = (reportType: string, widths: number[]) => {
  try {
    const key = `columnWidths_${reportType}`;
    localStorage.setItem(key, JSON.stringify(widths));
  } catch (error) {
    console.error('Failed to save column widths:', error);
  }
};

export const loadColumnWidths = (reportType: string, defaultWidths: number[]): number[] => {
  try {
    const key = `columnWidths_${reportType}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure the saved widths array has the same length as default
      if (Array.isArray(parsed) && parsed.length === defaultWidths.length) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load column widths:', error);
  }
  return defaultWidths;
};

// Utility functions for storing and retrieving column lock state
export const saveColumnsLocked = (reportType: string, isLocked: boolean) => {
  try {
    const key = `columnsLocked_${reportType}`;
    localStorage.setItem(key, JSON.stringify(isLocked));
  } catch (error) {
    console.error('Failed to save column lock state:', error);
  }
};

export const loadColumnsLocked = (reportType: string): boolean => {
  try {
    const key = `columnsLocked_${reportType}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) === true;
    }
  } catch (error) {
    console.error('Failed to load column lock state:', error);
  }
  return false;
};
