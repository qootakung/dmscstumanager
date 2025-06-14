
import { supabase } from '@/integrations/supabase/client';

// Student Health Records
export const getStudentHealthRecords = async (filters: { academicYear?: string, studentId?: string }) => {
  let query = supabase.from('student_health_records').select('*');

  if (filters.academicYear) {
    query = query.eq('academic_year', filters.academicYear);
  }
  if (filters.studentId) {
    query = query.eq('student_id', filters.studentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching student health records:', error);
    return [];
  }
  return data;
}

export const getStudentHealthDetails = async (academicYear: string, month?: number) => {
  const { data, error } = await supabase.rpc('get_student_health_details', {
    p_academic_year: academicYear,
    p_month: month || null,
  });

  if (error) {
    console.error('Error fetching student health details:', error);
    return [];
  }
  return data as any[]; // Type assertion to avoid breaking changes for now.
};

export const updateStudentHealthRecord = async (recordId: string, updates: { weight_kg?: number | null, height_cm?: number | null }) => {
    const { data, error } = await supabase
        .from('student_health_records')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', recordId)
        .select()
        .single();

    if (error) {
        console.error('Error updating student health record:', error);
        return null;
    }
    return data;
}

export const upsertStudentHealthRecords = async (records: any[]) => {
  const { data, error } = await supabase.from('student_health_records').upsert(records, {
    onConflict: 'student_id,measurement_date'
  }).select();

  if (error) {
    console.error('Error upserting student health records:', error);
    return null;
  }
  return data;
}
