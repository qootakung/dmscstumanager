
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Scale, Ruler } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StudentHealthDetails } from '@/types/student';

interface ComparisonData {
  studentId: string;
  studentCode: string;
  fullName: string;
  semester1: {
    weight: number | null;
    height: number | null;
    measurementDate: string | null;
  };
  semester2: {
    weight: number | null;
    height: number | null;
    measurementDate: string | null;
  };
  weightDiff: number | null;
  heightDiff: number | null;
}

const HealthComparison: React.FC = () => {
  const currentYear = new Date().getFullYear() + 543;
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Fetch semester 1 data
  const { data: semester1Data, isLoading: loading1 } = useQuery({
    queryKey: ['healthComparison', selectedYear, selectedGrade, '1'],
    queryFn: async () => {
      const gradeParam = selectedGrade === 'all' ? null : selectedGrade;
      const { data, error } = await supabase.rpc('get_student_health_details', {
        p_academic_year: selectedYear,
        p_month: null,
        p_grade: gradeParam,
      });
      if (error) throw error;
      return (data || []) as StudentHealthDetails[];
    },
  });

  // Fetch semester 2 data
  const { data: semester2Data, isLoading: loading2 } = useQuery({
    queryKey: ['healthComparison', selectedYear, selectedGrade, '2'],
    queryFn: async () => {
      const gradeParam = selectedGrade === 'all' ? null : selectedGrade;
      const { data, error } = await supabase.rpc('get_student_health_details', {
        p_academic_year: selectedYear,
        p_month: null,
        p_grade: gradeParam,
      });
      if (error) throw error;
      return (data || []) as StudentHealthDetails[];
    },
  });

  const isLoading = loading1 || loading2;

  // Combine data for comparison
  const comparisonData: ComparisonData[] = React.useMemo(() => {
    if (!semester1Data && !semester2Data) return [];

    const studentMap = new Map<string, ComparisonData>();

    // Process semester 1 data (months 5-10)
    semester1Data?.forEach((record) => {
      const month = new Date(record.measurement_date).getMonth() + 1;
      if (month >= 5 && month <= 10) {
        const existing = studentMap.get(record.student_record_id);
        if (!existing || !existing.semester1.measurementDate || 
            new Date(record.measurement_date) > new Date(existing.semester1.measurementDate)) {
          studentMap.set(record.student_record_id, {
            studentId: record.student_record_id,
            studentCode: record.student_code,
            fullName: record.full_name,
            semester1: {
              weight: record.weight_kg,
              height: record.height_cm,
              measurementDate: record.measurement_date,
            },
            semester2: existing?.semester2 || {
              weight: null,
              height: null,
              measurementDate: null,
            },
            weightDiff: null,
            heightDiff: null,
          });
        }
      }
    });

    // Process semester 2 data (months 11-12, 1-4)
    semester2Data?.forEach((record) => {
      const month = new Date(record.measurement_date).getMonth() + 1;
      if (month >= 11 || month <= 4) {
        const existing = studentMap.get(record.student_record_id);
        const semester2Data = {
          weight: record.weight_kg,
          height: record.height_cm,
          measurementDate: record.measurement_date,
        };

        if (!existing) {
          studentMap.set(record.student_record_id, {
            studentId: record.student_record_id,
            studentCode: record.student_code,
            fullName: record.full_name,
            semester1: {
              weight: null,
              height: null,
              measurementDate: null,
            },
            semester2: semester2Data,
            weightDiff: null,
            heightDiff: null,
          });
        } else if (!existing.semester2.measurementDate || 
                   new Date(record.measurement_date) > new Date(existing.semester2.measurementDate)) {
          existing.semester2 = semester2Data;
        }
      }
    });

    // Calculate differences
    return Array.from(studentMap.values()).map((student) => {
      const weightDiff = (student.semester1.weight !== null && student.semester2.weight !== null)
        ? Number((student.semester2.weight - student.semester1.weight).toFixed(2))
        : null;
      const heightDiff = (student.semester1.height !== null && student.semester2.height !== null)
        ? Number((student.semester2.height - student.semester1.height).toFixed(2))
        : null;
      
      return {
        ...student,
        weightDiff,
        heightDiff,
      };
    }).sort((a, b) => a.studentCode.localeCompare(b.studentCode));
  }, [semester1Data, semester2Data]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const validWeightDiffs = comparisonData.filter(d => d.weightDiff !== null).map(d => d.weightDiff!);
    const validHeightDiffs = comparisonData.filter(d => d.heightDiff !== null).map(d => d.heightDiff!);

    return {
      totalStudents: comparisonData.length,
      studentsWithBothSemesters: comparisonData.filter(d => d.semester1.weight !== null && d.semester2.weight !== null).length,
      avgWeightChange: validWeightDiffs.length > 0 
        ? (validWeightDiffs.reduce((a, b) => a + b, 0) / validWeightDiffs.length).toFixed(2)
        : '-',
      avgHeightChange: validHeightDiffs.length > 0
        ? (validHeightDiffs.reduce((a, b) => a + b, 0) / validHeightDiffs.length).toFixed(2)
        : '-',
      weightGained: validWeightDiffs.filter(d => d > 0).length,
      weightLost: validWeightDiffs.filter(d => d < 0).length,
      heightGained: validHeightDiffs.filter(d => d > 0).length,
    };
  }, [comparisonData]);

  const renderDiffBadge = (diff: number | null, unit: string) => {
    if (diff === null) return <span className="text-muted-foreground">-</span>;
    
    if (diff > 0) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{diff} {unit}
        </Badge>
      );
    } else if (diff < 0) {
      return (
        <Badge variant="destructive">
          <TrendingDown className="w-3 h-3 mr-1" />
          {diff} {unit}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Minus className="w-3 h-3 mr-1" />
        0 {unit}
      </Badge>
    );
  };

  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const grades = ['all', 'อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            เปรียบเทียบข้อมูลสุขภาพระหว่างเทอม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <Label>ปีการศึกษา</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="เลือกปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>ระดับชั้น</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="เลือกระดับชั้น" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade === 'all' ? 'ทุกชั้น' : grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium">จำนวนนักเรียนทั้งหมด</p>
              <p className="text-3xl font-bold text-blue-700">{summaryStats.totalStudents}</p>
              <p className="text-xs text-blue-500">คน</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">มีข้อมูลครบทั้ง 2 เทอม</p>
              <p className="text-3xl font-bold text-green-700">{summaryStats.studentsWithBothSemesters}</p>
              <p className="text-xs text-green-500">คน</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center flex items-center justify-center gap-2">
              <Scale className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">น้ำหนักเฉลี่ยเปลี่ยนแปลง</p>
                <p className="text-3xl font-bold text-purple-700">{summaryStats.avgWeightChange}</p>
                <p className="text-xs text-purple-500">กก.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center flex items-center justify-center gap-2">
              <Ruler className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">ส่วนสูงเฉลี่ยเปลี่ยนแปลง</p>
                <p className="text-3xl font-bold text-orange-700">{summaryStats.avgHeightChange}</p>
                <p className="text-xs text-orange-500">ซม.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>ตารางเปรียบเทียบรายบุคคล</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
          ) : comparisonData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบข้อมูลสำหรับปีการศึกษาและระดับชั้นที่เลือก
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center" rowSpan={2}>ลำดับ</TableHead>
                    <TableHead rowSpan={2}>รหัสนักเรียน</TableHead>
                    <TableHead rowSpan={2}>ชื่อ-นามสกุล</TableHead>
                    <TableHead className="text-center" colSpan={2}>เทอม 1</TableHead>
                    <TableHead className="text-center" colSpan={2}>เทอม 2</TableHead>
                    <TableHead className="text-center" colSpan={2}>การเปลี่ยนแปลง</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-center">น้ำหนัก (กก.)</TableHead>
                    <TableHead className="text-center">ส่วนสูง (ซม.)</TableHead>
                    <TableHead className="text-center">น้ำหนัก (กก.)</TableHead>
                    <TableHead className="text-center">ส่วนสูง (ซม.)</TableHead>
                    <TableHead className="text-center">น้ำหนัก</TableHead>
                    <TableHead className="text-center">ส่วนสูง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData.map((student, index) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{student.studentCode}</TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell className="text-center">
                        {student.semester1.weight ?? '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.semester1.height ?? '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.semester2.weight ?? '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.semester2.height ?? '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderDiffBadge(student.weightDiff, 'กก.')}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderDiffBadge(student.heightDiff, 'ซม.')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthComparison;
