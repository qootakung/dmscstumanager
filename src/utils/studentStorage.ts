
import { Student } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';

// Student data management
export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase.from('students').select('*').order('studentId', { ascending: true });
  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  return data as Student[];
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
