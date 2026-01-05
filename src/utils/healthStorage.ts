
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

export const getStudentHealthDetails = async (academicYear: string, month?: number, grade?: string, semester?: string) => {
  console.log('Fetching health details with params:', { academicYear, month, grade, semester });
  
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
  
  // Filter by semester on client side (since the DB function doesn't support semester filtering yet)
  let filteredData = data || [];
  if (semester && semester !== 'all') {
    // We need to get the student records and filter by semester
    // For now, we'll return all data and let the component handle it
    // TODO: Add semester parameter to the DB function
  }
  
  console.log('Health details fetched:', filteredData);
  return filteredData;
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
    console.log('Attempting to process', records.length, 'health records');
    
    // Process each record individually for better error handling
    const results = [];
    const errors = [];
    
    for (let i = 0; i < records.length; i++) {
      const record = {
        ...records[i],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      try {
        // First try to find existing record
        const { data: existingRecord } = await supabase
          .from('student_health_records')
          .select('id')
          .eq('student_id', record.student_id)
          .eq('measurement_date', record.measurement_date)
          .eq('academic_year', record.academic_year)
          .maybeSingle();
        
        if (existingRecord) {
          // Update existing record
          const { data, error } = await supabase
            .from('student_health_records')
            .update({
              weight_kg: record.weight_kg,
              height_cm: record.height_cm,
              updated_at: record.updated_at
            })
            .eq('id', existingRecord.id)
            .select('id')
            .single();
          
          if (error) {
            console.error('Error updating record:', error);
            errors.push(`Record ${i + 1}: ${error.message}`);
          } else if (data) {
            results.push(data);
          }
        } else {
          // Insert new record
          const { data, error } = await supabase
            .from('student_health_records')
            .insert([record])
            .select('id')
            .single();
          
          if (error) {
            console.error('Error inserting record:', error);
            errors.push(`Record ${i + 1}: ${error.message}`);
          } else if (data) {
            results.push(data);
          }
        }
      } catch (singleError) {
        console.error('Failed to process individual record:', record, singleError);
        errors.push(`Record ${i + 1}: ${singleError instanceof Error ? singleError.message : 'Unknown error'}`);
      }
    }
    
    console.log('Successfully processed', results.length, 'records');
    if (errors.length > 0) {
      console.warn('Errors encountered:', errors);
    }
    
    return results;
  } catch (error) {
    console.error('Error in upsertStudentHealthRecords:', error);
    throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
  }
}
