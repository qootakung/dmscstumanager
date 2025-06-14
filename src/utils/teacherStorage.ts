import type { Teacher } from '@/types/teacher';
import { supabase } from '@/integrations/supabase/client';

export const getTeachers = async (): Promise<Teacher[]> => {
  const { data, error } = await supabase.from('teachers').select('*').order('positionNumber', { ascending: true });
  if (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
  return data as Teacher[];
};

export const addTeacher = async (teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<Teacher | null> => {
  const { data, error } = await supabase.from('teachers').insert(teacherData).select().single();
  
  if (error) {
    console.error('Error adding teacher:', error);
    return null;
  }
  return data as Teacher;
};

export const updateTeacher = async (id: string, updates: Partial<Teacher>): Promise<Teacher | null> => {
  const { data, error } = await supabase
    .from('teachers')
    .update({ ...updates, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating teacher:', error);
    return null;
  }
  return data as Teacher;
};

export const deleteTeacher = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting teacher:', error);
    return false;
  }
  return true;
};

export const getTeacherStatistics = async () => {
  const teachers = await getTeachers();
  
  const byPosition = teachers.reduce((acc, teacher) => {
    acc[teacher.position] = (acc[teacher.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const academicYears = [...new Set(teachers.map(t => t.academicYear))].sort().reverse();

  return {
    total: teachers.length,
    byPosition,
    academicYears,
  };
};
