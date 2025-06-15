
export const calculateBMI = (weight: number | null, height: number | null) => {
  if (!weight || !height) return null;
  return weight / Math.pow(height / 100, 2);
};

export const getBMICategory = (bmi: number | null) => {
  if (!bmi) return 'no-data';
  
  if (bmi >= 30) return 'obese'; // >+2 SD
  if (bmi >= 25) return 'overweight'; // >+1.5 SD to +2 SD
  if (bmi >= 18.5) return 'normal'; // -1.5 SD to +1.5 SD
  if (bmi >= 16) return 'underweight'; // <-1.5 SD to -2 SD
  return 'severely-underweight'; // <-2 SD
};

export const getHeightCategory = (height: number | null, age: number) => {
  if (!height) return 'no-data';
  
  // Simplified height categories based on age (would need proper growth charts)
  const expectedHeight = 100 + (age * 6); // Very simplified formula
  
  if (height > expectedHeight + 15) return 'very-tall'; // >+2 SD
  if (height > expectedHeight + 8) return 'tall'; // >+1.5 SD to +2 SD
  if (height >= expectedHeight - 8) return 'normal'; // -1.5 SD to +1.5 SD
  if (height >= expectedHeight - 15) return 'short'; // <-1.5 SD to -2 SD
  return 'very-short'; // <-2 SD
};

export const getWeightForHeightCategory = (weight: number | null, height: number | null) => {
  const bmi = calculateBMI(weight, height);
  if (!bmi) return 'no-data';
  
  if (bmi >= 27) return 'obese'; // โรคอ้วน
  if (bmi >= 23) return 'overweight'; // เกินเกณฑ์
  if (bmi >= 18.5) return 'normal'; // สมส่วน
  if (bmi >= 16) return 'thin'; // ค่อนข้างผอม
  return 'very-thin'; // ผอม
};
