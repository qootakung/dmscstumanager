import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import { Student } from '@/types/student';
import { toast } from 'sonner';
import { generateEmptyRowsHtml } from '@/utils/pp5PrintUtils';
import { SubjectInfo } from './types';

interface ElectiveScoreEntryProps {
  subjectInfo: SubjectInfo;
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

interface ElectiveScoreData {
  maxScorePerOutcome: number;
  endYearMaxScore: number;
  learningOutcomes: number;
  studentScores: {
    [studentId: string]: {
      outcomes: { [outcomeIndex: string]: number };
      endYearScore: number;
    };
  };
}

const getStorageKey = (subjectId: string, grade: string, year: string, semester: string) =>
  `pp5-elective-scores-${subjectId}-${grade}-${year}-${semester}`;

const calculateGradeLevel = (totalScore: number): number => {
  if (totalScore >= 80) return 4;
  if (totalScore >= 75) return 3.5;
  if (totalScore >= 70) return 3;
  if (totalScore >= 65) return 2.5;
  if (totalScore >= 60) return 2;
  if (totalScore >= 55) return 1.5;
  if (totalScore >= 50) return 1;
  return 0;
};

const getGradeLabel = (grade: number): string => {
  if (grade >= 4) return 'ดีเยี่ยม';
  if (grade >= 3.5) return 'ดีมาก';
  if (grade >= 3) return 'ดี';
  if (grade >= 2.5) return 'ค่อนข้างดี';
  if (grade >= 2) return 'พอใช้';
  if (grade >= 1.5) return 'พอใช้';
  if (grade >= 1) return 'ผ่าน';
  return 'ไม่ผ่าน';
};

const MAX_COLS_PER_PAGE = 17;

const ElectiveScoreEntry: React.FC<ElectiveScoreEntryProps> = ({
  subjectInfo,
  selectedGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const gradeKey = selectedGrade;
  const gradeNum = gradeKey.replace('ป.', '');

  // Load learning outcomes count from subject config stored in localStorage
  const learningOutcomes = useMemo(() => {
    const basicKey = `pp5-basic-${selectedGrade}-${selectedAcademicYear}-${selectedSemester}`;
    const saved = localStorage.getItem(basicKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const subj = data.subjects?.find((s: any) => s.id === subjectInfo.id);
        if (subj?.learningOutcomes) return subj.learningOutcomes;
      } catch { }
    }
    // Default: try to get from the subject's metadata or default 8
    return (subjectInfo as any).learningOutcomes || 8;
  }, [subjectInfo, selectedGrade, selectedAcademicYear, selectedSemester]);

  const [scoreData, setScoreData] = useState<ElectiveScoreData>({
    maxScorePerOutcome: 10,
    endYearMaxScore: 20,
    learningOutcomes,
    studentScores: {},
  });

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      const filtered = allStudents.filter(s =>
        s.grade === selectedGrade &&
        s.academicYear === selectedAcademicYear &&
        s.semester === selectedSemester
      );
      setStudents(filtered);
      setLoading(false);
    };
    loadStudents();
  }, [selectedGrade, selectedAcademicYear, selectedSemester]);

  // Load saved scores
  useEffect(() => {
    const key = getStorageKey(subjectInfo.id, gradeKey, selectedAcademicYear, selectedSemester);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScoreData(prev => ({ ...prev, ...parsed }));
      } catch {
        // keep defaults
      }
    }
  }, [subjectInfo.id, gradeKey, selectedAcademicYear, selectedSemester]);

  const getScore = (studentId: string, outcomeIdx: number): number =>
    scoreData.studentScores[studentId]?.outcomes?.[outcomeIdx.toString()] ?? 0;

  const getEndYearScore = (studentId: string): number =>
    scoreData.studentScores[studentId]?.endYearScore ?? 0;

  const updateScore = useCallback((studentId: string, outcomeIdx: number, value: number) => {
    const clamped = Math.max(0, Math.min(value, scoreData.maxScorePerOutcome));
    setScoreData(prev => ({
      ...prev,
      studentScores: {
        ...prev.studentScores,
        [studentId]: {
          ...prev.studentScores[studentId],
          outcomes: {
            ...(prev.studentScores[studentId]?.outcomes || {}),
            [outcomeIdx.toString()]: clamped,
          },
          endYearScore: prev.studentScores[studentId]?.endYearScore ?? 0,
        },
      },
    }));
  }, [scoreData.maxScorePerOutcome]);

  const updateEndYearScore = useCallback((studentId: string, value: number) => {
    const clamped = Math.max(0, Math.min(value, scoreData.endYearMaxScore));
    setScoreData(prev => ({
      ...prev,
      studentScores: {
        ...prev.studentScores,
        [studentId]: {
          ...prev.studentScores[studentId],
          outcomes: prev.studentScores[studentId]?.outcomes || {},
          endYearScore: clamped,
        },
      },
    }));
  }, [scoreData.endYearMaxScore]);

  const getMidYearTotal = (studentId: string): number => {
    let sum = 0;
    for (let i = 1; i <= learningOutcomes; i++) {
      sum += getScore(studentId, i);
    }
    return sum;
  };

  const getMidYearMax = (): number => learningOutcomes * scoreData.maxScorePerOutcome;

  const getTotalScore = (studentId: string): number => {
    const midYearTotal = getMidYearTotal(studentId);
    const endYear = getEndYearScore(studentId);
    const totalMax = getMidYearMax() + scoreData.endYearMaxScore;
    // Convert to percentage (100-based)
    return totalMax > 0 ? (midYearTotal + endYear) / totalMax * 100 : 0;
  };

  const handleSave = () => {
    const key = getStorageKey(subjectInfo.id, gradeKey, selectedAcademicYear, selectedSemester);
    localStorage.setItem(key, JSON.stringify(scoreData));
    toast.success('บันทึกคะแนนเรียบร้อยแล้ว');
  };

  // Calculate pages for display
  const outcomeIndices = Array.from({ length: learningOutcomes }, (_, i) => i + 1);
  const pages: number[][] = [];
  for (let i = 0; i < outcomeIndices.length; i += MAX_COLS_PER_PAGE) {
    pages.push(outcomeIndices.slice(i, i + MAX_COLS_PER_PAGE));
  }

  // Semester score (50-based) calculation
  const getSemesterScore = (studentId: string): number => {
    const totalPercent = getTotalScore(studentId);
    return totalPercent / 2; // Convert 100-based to 50-based
  };

  const handlePrint = () => {
    const subjectName = subjectInfo.name;
    const gradeLabel = `ประถมศึกษาปีที่ ${gradeNum}`;

    // Generate pages HTML
    let pagesHtml = '';

    // Page 1 onwards: score table pages with outcomes
    pages.forEach((pageOutcomes, pageIdx) => {
      const isLastPage = pageIdx === pages.length - 1;
      const showSummary = isLastPage;

      pagesHtml += `
        <div style="page-break-before:${pageIdx > 0 ? 'always' : 'auto'}; padding:1cm;">
          <div style="text-align:center; margin-bottom:10px;">
            <div style="font-size:16pt; font-weight:bold;">แบบประเมินนักเรียนตามผลการเรียนรู้ สาระการเรียนรู้${subjectName}</div>
            <div style="font-size:14pt;">ชั้น${gradeLabel} ปีการศึกษา ${selectedAcademicYear}</div>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:11pt;">
            <thead>
              <tr>
                <th rowspan="2" style="border:1px solid #000; padding:4px; width:30px;">ที่</th>
                <th rowspan="2" style="border:1px solid #000; padding:4px; min-width:120px;">ชื่อ-นามสกุล</th>
                <th colspan="${pageOutcomes.length}" style="border:1px solid #000; padding:4px;">คะแนนผลการเรียนรู้ชั้นปี</th>
                ${showSummary ? `
                  <th rowspan="2" style="border:1px solid #000; padding:4px; width:50px;">รวม<br/>ระหว่าง<br/>ปี</th>
                  <th rowspan="2" style="border:1px solid #000; padding:4px; width:50px;">สอบ<br/>ปลาย<br/>ปี</th>
                  <th rowspan="2" style="border:1px solid #000; padding:4px; width:50px;">รวม<br/>คะแนน<br/>ทั้งปี</th>
                  <th rowspan="2" style="border:1px solid #000; padding:4px; width:40px;">ระดับ</th>
                  <th rowspan="2" style="border:1px solid #000; padding:4px; width:50px;">เกณฑ์</th>
                ` : `
                  ${Array(MAX_COLS_PER_PAGE - pageOutcomes.length).fill('<th style="border:1px solid #000; padding:4px; width:25px;">&nbsp;</th>').join('')}
                `}
              </tr>
              <tr>
                ${pageOutcomes.map(idx => `
                  <th style="border:1px solid #000; padding:2px 4px; width:25px;">
                    <div style="font-size:9pt;">ผลการเรียนรู้</div>
                    <div>${idx}</div>
                  </th>
                `).join('')}
              </tr>
              <tr style="background:#f0f0f0;">
                <td style="border:1px solid #000; padding:2px;"></td>
                <td style="border:1px solid #000; padding:2px;"></td>
                ${pageOutcomes.map(() => `<td style="border:1px solid #000; padding:2px; text-align:center;">คะแนนเต็ม</td>`).join('')}
                ${showSummary ? `
                  <td style="border:1px solid #000; padding:2px; text-align:center;">${getMidYearMax()}</td>
                  <td style="border:1px solid #000; padding:2px; text-align:center;">${scoreData.endYearMaxScore}</td>
                  <td style="border:1px solid #000; padding:2px; text-align:center;">${getMidYearMax() + scoreData.endYearMaxScore}</td>
                  <td style="border:1px solid #000; padding:2px;"></td>
                  <td style="border:1px solid #000; padding:2px;"></td>
                ` : ''}
              </tr>
              <tr>
                <td style="border:1px solid #000; padding:2px;"></td>
                <td style="border:1px solid #000; padding:2px;"></td>
                ${pageOutcomes.map(() => `<td style="border:1px solid #000; padding:2px; text-align:center;">${scoreData.maxScorePerOutcome}</td>`).join('')}
                ${showSummary ? '<td colspan="5" style="border:1px solid #000;"></td>' : ''}
              </tr>
            </thead>
            <tbody>
              ${students.map((student, idx) => {
                const totalPercent = getTotalScore(student.id);
                const grade = calculateGradeLevel(totalPercent);
                const label = getGradeLabel(grade);
                return `
                  <tr>
                    <td style="border:1px solid #000; padding:2px 4px; text-align:center;">${idx + 1}</td>
                    <td style="border:1px solid #000; padding:2px 4px; white-space:nowrap;">${student.titleTh || ''}${student.firstNameTh || ''} ${student.lastNameTh || ''}</td>
                    ${pageOutcomes.map(oi => `<td style="border:1px solid #000; padding:2px 4px; text-align:center;">${getScore(student.id, oi) || ''}</td>`).join('')}
                    ${showSummary ? `
                      <td style="border:1px solid #000; padding:2px 4px; text-align:center;">${getMidYearTotal(student.id)}</td>
                      <td style="border:1px solid #000; padding:2px 4px; text-align:center;">${getEndYearScore(student.id)}</td>
                      <td style="border:1px solid #000; padding:2px 4px; text-align:center;">${getMidYearTotal(student.id) + getEndYearScore(student.id)}</td>
                      <td style="border:1px solid #000; padding:2px 4px; text-align:center; font-weight:bold;">${grade}</td>
                      <td style="border:1px solid #000; padding:2px 4px; text-align:center;">${label}</td>
                    ` : ''}
                  </tr>
                `;
              }).join('')}
              ${generateEmptyRowsHtml(students.length, pageOutcomes.length + 2 + (showSummary ? 5 : 0), true, 35)}
            </tbody>
          </table>
        </div>
      `;
    });

    // Page: Semester report (แบบรายงานผลการเรียนภาคเรียนที่)
    pagesHtml += `
      <div style="page-break-before:always; padding:1cm;">
        <div style="text-align:center; margin-bottom:10px;">
          <div style="font-size:16pt; font-weight:bold;">แบบรายงานผลการเรียนภาคเรียนที่ ${selectedSemester} สาระการเรียนรู้${subjectName}</div>
          <div style="font-size:14pt;">ชั้น${gradeLabel} ปีการศึกษา ${selectedAcademicYear}</div>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:12pt;">
          <thead>
            <tr>
              <th rowspan="2" style="border:1px solid #000; padding:6px; width:40px;">ที่</th>
              <th rowspan="2" style="border:1px solid #000; padding:6px;" colspan="2">ชื่อ-นามสกุล</th>
              <th colspan="2" style="border:1px solid #000; padding:6px;">คะแนนเต็ม</th>
            </tr>
            <tr>
              <th style="border:1px solid #000; padding:6px; width:80px;">${getMidYearMax() / 2 + scoreData.endYearMaxScore / 2}</th>
              <th style="border:1px solid #000; padding:6px; width:80px;">ได้</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              const semScore = getSemesterScore(student.id);
              return `
                <tr>
                  <td style="border:1px solid #000; padding:4px 6px; text-align:center;">${idx + 1}</td>
                  <td style="border:1px solid #000; padding:4px 6px;">${student.titleTh || ''}${student.firstNameTh || ''}</td>
                  <td style="border:1px solid #000; padding:4px 6px;">${student.lastNameTh || ''}</td>
                  <td style="border:1px solid #000; padding:4px 6px; text-align:center;">${getMidYearMax() / 2 + scoreData.endYearMaxScore / 2}</td>
                  <td style="border:1px solid #000; padding:4px 6px; text-align:center;">${semScore.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
            ${generateEmptyRowsHtml(students.length, 5, true, 35)}
          </tbody>
        </table>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head>
        <title>${subjectName} - ป.${gradeNum}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          body { font-family: 'TH SarabunPSK', 'TH Sarabun New', sans-serif; margin: 0; }
          @media print { .no-print { display: none; } }
        </style>
      </head><body>
        ${pagesHtml}
        <script>setTimeout(()=>window.print(),500);</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-primary">
              กรอกคะแนน: {subjectInfo.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedGrade} ภาคเรียนที่ {selectedSemester} ปีการศึกษา {selectedAcademicYear} | ผลการเรียนรู้ {learningOutcomes} ตัว
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />พิมพ์
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" />บันทึก
          </Button>
        </div>
      </div>

      {/* Score config */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium">คะแนนเต็มต่อผลการเรียนรู้</label>
              <Input
                type="number"
                className="w-24 h-8"
                value={scoreData.maxScorePerOutcome}
                onChange={(e) => setScoreData(prev => ({ ...prev, maxScorePerOutcome: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">คะแนนสอบปลายปี</label>
              <Input
                type="number"
                className="w-24 h-8"
                value={scoreData.endYearMaxScore}
                onChange={(e) => setScoreData(prev => ({ ...prev, endYearMaxScore: parseInt(e.target.value) || 20 }))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              รวมคะแนนเต็ม: <strong>{getMidYearMax() + scoreData.endYearMaxScore}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Table */}
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="bg-orange-100">
                <th className="border border-gray-300 px-2 py-1.5 text-center w-10">ที่</th>
                <th className="border border-gray-300 px-2 py-1.5 text-left min-w-[140px]">ชื่อ-นามสกุล</th>
                {outcomeIndices.map(i => (
                  <th key={i} className="border border-gray-300 px-1 py-1.5 text-center w-12">
                    <div className="text-[10px] leading-tight">ผลการ<br />เรียนรู้</div>
                    <div>{i}</div>
                  </th>
                ))}
                <th className="border border-gray-300 px-1 py-1.5 text-center w-14 bg-blue-100">
                  <div className="text-[10px] leading-tight">รวม<br />ระหว่างปี</div>
                </th>
                <th className="border border-gray-300 px-1 py-1.5 text-center w-14 bg-blue-100">
                  <div className="text-[10px] leading-tight">สอบ<br />ปลายปี</div>
                </th>
                <th className="border border-gray-300 px-1 py-1.5 text-center w-14 bg-green-100">
                  <div className="text-[10px] leading-tight">รวม<br />ทั้งปี</div>
                </th>
                <th className="border border-gray-300 px-1 py-1.5 text-center w-12 bg-yellow-100">ระดับ</th>
                <th className="border border-gray-300 px-1 py-1.5 text-center w-14 bg-yellow-100">เกณฑ์</th>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-1 py-1 text-center text-xs"></td>
                <td className="border border-gray-300 px-1 py-1 text-xs">คะแนนเต็ม</td>
                {outcomeIndices.map(i => (
                  <td key={i} className="border border-gray-300 px-1 py-1 text-center text-xs font-medium">{scoreData.maxScorePerOutcome}</td>
                ))}
                <td className="border border-gray-300 px-1 py-1 text-center text-xs font-medium">{getMidYearMax()}</td>
                <td className="border border-gray-300 px-1 py-1 text-center text-xs font-medium">{scoreData.endYearMaxScore}</td>
                <td className="border border-gray-300 px-1 py-1 text-center text-xs font-medium">{getMidYearMax() + scoreData.endYearMaxScore}</td>
                <td className="border border-gray-300" colSpan={2}></td>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const midTotal = getMidYearTotal(student.id);
                const endYear = getEndYearScore(student.id);
                const total = midTotal + endYear;
                const totalMax = getMidYearMax() + scoreData.endYearMaxScore;
                const percent = totalMax > 0 ? total / totalMax * 100 : 0;
                const grade = calculateGradeLevel(percent);
                const label = getGradeLabel(grade);

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border border-gray-300 px-2 py-1 whitespace-nowrap text-xs">
                      {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                    </td>
                    {outcomeIndices.map(i => (
                      <td key={i} className="border border-gray-300 px-0 py-0 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={scoreData.maxScorePerOutcome}
                          value={getScore(student.id, i) || ''}
                          onChange={(e) => updateScore(student.id, i, parseInt(e.target.value) || 0)}
                          className="w-full h-7 text-center text-xs border-0 rounded-none"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 px-1 py-1 text-center text-xs font-medium bg-blue-50">{midTotal}</td>
                    <td className="border border-gray-300 px-0 py-0 text-center bg-blue-50">
                      <Input
                        type="number"
                        min={0}
                        max={scoreData.endYearMaxScore}
                        value={endYear || ''}
                        onChange={(e) => updateEndYearScore(student.id, parseInt(e.target.value) || 0)}
                        className="w-full h-7 text-center text-xs border-0 rounded-none"
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1 text-center text-xs font-bold bg-green-50">{total}</td>
                    <td className="border border-gray-300 px-1 py-1 text-center text-xs font-bold bg-yellow-50">{grade}</td>
                    <td className="border border-gray-300 px-1 py-1 text-center text-xs bg-yellow-50">{label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectiveScoreEntry;
