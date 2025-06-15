
// Utility functions for health calculations and evaluations

export const calculateBMI = (weight: number | null, height: number | null): number | null => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

export const evaluateBMI = (bmi: number | null): string => {
  if (!bmi) return '-';
  if (bmi < 18.5) return 'น้ำหนักน้อย';
  if (bmi < 23) return 'น้ำหนักปกติ';
  if (bmi < 25) return 'น้ำหนักเกิน';
  if (bmi < 30) return 'อ้วนระดับ 1';
  return 'อ้วนระดับ 2';
};

export const calculateHeightForAge = (ageYears: number, height: number | null): string => {
  if (!height || ageYears <= 0) return '-';
  
  // กำหนดเกณฑ์ส่วนสูงตามช่วงอายุ (ตัวอย่าง - ควรปรับตามเกณฑ์จริง)
  let minHeight = 0;
  let maxHeight = 0;
  
  if (ageYears >= 6 && ageYears <= 12) {
    // เกณฑ์สำหรับเด็กประถม
    minHeight = 100 + (ageYears - 6) * 6; // ตัวอย่าง
    maxHeight = 120 + (ageYears - 6) * 8; // ตัวอย่าง
  } else if (ageYears >= 13 && ageYears <= 18) {
    // เกณฑ์สำหรับเด็กมัธยม
    minHeight = 140 + (ageYears - 13) * 5; // ตัวอย่าง
    maxHeight = 160 + (ageYears - 13) * 6; // ตัวอย่าง
  } else {
    return 'ไม่พบฐานส';
  }
  
  if (height > 200) {
    return '*** ตรวจสอบข้อมูล ***';
  } else if (height > maxHeight) {
    return 'สูงเกินเกณฑ์';
  } else if (height >= minHeight) {
    return 'สูงตามเกณฑ์';
  } else {
    return 'เตี้ยกว่าเกณฑ์';
  }
};

export const calculateWeightForAge = (ageYears: number, weight: number | null, height: number | null): string => {
  if (!weight || !height || ageYears <= 0) return '-';
  
  // กำหนดเกณฑ์น้ำหนักตามช่วงอายุ (ตัวอย่าง - ควรปรับตามเกณฑ์จริง)
  let minWeight = 0;
  let normalMinWeight = 0;
  let normalMaxWeight = 0;
  let overweightWeight = 0;
  let obeseWeight = 0;
  
  if (ageYears >= 6 && ageYears <= 12) {
    // เกณฑ์สำหรับเด็กประถม
    minWeight = 15 + (ageYears - 6) * 3; // ตัวอย่าง
    normalMinWeight = 18 + (ageYears - 6) * 3.5; // ตัวอย่าง
    normalMaxWeight = 25 + (ageYears - 6) * 4; // ตัวอย่าง
    overweightWeight = 30 + (ageYears - 6) * 4.5; // ตัวอย่าง
    obeseWeight = 35 + (ageYears - 6) * 5; // ตัวอย่าง
  } else if (ageYears >= 13 && ageYears <= 18) {
    // เกณฑ์สำหรับเด็กมัธยม
    minWeight = 35 + (ageYears - 13) * 4; // ตัวอย่าง
    normalMinWeight = 40 + (ageYears - 13) * 4.5; // ตัวอย่าง
    normalMaxWeight = 55 + (ageYears - 13) * 5; // ตัวอย่าง
    overweightWeight = 65 + (ageYears - 13) * 5.5; // ตัวอย่าง
    obeseWeight = 75 + (ageYears - 13) * 6; // ตัวอย่าง
  } else {
    return 'ไม่พบฐานส';
  }
  
  // ตรวจสอบข้อมูลผิดปกติ
  if (weight > 200 || (weight < 10 && ageYears > 5)) {
    return '*** ตรวจสอบข้อมูล ***';
  } else if (weight >= obeseWeight) {
    return 'อ้วน';
  } else if (weight >= overweightWeight) {
    return 'เริ่มอ้วน';
  } else if (weight >= normalMaxWeight) {
    return 'ดีมาก';
  } else if (weight >= normalMinWeight) {
    return 'ดีอ่อน';
  } else {
    return 'ผอม';
  }
};

export const calculateWeightForHeight = (height: number | null, weight: number | null): string => {
  if (!height || !weight) return '-';
  
  // คำนวณ BMI สำหรับการประเมิน
  const bmi = calculateBMI(weight, height);
  if (!bmi) return '-';
  
  // ประเมินตาม BMI สำหรับเด็ก
  if (bmi < 16) return 'ผอมมาก';
  if (bmi < 18.5) return 'ผอม';
  if (bmi < 23) return 'ปกติ';
  if (bmi < 25) return 'เกิน';
  if (bmi < 30) return 'อ้วน';
  return 'อ้วนมาก';
};

export const evaluateHealthByAge = (bmi: number | null, age: number): string => {
  if (!bmi) return '-';
  // เกณฑ์การประเมินสำหรับเด็ก (ตัวอย่าง)
  if (age <= 12) {
    if (bmi < 16) return 'น้ำหนักน้อยกว่าเกณฑ์';
    if (bmi < 20) return 'น้ำหนักปกติ';
    if (bmi < 22) return 'น้ำหนักเกินเกณฑ์';
    return 'น้ำหนักเกินมากกว่าเกณฑ์';
  } else {
    // เกณฑ์สำหรับวัยรุ่น
    if (bmi < 18.5) return 'น้ำหนักน้อยกว่าเกณฑ์';
    if (bmi < 23) return 'น้ำหนักปกติ';
    if (bmi < 25) return 'น้ำหนักเกินเกณฑ์';
    return 'น้ำหนักเกินมากกว่าเกณฑ์';
  }
};
