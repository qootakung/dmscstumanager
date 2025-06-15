
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
  return data || [];
}

export const getStudentHealthDetails = async (academicYear: string, month?: number, grade?: string) => {
  console.log('Fetching health details with params:', { academicYear, month, grade });
  
  // Convert 'all' values to null properly
  const monthParam = month === undefined ? null : month;
  const gradeParam = grade === 'all' || grade === undefined ? null : grade;
  
  const { data, error } = await supabase.rpc('get_student_health_details', {
    p_academic_year: academicYear,
    p_month: monthParam,
    p_grade: gradeParam,
  });

  if (error) {
    console.error('Error fetching student health details:', error);
    return [];
  }
  
  console.log('Health details fetched:', data);
  return data || [];
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
  // Add proper error handling for RLS policy issues
  try {
    const { data, error } = await supabase.from('student_health_records').upsert(records, {
      onConflict: 'student_id,measurement_date'
    }).select();

    if (error) {
      console.error('Error upserting student health records:', error);
      // If it's an RLS policy error, provide more helpful error message
      if (error.code === '42501') {
        throw new Error('ไม่มีสิทธิ์ในการบันทึกข้อมูล กรุณาติดต่อผู้ดูแลระบบ');
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in upsertStudentHealthRecords:', error);
    throw error;
  }
}
