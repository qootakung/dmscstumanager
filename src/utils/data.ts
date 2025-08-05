
// Generate academic years from 2567 to 2587
export const generateAcademicYears = (): string[] => {
  const years: string[] = [];
  for (let year = 2567; year <= 2587; year++) {
    years.push(`${year}`);
  }
  return years;
};

export const gradeOptions = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
