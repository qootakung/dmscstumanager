
import { useMemo } from 'react';
import { StudentHealthDetails } from '@/types/student';
import { calculateBMI, getBMICategory, getHeightCategory, getWeightForHeightCategory } from '../utils/healthCalculations';

export const useHealthStatistics = (data: StudentHealthDetails[]) => {
  return useMemo(() => {
    // Count students by categories with gender separation
    const countByCategory = (categoryFn: (item: StudentHealthDetails) => string) => {
      const categories: { [key: string]: { male: number, female: number, total: number } } = {};
      
      data.forEach(student => {
        const category = categoryFn(student);
        if (!categories[category]) {
          categories[category] = { male: 0, female: 0, total: 0 };
        }
        
        // Extract gender from full_name (เด็กชาย/เด็กหญิง)
        const isMale = student.full_name.includes('เด็กชาย');
        const isFemale = student.full_name.includes('เด็กหญิง');
        
        if (isMale) {
          categories[category].male++;
        } else if (isFemale) {
          categories[category].female++;
        }
        categories[category].total++;
      });
      
      return categories;
    };

    // Calculate gender totals
    const genderTotals = data.reduce((acc, student) => {
      const isMale = student.full_name.includes('เด็กชาย');
      const isFemale = student.full_name.includes('เด็กหญิง');
      
      if (isMale) acc.male++;
      if (isFemale) acc.female++;
      acc.total++;
      
      return acc;
    }, { male: 0, female: 0, total: 0 });

    const weightCategories = countByCategory((student) => {
      const bmi = calculateBMI(student.weight_kg, student.height_cm);
      return getBMICategory(bmi);
    });

    const heightCategories = countByCategory((student) => {
      return getHeightCategory(student.height_cm, student.age_years);
    });

    const weightForHeightCategories = countByCategory((student) => {
      return getWeightForHeightCategory(student.weight_kg, student.height_cm);
    });

    return {
      weightCategories,
      heightCategories,
      weightForHeightCategories,
      genderTotals,
      totalStudents: data.length
    };
  }, [data]);
};
