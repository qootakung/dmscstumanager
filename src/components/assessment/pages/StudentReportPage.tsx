import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import CompetencyPrintPreviewDialog from '../CompetencyPrintPreviewDialog';

interface Student {
  id: string;
  studentId: string;
  firstNameTh: string;
  lastNameTh: string;
  titleTh: string;
  grade: string;
  academicYear: string;
}

interface CompetencyAssessment {
  student_id: string;
  competency_number: number;
  item_1_score: number;
  item_2_score: number;
  item_3_score: number;
  item_4_score: number;
  item_5_score: number;
  total_score: number;
  grade: string;
}

interface StudentWithAssessment {
  id: string;
  studentId: string;
  studentName: string;
  competencyScores: number[];
  totalScore: number;
  grade: string;
}

export const StudentReportPage = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<CompetencyAssessment[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [teacher, setTeacher] = useState('');
  const [principal, setPrincipal] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Fetch available academic years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('academicYear')
          .not('academicYear', 'is', null);
        
        if (error) throw error;
        
        const years = [...new Set(data.map(d => d.academicYear))].sort().reverse();
        setAvailableYears(years);
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };
    
    fetchAcademicYears();
  }, []);

  // Fetch available grades when academic year changes
  useEffect(() => {
    if (!academicYear) {
      setAvailableGrades([]);
      return;
    }

    const fetchGrades = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('grade')
          .eq('academicYear', academicYear)
          .not('grade', 'is', null);
        
        if (error) throw error;
        
        // Filter out kindergarten classes (อ.1-อ.3) and keep only elementary (ป.)
        const grades = [...new Set(data.map(d => d.grade))]
          .filter(grade => grade.startsWith('ป.'))
          .sort();
        setAvailableGrades(grades);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
    
    fetchGrades();
  }, [academicYear]);

  // Fetch students and assessments when both year and grade are selected
  useEffect(() => {
    if (!academicYear || !gradeLevel) {
      setStudents([]);
      setAssessments([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, studentId, firstNameTh, lastNameTh, titleTh, grade, academicYear')
          .eq('academicYear', academicYear)
          .eq('grade', gradeLevel)
          .order('studentId');

        if (studentsError) throw studentsError;

        // Fetch competency assessments for these students
        const studentIds = studentsData.map(s => s.id);
        
        if (studentIds.length > 0) {
          const { data: assessmentsData, error: assessmentsError } = await supabase
            .from('competency_assessments')
            .select('student_id, competency_number, item_1_score, item_2_score, item_3_score, item_4_score, item_5_score, total_score, grade')
            .in('student_id', studentIds)
            .eq('academic_year', academicYear);

          if (assessmentsError) throw assessmentsError;

          setAssessments(assessmentsData || []);
        } else {
          setAssessments([]);
        }

        setStudents(studentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [academicYear, gradeLevel]);

  // Combine students with their assessments
  const studentsWithAssessments = useMemo(() => {
    return students.map(student => {
      // Find all competency assessments for this student
      const studentAssessments = assessments.filter(a => a.student_id === student.id);
      
      // Initialize competency scores for each of the 5 competencies
      const competencyScores = [0, 0, 0, 0, 0];
      let totalScore = 0;
      let grade = 'ไม่ผ่าน';
      
      if (studentAssessments.length > 0) {
        // For each competency assessment, get the total score across all 5 items
        studentAssessments.forEach(assessment => {
          const compIndex = assessment.competency_number - 1; // Convert to 0-based index
          if (compIndex >= 0 && compIndex < 5) {
            competencyScores[compIndex] = assessment.item_1_score + assessment.item_2_score + 
              assessment.item_3_score + assessment.item_4_score + assessment.item_5_score;
          }
        });
        
        // Calculate total score from all competencies
        totalScore = competencyScores.reduce((sum, score) => sum + score, 0);
        
        // Calculate grade based on total score
        if (totalScore >= 13) {
          grade = 'ดีเยี่ยม';
        } else if (totalScore >= 9) {
          grade = 'ดี';
        } else if (totalScore >= 5) {
          grade = 'ผ่าน';
        } else {
          grade = 'ไม่ผ่าน';
        }
      }

      return {
        id: student.id,
        studentId: student.studentId,
        studentName: `${student.titleTh || ''}${student.firstNameTh} ${student.lastNameTh}`.trim(),
        competencyScores,
        totalScore,
        grade
      };
    });
  }, [students, assessments]);

  const getGradeStats = () => {
    const stats = {
      excellent: studentsWithAssessments.filter(s => s.grade === 'ดีเยี่ยม').length,
      good: studentsWithAssessments.filter(s => s.grade === 'ดี').length,
      pass: studentsWithAssessments.filter(s => s.grade === 'ผ่าน').length,
      fail: studentsWithAssessments.filter(s => s.grade === 'ไม่ผ่าน').length,
    };
    
    const total = studentsWithAssessments.length;
    return {
      ...stats,
      total,
      excellentPercent: total > 0 ? ((stats.excellent / total) * 100).toFixed(1) : '0',
      goodPercent: total > 0 ? ((stats.good / total) * 100).toFixed(1) : '0',
      passPercent: total > 0 ? ((stats.pass / total) * 100).toFixed(1) : '0',
      failPercent: total > 0 ? ((stats.fail / total) * 100).toFixed(1) : '0',
    };
  };

  const stats = getGradeStats();


  const handlePreview = () => {
    if (!academicYear || !gradeLevel) {
      toast.error('กรุณาเลือกปีการศึกษาและชั้นเรียนก่อน');
      return;
    }
    setShowPreviewDialog(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateReportHTML = () => {
    const studentsHTML = studentsWithAssessments.map((student, index) => `
      <tr ${index === 16 ? 'class="page-break"' : ''}>
        <td class="text-center">${index + 1}</td>
        <td>${student.studentName}</td>
        <td class="text-center">${student.competencyScores[0] || 0}</td>
        <td class="text-center">${student.competencyScores[1] || 0}</td>
        <td class="text-center">${student.competencyScores[2] || 0}</td>
        <td class="text-center">${student.competencyScores[3] || 0}</td>
        <td class="text-center">${student.competencyScores[4] || 0}</td>
        <td class="text-center">${student.grade}</td>
      </tr>
    `).join('');

    const emptyRowsCount = Math.max(0, 16 - studentsWithAssessments.length);
    const emptyRowsHTML = Array.from({ length: emptyRowsCount }).map(() => `
      <tr>
        <td class="text-center"></td>
        <td></td>
        <td class="text-center"></td>
        <td class="text-center"></td>
        <td class="text-center"></td>
        <td class="text-center"></td>
        <td class="text-center"></td>
        <td class="text-center"></td>
      </tr>
    `).join('');

    const totalScores = [
      studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[0] || 0), 0),
      studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[1] || 0), 0),
      studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[2] || 0), 0),
      studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[3] || 0), 0),
      studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[4] || 0), 0)
    ];

    return `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>สรุปผลการประเมินรายชั้นเรียน</title>
        <style>
          body { 
            font-family: 'Sarabun', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          .report-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .report-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .report-subtitle {
            font-size: 18px;
            margin-bottom: 5px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            font-size: 14px;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: center;
          }
          .text-center {
            text-align: center;
          }
          .summary-section {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .summary-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }
          .summary-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #ddd;
          }
          .summary-label {
            font-weight: 500;
            font-size: 16px;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
          }
          .summary-percent {
            font-size: 12px;
            color: #666;
          }
          .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
          }
          .signature-box {
            text-align: center;
            padding: 20px 0;
          }
          .signature-label {
            margin-bottom: 60px;
            font-weight: 500;
          }
          .signature-line {
            border-bottom: 1px solid black;
            margin-bottom: 10px;
            height: 40px;
          }
          .page-break {
            page-break-before: always;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .report-container { max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <div class="report-title">สรุปผลการประเมินรายชั้นเรียน</div>
            <div class="report-subtitle">
              ชั้น${gradeLevel.startsWith('ป.') ? `ประถมศึกษาปีที่ ${gradeLevel.slice(2)}` : gradeLevel}
            </div>
            <div class="report-subtitle">ปีการศึกษา ${academicYear}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th rowspan="2" style="width: 60px;">ลำดับที่</th>
                <th rowspan="2" style="width: 200px;">ชื่อ-สกุล</th>
                <th colspan="5" class="text-center">ผลการประเมินรายสมรรถนะ</th>
                <th rowspan="2" style="width: 120px;">สรุปผลการประเมิน</th>
              </tr>
              <tr>
                <th style="width: 80px;">ด้านที่ 1</th>
                <th style="width: 80px;">ด้านที่ 2</th>
                <th style="width: 80px;">ด้านที่ 3</th>
                <th style="width: 80px;">ด้านที่ 4</th>
                <th style="width: 80px;">ด้านที่ 5</th>
              </tr>
            </thead>
            <tbody>
              ${studentsHTML}
              ${emptyRowsHTML}
              <tr style="font-weight: bold;">
                <td colspan="2" class="text-center">รวม</td>
                <td class="text-center">${totalScores[0]}</td>
                <td class="text-center">${totalScores[1]}</td>
                <td class="text-center">${totalScores[2]}</td>
                <td class="text-center">${totalScores[3]}</td>
                <td class="text-center">${totalScores[4]}</td>
                <td class="text-center">-</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-title">สรุปผลการประเมิน</div>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label" style="color: #10b981;">ดีเยี่ยม</div>
                <div class="summary-value">${stats.excellent}</div>
                <div class="summary-percent">(${stats.excellentPercent}%)</div>
              </div>
              <div class="summary-item">
                <div class="summary-label" style="color: #3b82f6;">ดี</div>
                <div class="summary-value">${stats.good}</div>
                <div class="summary-percent">(${stats.goodPercent}%)</div>
              </div>
              <div class="summary-item">
                <div class="summary-label" style="color: #f59e0b;">ผ่าน</div>
                <div class="summary-value">${stats.pass}</div>
                <div class="summary-percent">(${stats.passPercent}%)</div>
              </div>
              <div class="summary-item">
                <div class="summary-label" style="color: #ef4444;">ไม่ผ่าน</div>
                <div class="summary-value">${stats.fail}</div>
                <div class="summary-percent">(${stats.failPercent}%)</div>
              </div>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-label">ครูผู้รับผิดชอบ</div>
              <div class="signature-line"></div>
              <div>${teacher || '(.....................................)'}</div>
            </div>
            <div class="signature-box">
              <div class="signature-label">ผู้อำนวยการ</div>
              <div class="signature-line"></div>
              <div>${principal || '(.....................................)'}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          สรุปผลการประเมินรายชั้นเรียน
        </h2>
        <p className="text-gray-600 text-lg">
          บันทึกและสรุปผลการประเมินสมรรถนะของนักเรียนในแต่ละชั้น
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-700">ข้อมูลพื้นฐาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academic-year">ปีการศึกษา</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="academic-year">
                  <SelectValue placeholder="เลือกปีการศึกษา" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade-level">ชั้น</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel} disabled={!academicYear}>
                <SelectTrigger id="grade-level">
                  <SelectValue placeholder="เลือกชั้นเรียน" />
                </SelectTrigger>
                <SelectContent>
                  {availableGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade.startsWith('ป.') ? `ประถมศึกษาปีที่ ${grade.slice(2)}` : grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {academicYear && gradeLevel && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {/* Report Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">สรุปผลการประเมินรายชั้นเรียน</h1>
              <p className="text-lg mb-1">
                ชั้น{gradeLevel.startsWith('ป.') ? `ประถมศึกษาปีที่ ${gradeLevel.slice(2)}` : gradeLevel}
              </p>
              <p className="text-lg">ปีการศึกษา {academicYear}</p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : studentsWithAssessments.length === 0 ? (
              <div className="text-center py-8">
                <p>ไม่พบข้อมูลนักเรียนในชั้นและปีการศึกษาที่เลือก</p>
              </div>
            ) : (
              <>
                {/* Student Table */}
                <div className="overflow-x-auto mb-8">
                  <style>{`
                    @media print {
                      .print-table {
                        border-collapse: collapse;
                        width: 100%;
                        font-size: 12px;
                      }
                      .print-table th,
                      .print-table td {
                        border: 1px solid black !important;
                        padding: 4px 8px;
                        text-align: left;
                      }
                      .print-table th {
                        background-color: white !important;
                        font-weight: bold;
                        text-align: center;
                      }
                      .print-center {
                        text-align: center !important;
                      }
                      .page-break {
                        page-break-before: always;
                      }
                      @page {
                        size: A4;
                        margin: 1cm;
                      }
                    }
                    .preview-table {
                      border-collapse: collapse;
                      width: 100%;
                    }
                    .preview-table th,
                    .preview-table td {
                      border: 1px solid black;
                      padding: 8px;
                      text-align: left;
                    }
                    .preview-table th {
                      background-color: #f8f9fa;
                      font-weight: bold;
                      text-align: center;
                    }
                  `}</style>
                  
                  <table className="preview-table print-table">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="w-16">ลำดับที่</th>
                        <th rowSpan={2} className="w-48">ชื่อ-สกุล</th>
                        <th colSpan={5} className="text-center">ผลการประเมินรายสมรรถนะ</th>
                        <th rowSpan={2} className="w-24">สรุปผลการประเมิน</th>
                      </tr>
                      <tr>
                        <th className="w-16">ด้านที่ 1</th>
                        <th className="w-16">ด้านที่ 2</th>
                        <th className="w-16">ด้านที่ 3</th>
                        <th className="w-16">ด้านที่ 4</th>
                        <th className="w-16">ด้านที่ 5</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsWithAssessments.map((student, index) => (
                        <tr key={student.id} className={index === 16 ? 'page-break' : ''}>
                          <td className="text-center print-center">{index + 1}</td>
                          <td>{student.studentName}</td>
                          <td className="text-center print-center">{student.competencyScores[0] || 0}</td>
                          <td className="text-center print-center">{student.competencyScores[1] || 0}</td>
                          <td className="text-center print-center">{student.competencyScores[2] || 0}</td>
                          <td className="text-center print-center">{student.competencyScores[3] || 0}</td>
                          <td className="text-center print-center">{student.competencyScores[4] || 0}</td>
                          <td className="text-center print-center">{student.grade}</td>
                        </tr>
                      ))}
                      {/* Add empty rows to reach minimum 16 rows for consistent formatting */}
                      {Array.from({ length: Math.max(0, 16 - studentsWithAssessments.length) }).map((_, index) => (
                        <tr key={`empty-${index}`}>
                          <td className="text-center print-center"></td>
                          <td></td>
                          <td className="text-center print-center"></td>
                          <td className="text-center print-center"></td>
                          <td className="text-center print-center"></td>
                          <td className="text-center print-center"></td>
                          <td className="text-center print-center"></td>
                          <td className="text-center print-center"></td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={2} className="text-center print-center font-bold">รวม</td>
                        <td className="text-center print-center">{studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[0] || 0), 0)}</td>
                        <td className="text-center print-center">{studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[1] || 0), 0)}</td>
                        <td className="text-center print-center">{studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[2] || 0), 0)}</td>
                        <td className="text-center print-center">{studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[3] || 0), 0)}</td>
                        <td className="text-center print-center">{studentsWithAssessments.reduce((sum, s) => sum + (s.competencyScores[4] || 0), 0)}</td>
                        <td className="text-center print-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary Statistics */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-4 text-lg">สรุปผลการประเมิน</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-green-600 font-medium text-lg">ดีเยี่ยม</div>
                      <div className="text-2xl font-bold">{stats.excellent}</div>
                      <div className="text-sm text-gray-600">({stats.excellentPercent}%)</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-blue-600 font-medium text-lg">ดี</div>
                      <div className="text-2xl font-bold">{stats.good}</div>
                      <div className="text-sm text-gray-600">({stats.goodPercent}%)</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-yellow-600 font-medium text-lg">ผ่าน</div>
                      <div className="text-2xl font-bold">{stats.pass}</div>
                      <div className="text-sm text-gray-600">({stats.passPercent}%)</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-red-600 font-medium text-lg">ไม่ผ่าน</div>
                      <div className="text-2xl font-bold">{stats.fail}</div>
                      <div className="text-sm text-gray-600">({stats.failPercent}%)</div>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pt-8 border-t">
                  <div className="text-center">
                    <p className="mb-16">ผู้ประเมิน (ครูประจำชั้น)</p>
                    <div className="border-b border-black w-48 mx-auto mb-2"></div>
                    <Input
                      value={teacher}
                      onChange={(e) => setTeacher(e.target.value)}
                      placeholder="ชื่อครูประจำชั้น"
                      className="text-center border-none text-sm"
                    />
                  </div>
                  <div className="text-center">
                    <p className="mb-16">ผู้รับรอง (ผู้อำนวยการ)</p>
                    <div className="border-b border-black w-48 mx-auto mb-2"></div>
                    <Input
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      placeholder="ชื่อผู้อำนวยการ"
                      className="text-center border-none text-sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-8 mt-8 border-t">
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    ตัวอย่างก่อนพิมพ์
                  </Button>
                  
                  <Button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Printer className="h-4 w-4" />
                    พิมพ์
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Print Preview Dialog */}
      <CompetencyPrintPreviewDialog
        isOpen={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        studentsWithAssessments={studentsWithAssessments}
        academicYear={academicYear}
        gradeLevel={gradeLevel}
        teacher={teacher}
        principal={principal}
      />
    </div>
  );
};