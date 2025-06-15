
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
  try {
    console.log('Attempting to upsert', records.length, 'health records');
    
    // Process records in smaller batches to improve performance
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(records.length/batchSize)}`);
      
      // Add created_at timestamp to each record
      const recordsWithTimestamp = batch.map(record => ({
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('student_health_records')
        .upsert(recordsWithTimestamp, {
          onConflict: 'student_id,measurement_date,academic_year',
          ignoreDuplicates: false
        })
        .select('id');

      if (error) {
        console.error('Error in batch upsert:', error);
        // Try individual inserts for failed batch
        for (const record of recordsWithTimestamp) {
          try {
            const { data: singleData } = await supabase
              .from('student_health_records')
              .upsert([record], {
                onConflict: 'student_id,measurement_date,academic_year',
                ignoreDuplicates: false
              })
              .select('id');
            if (singleData) results.push(...singleData);
          } catch (singleError) {
            console.error('Failed to insert individual record:', record, singleError);
          }
        }
      } else if (data) {
        results.push(...data);
      }
    }
    
    console.log('Successfully upserted', results.length, 'records');
    return results;
  } catch (error) {
    console.error('Error in upsertStudentHealthRecords:', error);
    throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
  }
}
