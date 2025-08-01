
import { Student } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';

// Student data management
export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase.from('students').select('*');
  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  
  // Sort students by studentId: 3 digits first, then 4 digits
  const sortedData = (data as Student[]).sort((a, b) => {
    const aId = a.studentId;
    const bId = b.studentId;
    
    // Check if studentId is 3 digits or 4 digits
    const aIs3Digit = aId.length === 3;
    const bIs3Digit = bId.length === 3;
    
    // If one is 3 digits and other is 4 digits, 3 digits comes first
    if (aIs3Digit && !bIs3Digit) return -1;
    if (!aIs3Digit && bIs3Digit) return 1;
    
    // If both are same length, sort numerically
    return parseInt(aId) - parseInt(bId);
  });
  
  return sortedData;
};

export const addStudent = async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student | null> => {
  const { data, error } = await supabase.from('students').insert(student).select().single();
  if (error) {
    console.error('Error adding student:', error);
    return null;
  }
  return data as Student;
};

export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .update({ ...studentData, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating student:', error);
    return null;
  }
  return data as Student;
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) {
    console.error('Error deleting student:', error);
    return false;
  }
  return true;
};

export const clearAllStudents = async (): Promise<void> => {
  const { error } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error('Error clearing all students:', error);
  }
};
