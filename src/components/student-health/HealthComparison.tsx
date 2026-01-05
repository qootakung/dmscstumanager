
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Scale, Ruler, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `รายงานเปรียบเทียบสุขภาพ_${selectedYear}_${selectedGrade === 'all' ? 'ทุกชั้น' : selectedGrade}`,
  });

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

    const avgSem1Weight = comparisonData.filter(d => d.semester1.weight !== null).length > 0
      ? comparisonData.filter(d => d.semester1.weight !== null).reduce((a, b) => a + (b.semester1.weight || 0), 0) / comparisonData.filter(d => d.semester1.weight !== null).length
      : 0;
    const avgSem2Weight = comparisonData.filter(d => d.semester2.weight !== null).length > 0
      ? comparisonData.filter(d => d.semester2.weight !== null).reduce((a, b) => a + (b.semester2.weight || 0), 0) / comparisonData.filter(d => d.semester2.weight !== null).length
      : 0;
    const avgSem1Height = comparisonData.filter(d => d.semester1.height !== null).length > 0
      ? comparisonData.filter(d => d.semester1.height !== null).reduce((a, b) => a + (b.semester1.height || 0), 0) / comparisonData.filter(d => d.semester1.height !== null).length
      : 0;
    const avgSem2Height = comparisonData.filter(d => d.semester2.height !== null).length > 0
      ? comparisonData.filter(d => d.semester2.height !== null).reduce((a, b) => a + (b.semester2.height || 0), 0) / comparisonData.filter(d => d.semester2.height !== null).length
      : 0;

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
      avgSem1Weight: avgSem1Weight.toFixed(2),
      avgSem2Weight: avgSem2Weight.toFixed(2),
      avgSem1Height: avgSem1Height.toFixed(2),
      avgSem2Height: avgSem2Height.toFixed(2),
    };
  }, [comparisonData]);

  // Chart data
  const chartData = React.useMemo(() => {
    return [
      {
        name: 'น้ำหนักเฉลี่ย (กก.)',
        'เทอม 1': parseFloat(summaryStats.avgSem1Weight),
        'เทอม 2': parseFloat(summaryStats.avgSem2Weight),
      },
      {
        name: 'ส่วนสูงเฉลี่ย (ซม.)',
        'เทอม 1': parseFloat(summaryStats.avgSem1Height),
        'เทอม 2': parseFloat(summaryStats.avgSem2Height),
      },
    ];
  }, [summaryStats]);

  // Change distribution chart data
  const changeDistributionData = React.useMemo(() => {
    const validWeightDiffs = comparisonData.filter(d => d.weightDiff !== null).map(d => d.weightDiff!);
    const validHeightDiffs = comparisonData.filter(d => d.heightDiff !== null).map(d => d.heightDiff!);

    return [
      {
        name: 'น้ำหนัก',
        เพิ่มขึ้น: validWeightDiffs.filter(d => d > 0).length,
        คงที่: validWeightDiffs.filter(d => d === 0).length,
        ลดลง: validWeightDiffs.filter(d => d < 0).length,
      },
      {
        name: 'ส่วนสูง',
        เพิ่มขึ้น: validHeightDiffs.filter(d => d > 0).length,
        คงที่: validHeightDiffs.filter(d => d === 0).length,
        ลดลง: validHeightDiffs.filter(d => d < 0).length,
      },
    ];
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
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              เปรียบเทียบข้อมูลสุขภาพระหว่างเทอม
            </CardTitle>
            <Button 
              onClick={() => handlePrint()} 
              disabled={isLoading || comparisonData.length === 0}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              พิมพ์รายงาน
            </Button>
          </div>
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

      {/* Charts */}
      {!isLoading && comparisonData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">เปรียบเทียบค่าเฉลี่ยระหว่างเทอม</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip 
                    formatter={(value: number) => value.toFixed(2)}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  />
                  <Legend />
                  <Bar dataKey="เทอม 1" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="เทอม 2" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Change Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">การกระจายตัวของการเปลี่ยนแปลง</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={changeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
                  <Legend />
                  <Bar dataKey="เพิ่มขึ้น" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="คงที่" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ลดลง" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

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

      {/* Hidden Print Content */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white">
          <style>
            {`
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                table { border-collapse: collapse; width: 100%; font-size: 10px; }
                th, td { border: 1px solid #000; padding: 4px; text-align: center; }
                .print-header { text-align: center; margin-bottom: 20px; }
                .print-stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
                .stat-box { text-align: center; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
                .positive { color: green; }
                .negative { color: red; }
              }
            `}
          </style>
          <div className="print-header">
            <h1 className="text-xl font-bold mb-2">รายงานเปรียบเทียบข้อมูลสุขภาพระหว่างภาคเรียน</h1>
            <p className="text-sm">ปีการศึกษา {selectedYear} | ระดับชั้น: {selectedGrade === 'all' ? 'ทุกชั้น' : selectedGrade}</p>
          </div>

          <div className="print-stats mb-4">
            <div className="grid grid-cols-4 gap-4 text-center text-sm mb-4">
              <div className="stat-box">
                <p className="font-medium">จำนวนนักเรียน</p>
                <p className="text-lg font-bold">{summaryStats.totalStudents} คน</p>
              </div>
              <div className="stat-box">
                <p className="font-medium">ข้อมูลครบ 2 เทอม</p>
                <p className="text-lg font-bold">{summaryStats.studentsWithBothSemesters} คน</p>
              </div>
              <div className="stat-box">
                <p className="font-medium">น้ำหนักเฉลี่ยเปลี่ยนแปลง</p>
                <p className="text-lg font-bold">{summaryStats.avgWeightChange} กก.</p>
              </div>
              <div className="stat-box">
                <p className="font-medium">ส่วนสูงเฉลี่ยเปลี่ยนแปลง</p>
                <p className="text-lg font-bold">{summaryStats.avgHeightChange} ซม.</p>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th rowSpan={2}>ลำดับ</th>
                <th rowSpan={2}>รหัส</th>
                <th rowSpan={2}>ชื่อ-นามสกุล</th>
                <th colSpan={2}>เทอม 1</th>
                <th colSpan={2}>เทอม 2</th>
                <th colSpan={2}>การเปลี่ยนแปลง</th>
              </tr>
              <tr>
                <th>น้ำหนัก (กก.)</th>
                <th>ส่วนสูง (ซม.)</th>
                <th>น้ำหนัก (กก.)</th>
                <th>ส่วนสูง (ซม.)</th>
                <th>น้ำหนัก</th>
                <th>ส่วนสูง</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((student, index) => (
                <tr key={student.studentId}>
                  <td>{index + 1}</td>
                  <td>{student.studentCode}</td>
                  <td style={{ textAlign: 'left' }}>{student.fullName}</td>
                  <td>{student.semester1.weight ?? '-'}</td>
                  <td>{student.semester1.height ?? '-'}</td>
                  <td>{student.semester2.weight ?? '-'}</td>
                  <td>{student.semester2.height ?? '-'}</td>
                  <td className={student.weightDiff !== null ? (student.weightDiff > 0 ? 'positive' : student.weightDiff < 0 ? 'negative' : '') : ''}>
                    {student.weightDiff !== null ? (student.weightDiff > 0 ? `+${student.weightDiff}` : student.weightDiff) : '-'}
                  </td>
                  <td className={student.heightDiff !== null ? (student.heightDiff > 0 ? 'positive' : student.heightDiff < 0 ? 'negative' : '') : ''}>
                    {student.heightDiff !== null ? (student.heightDiff > 0 ? `+${student.heightDiff}` : student.heightDiff) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthComparison;
