
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HealthDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkData = async () => {
      try {
        // Check students
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .limit(5);

        // Check health records
        const { data: healthRecords, error: healthError } = await supabase
          .from('student_health_records')
          .select('*')
          .limit(5);

        // Check function call
        const { data: functionData, error: functionError } = await supabase
          .rpc('get_student_health_details', {
            p_academic_year: '2568',
            p_month: null,
            p_grade: null
          });

        setDebugInfo({
          students: { data: students, error: studentsError },
          healthRecords: { data: healthRecords, error: healthError },
          functionCall: { data: functionData, error: functionError }
        });
      } catch (err) {
        console.error('Debug error:', err);
        setDebugInfo({ error: err });
      }
    };

    checkData();
  }, []);

  if (!debugInfo) return <div>Loading debug info...</div>;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default HealthDebug;
