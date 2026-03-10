
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { allSubjectGroups } from '@/data/curriculumIndicators';
import { getStudents } from '@/utils/studentStorage';
import { Student } from '@/types/student';
import { generateEmptyRowsHtml } from '@/utils/pp5PrintUtils';

interface AchievementSummaryReportProps {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

// All subjects to show in the summary (order matters)
const ALL_SUBJECTS = [
  { menuId: 'thai', groupId: 'thai', strandFilter: undefined, shortName: 'ภาษาไทย', creditDefault: 5.0 },
  { menuId: 'math', groupId: 'math', strandFilter: undefined, shortName: 'คณิตศาสตร์', creditDefault: 5.0 },
  { menuId: 'science', groupId: 'science', strandFilter: undefined, shortName: 'วิทยาศาสตร์และเทคโนโลยี', creditDefault: 2.0 },
  { menuId: 'social', groupId: 'social', strandFilter: (s: string) => !s.includes('ประวัติศาสตร์'), shortName: 'สังคมศึกษา ศาสนาและวัฒนธรรม', creditDefault: 1.0 },
  { menuId: 'history', groupId: 'social', strandFilter: (s: string) => s.includes('ประวัติศาสตร์'), shortName: 'ประวัติศาสตร์', creditDefault: 1.0 },
  { menuId: 'health', groupId: 'health', strandFilter: undefined, shortName: 'สุขศึกษาและพลศึกษา', creditDefault: 1.0 },
  { menuId: 'art', groupId: 'arts', strandFilter: undefined, shortName: 'ศิลปะ', creditDefault: 1.0 },
  { menuId: 'career', groupId: 'career', strandFilter: undefined, shortName: 'การงานอาชีพ', creditDefault: 1.0 },
  { menuId: 'english', groupId: 'english', strandFilter: undefined, shortName: 'ภาษาอังกฤษ', creditDefault: 1.0 },
  { menuId: 'anti-corruption', groupId: null, strandFilter: undefined, shortName: 'ป้องกันการทุจริต', creditDefault: 1.0 },
  { menuId: 'elective1', groupId: null, strandFilter: undefined, shortName: 'วิชาเพิ่มเติม 1', creditDefault: 1.0 },
];

const getScoreStorageKey = (menuId: string, grade: string, year: string, semester: string) =>
  `pp5-indicator-scores-${menuId}-${grade}-${year}-${semester}`;

const getRatioStorageKey = (grade: string, year: string, semester: string) =>
  `pp5-score-ratio-${grade}-${year}-${semester}`;

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

interface SubjectResult {
  menuId: string;
  shortName: string;
  credit: number;
  // Per student: { studentId: { grade, score100 } }
  studentResults: Record<string, { grade: number; score100: number }>;
}

const AchievementSummaryReport: React.FC<AchievementSummaryReportProps> = ({
  selectedGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectResults, setSubjectResults] = useState<SubjectResult[]>([]);

  const gradeKey = selectedGrade;
  const gradeNum = gradeKey.replace('ป.', '');

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      const filtered = allStudents.filter(s =>
        s.grade === selectedGrade && s.academicYear === selectedAcademicYear && s.semester === selectedSemester
      );
      setStudents(filtered);
      setLoading(false);
    };
    loadStudents();
  }, [selectedGrade, selectedAcademicYear, selectedSemester]);

  // Calculate results for all subjects
  useEffect(() => {
    if (students.length === 0) return;

    const ratioKey = getRatioStorageKey(gradeKey, selectedAcademicYear, selectedSemester);
    const savedRatios = localStorage.getItem(ratioKey);
    let ratioData: any[] = [];
    if (savedRatios) {
      try { ratioData = JSON.parse(savedRatios); } catch {}
    }

    const results: SubjectResult[] = ALL_SUBJECTS.map(subject => {
      const scoreKey = getScoreStorageKey(subject.menuId, gradeKey, selectedAcademicYear, selectedSemester);
      const saved = localStorage.getItem(scoreKey);
      let scoreData = { maxScorePerIndicator: 10, studentScores: {} as any };
      if (saved) {
        try { scoreData = JSON.parse(saved); } catch {}
      }

      // Get weights for this subject from ratio config
      let midYearWeight = 0;
      let endYearWeight = 0;
      let standardWeights: Record<string, number> = {};

      if (subject.groupId) {
        const matchingGroup = ratioData.find((r: any) => r.groupId === subject.groupId);
        if (matchingGroup) {
          endYearWeight = matchingGroup.endYearScore || 0;
          matchingGroup.strands?.forEach((strand: any) => {
            if (subject.strandFilter && !subject.strandFilter(strand.strandName)) return;
            strand.standards?.forEach((std: any) => {
              standardWeights[std.standardCode] = std.score;
              midYearWeight += std.score;
            });
          });
        }
      }

      const grandTotalWeight = midYearWeight + endYearWeight;

      // Build indicator groups for this subject
      const group = subject.groupId ? allSubjectGroups.find(g => g.id === subject.groupId) : null;
      const indicatorGroups: { standardCode: string; weight: number; indicators: { id: string }[] }[] = [];
      if (group) {
        group.subjects.forEach(sub => {
          if (subject.strandFilter && !subject.strandFilter(sub.strand)) return;
          sub.standards.forEach(standard => {
            const indicators = standard.indicators[gradeKey];
            if (!indicators || indicators.length === 0) return;
            indicatorGroups.push({
              standardCode: standard.code,
              weight: standardWeights[standard.code] || 0,
              indicators: indicators.map(ind => ({ id: ind.id })),
            });
          });
        });
      }

      // Calculate per student
      const studentResults: Record<string, { grade: number; score100: number }> = {};
      students.forEach(student => {
        const studentScores = scoreData.studentScores[student.id];
        if (!studentScores) {
          studentResults[student.id] = { grade: 0, score100: 0 };
          return;
        }

        // Calculate mid-year total from indicators
        let midYearTotal = 0;
        indicatorGroups.forEach(ig => {
          if (ig.weight === 0) return;
          const totalMax = ig.indicators.length * scoreData.maxScorePerIndicator;
          if (totalMax === 0) return;
          const totalScore = ig.indicators.reduce((sum, ind) => {
            return sum + (studentScores.indicators?.[ind.id] ?? 0);
          }, 0);
          midYearTotal += (totalScore / totalMax) * ig.weight;
        });

        const endYear = studentScores.endYearScore ?? 0;
        const total = midYearTotal + endYear;
        const score100 = grandTotalWeight > 0 ? (total / grandTotalWeight) * 100 : 0;
        const grade = calculateGradeLevel(score100);

        studentResults[student.id] = { grade, score100: parseFloat(score100.toFixed(2)) };
      });

      return {
        menuId: subject.menuId,
        shortName: subject.shortName,
        credit: subject.creditDefault,
        studentResults,
      };
    });

    setSubjectResults(results);
  }, [students, gradeKey, selectedAcademicYear, selectedSemester]);

  // Calculate student summaries
  const studentSummaries = useMemo(() => {
    if (subjectResults.length === 0) return [];

    return students.map(student => {
      let totalCredits = 0;
      let weightedGradeSum = 0;
      let totalScore100Sum = 0;
      let subjectCount = 0;

      subjectResults.forEach(sr => {
        const result = sr.studentResults[student.id];
        if (result) {
          weightedGradeSum += result.grade * sr.credit;
          totalCredits += sr.credit;
          totalScore100Sum += result.score100;
          subjectCount++;
        }
      });

      const gradeAvg = totalCredits > 0 ? weightedGradeSum / totalCredits : 0;
      const scoreAvg = subjectCount > 0 ? totalScore100Sum / subjectCount : 0;

      return {
        student,
        gradeAvg: parseFloat(gradeAvg.toFixed(2)),
        scoreAvg: parseFloat(scoreAvg.toFixed(2)),
        grades: subjectResults.map(sr => sr.studentResults[student.id]?.grade ?? 0),
        scores: subjectResults.map(sr => sr.studentResults[student.id]?.score100 ?? 0),
      };
    });
  }, [students, subjectResults]);

  // Rank by grade average
  const gradeRanked = useMemo(() => {
    const sorted = [...studentSummaries].sort((a, b) => b.gradeAvg - a.gradeAvg);
    return studentSummaries.map(s => {
      const rank = sorted.findIndex(x => x.student.id === s.student.id) + 1;
      return { ...s, gradeRank: rank };
    });
  }, [studentSummaries]);

  // Rank by score average
  const scoreRanked = useMemo(() => {
    const sorted = [...studentSummaries].sort((a, b) => b.scoreAvg - a.scoreAvg);
    return studentSummaries.map(s => {
      const rank = sorted.findIndex(x => x.student.id === s.student.id) + 1;
      return { ...s, scoreRank: rank };
    });
  }, [studentSummaries]);

  // Compute subject averages for score page
  const subjectScoreAverages = useMemo(() => {
    return subjectResults.map(sr => {
      const scores = students.map(s => sr.studentResults[s.id]?.score100 ?? 0);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return parseFloat(avg.toFixed(1));
    });
  }, [subjectResults, students]);

  // Total credits
  const totalCredits = useMemo(() => subjectResults.reduce((s, sr) => s + sr.credit, 0), [subjectResults]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=700');
    if (!printWindow) return;

    const title = `ผลสัมฤทธิ์ทางการเรียนของนักเรียนชั้นประถมศึกษาปีที่ ${gradeNum} ปีการศึกษา ${selectedAcademicYear}`;
    const subtitle = `โรงเรียนบ้านดอนมูล ตำบลบ้านปวง อำเภอทุ่งหัวช้าง จังหวัดลำพูน\nสำนักงานเขตพื้นที่การศึกษาประถมศึกษาลำพูน เขต 2`;

    const subjectHeaders = subjectResults.map(sr => 
      `<th class="subject-header"><div class="rotated-text">${sr.shortName}</div></th>`
    ).join('');

    const creditRow = subjectResults.map(sr => 
      `<td class="text-center">${sr.credit.toFixed(1)}</td>`
    ).join('');

    // Page 1: Grades
    const gradeRows = students.map((student, idx) => {
      const summary = gradeRanked.find(s => s.student.id === student.id)!;
      const gradeCells = summary.grades.map(g => `<td class="text-center">${g > 0 ? g.toFixed(g % 1 === 0 ? 0 : 1) : ''}</td>`).join('');
      return `<tr>
        <td class="text-center">${idx + 1}</td>
        <td class="name-cell">${student.titleTh || ''}${student.firstNameTh || ''}</td>
        <td class="name-cell">${student.lastNameTh || ''}</td>
        ${gradeCells}
        <td class="text-center font-bold">${summary.gradeAvg.toFixed(2)}</td>
        <td class="text-center">${summary.gradeRank}</td>
      </tr>`;
    }).join('');

    // Page 2: Scores  
    const maxScoreRow = subjectResults.map(() => `<td class="text-center">100</td>`).join('');
    
    const scoreRows = students.map((student, idx) => {
      const summary = scoreRanked.find(s => s.student.id === student.id)!;
      const scoreCells = summary.scores.map(s => `<td class="text-center">${s > 0 ? Math.round(s) : ''}</td>`).join('');
      return `<tr>
        <td class="text-center">${idx + 1}</td>
        <td class="name-cell">${student.titleTh || ''}${student.firstNameTh || ''}</td>
        <td class="name-cell">${student.lastNameTh || ''}</td>
        ${scoreCells}
        <td class="text-center font-bold">${summary.scoreAvg.toFixed(2)}</td>
        <td class="text-center">${summary.scoreRank}</td>
      </tr>`;
    }).join('');

    const avgRow = subjectScoreAverages.map(a => `<td class="text-center font-bold">${a.toFixed(1)}</td>`).join('');
    const totalScoreAvg = subjectScoreAverages.length > 0 
      ? (subjectScoreAverages.reduce((a, b) => a + b, 0) / subjectScoreAverages.length).toFixed(1) 
      : '0';

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif; font-size: 14pt; }
            @page { size: A4 portrait; margin: 8mm 6mm; }
            .page { page-break-after: always; padding: 2mm 0; }
            .page:last-child { page-break-after: auto; }
            .title { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 0; }
            .subtitle { font-size: 13pt; text-align: center; margin-bottom: 4px; white-space: pre-line; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td { border: 1px solid #333; padding: 1px 3px; font-size: 12pt; }
            th { background: #dbeafe; text-align: center; font-weight: bold; }
            td.text-center { text-align: center; }
            td.name-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12pt; padding-left: 4px; }
            .font-bold { font-weight: bold; }
            .subject-header { 
              height: 140px; 
              vertical-align: bottom; 
              padding: 2px !important;
              width: 40px;
            }
            .rotated-text {
              writing-mode: vertical-rl;
              transform: rotate(180deg);
              text-align: left;
              font-size: 12pt;
              font-weight: bold;
              white-space: nowrap;
              margin: 0 auto;
            }
            .col-no { width: 25px; }
            .col-fname { width: 100px; }
            .col-lname { width: 70px; }
            .col-avg { width: 45px; }
            .col-rank { width: 38px; }
            .col-subject { width: 40px; }
            tr:nth-child(even) { background: #f8fafc; }
            @media print { 
              body { padding: 0; } 
              .page { padding: 0; }
              tr:nth-child(even) { background: #f8fafc !important; }
              th { background: #dbeafe !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <!-- Page 1: Grades -->
          <div class="page">
            <div class="title">${title}</div>
            <div class="subtitle">${subtitle.replace(/\n/g, '<br/>')}</div>
            <table>
              <thead>
                <tr>
                  <th rowspan="2" class="col-no">เลข<br/>ที่</th>
                  <th rowspan="2" class="col-fname">ชื่อ นามสกุล</th>
                  <th rowspan="2" class="col-lname" style="border-left:none"></th>
                  <th colspan="${subjectResults.length}" style="font-size:11pt">กลุ่มสาระ<br/>การเรียนรู้</th>
                  <th rowspan="2" class="col-avg">เกรด<br/>เฉลี่ย</th>
                  <th rowspan="2" class="col-rank">เรียง<br/>ลำดับที่<br/>จาก<br/>เกรด<br/>เฉลี่ย</th>
                </tr>
                <tr>
                  ${subjectHeaders}
                </tr>
              </thead>
              <tbody>
                <tr style="font-weight:bold; background:#e2e8f0">
                  <td colspan="3" class="text-center" style="font-style:italic">จำนวนหน่วยกิต</td>
                  ${creditRow}
                  <td class="text-center">${totalCredits.toFixed(1)}</td>
                  <td></td>
                </tr>
                ${gradeRows}
              </tbody>
            </table>
          </div>

          <!-- Page 2: Scores -->
          <div class="page">
            <div class="title">${title}</div>
            <div class="subtitle">${subtitle.replace(/\n/g, '<br/>')}</div>
            <table>
              <thead>
                <tr>
                  <th rowspan="2" class="col-no">เลข<br/>ที่</th>
                  <th rowspan="2" class="col-fname">ชื่อ นามสกุล</th>
                  <th rowspan="2" class="col-lname" style="border-left:none"></th>
                  <th colspan="${subjectResults.length}" style="font-size:11pt">กลุ่มสาระ<br/>การเรียนรู้</th>
                  <th rowspan="2" class="col-avg">คะแนน<br/>เฉลี่ย<br/>ร้อยละ</th>
                  <th rowspan="2" class="col-rank">เรียง<br/>ลำดับที่<br/>จาก<br/>คะแนน<br/>เฉลี่ย</th>
                </tr>
                <tr>
                  ${subjectHeaders}
                </tr>
              </thead>
              <tbody>
                <tr style="font-weight:bold; background:#e2e8f0">
                  <td colspan="3" class="text-center" style="font-style:italic">คะแนนเต็ม</td>
                  ${maxScoreRow}
                  <td class="text-center">100</td>
                  <td></td>
                </tr>
                ${scoreRows}
                <tr style="font-weight:bold; background:#e2e8f0">
                  <td colspan="3" class="text-center">คะแนนเฉลี่ย</td>
                  ${avgRow}
                  <td class="text-center">${totalScoreAvg}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
          </Button>
          <div>
            <h2 className="text-lg font-bold text-primary">แบบสรุปผลสัมฤทธิ์ทางการเรียน</h2>
            <p className="text-sm text-muted-foreground">
              ชั้น{gradeKey} ปีการศึกษา {selectedAcademicYear} ภาคเรียนที่ {selectedSemester}
            </p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-1">
          <Printer className="w-4 h-4" /> พิมพ์ A4
        </Button>
      </div>

      {loading ? (
        <Card><CardContent className="py-8 text-center">กำลังโหลดข้อมูล...</CardContent></Card>
      ) : students.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">ไม่พบข้อมูลนักเรียน</CardContent></Card>
      ) : (
        <>
          {/* Page 1 Preview: Grades */}
          <Card className="border-2 shadow-md">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-t-lg">
              <CardTitle className="text-base">หน้าที่ 1: เกรดเฉลี่ยรายวิชา</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th rowSpan={2} className="border border-gray-300 px-1 py-1 w-8 text-center">ที่</th>
                      <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-left" colSpan={2}>ชื่อ นามสกุล</th>
                      {subjectResults.map((sr, i) => (
                        <th key={i} className="border border-gray-300 px-0 py-1 text-center" style={{ height: 100, verticalAlign: 'bottom', width: 36 }}>
                          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', margin: '0 auto' }}>
                            {sr.shortName}
                          </div>
                        </th>
                      ))}
                      <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center w-12">เกรด<br/>เฉลี่ย</th>
                      <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center w-10">ลำดับ</th>
                    </tr>
                    <tr className="bg-blue-50">
                      {/* Empty because subjects are rowSpan=1 with rotated text */}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="border border-gray-300 px-2 py-1 text-center italic text-xs">จำนวนหน่วยกิต</td>
                      {subjectResults.map((sr, i) => (
                        <td key={i} className="border border-gray-300 px-1 py-1 text-center">{sr.credit.toFixed(1)}</td>
                      ))}
                      <td className="border border-gray-300 px-1 py-1 text-center font-bold">{totalCredits.toFixed(1)}</td>
                      <td className="border border-gray-300"></td>
                    </tr>
                    {students.map((student, idx) => {
                      const summary = gradeRanked.find(s => s.student.id === student.id)!;
                      if (!summary) return null;
                      return (
                        <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 whitespace-nowrap">{student.titleTh}{student.firstNameTh}</td>
                          <td className="border border-gray-300 px-1 py-0.5 whitespace-nowrap">{student.lastNameTh}</td>
                          {summary.grades.map((g, gi) => (
                            <td key={gi} className="border border-gray-300 px-1 py-0.5 text-center">
                              {g > 0 ? (g % 1 === 0 ? g : g.toFixed(1)) : ''}
                            </td>
                          ))}
                          <td className="border border-gray-300 px-1 py-0.5 text-center font-bold">{summary.gradeAvg.toFixed(2)}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{summary.gradeRank}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Page 2 Preview: Scores */}
          <Card className="border-2 shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-t-lg">
              <CardTitle className="text-base">หน้าที่ 2: คะแนนรายวิชา (คะแนนเต็ม 100)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-100">
                      <th rowSpan={2} className="border border-gray-300 px-1 py-1 w-8 text-center">ที่</th>
                      <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-left" colSpan={2}>ชื่อ นามสกุล</th>
                      {subjectResults.map((sr, i) => (
                        <th key={i} className="border border-gray-300 px-0 py-1 text-center" style={{ height: 100, verticalAlign: 'bottom', width: 36 }}>
                          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', margin: '0 auto' }}>
                            {sr.shortName}
                          </div>
                        </th>
                      ))}
                      <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center w-12">คะแนน<br/>เฉลี่ย<br/>ร้อยละ</th>
                      <th rowSpan={2} className="border border-gray-300 px-1 py-1 text-center w-10">ลำดับ</th>
                    </tr>
                    <tr className="bg-emerald-50" />
                  </thead>
                  <tbody>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="border border-gray-300 px-2 py-1 text-center italic text-xs">คะแนนเต็ม</td>
                      {subjectResults.map((_, i) => (
                        <td key={i} className="border border-gray-300 px-1 py-1 text-center">100</td>
                      ))}
                      <td className="border border-gray-300 px-1 py-1 text-center font-bold">100</td>
                      <td className="border border-gray-300"></td>
                    </tr>
                    {students.map((student, idx) => {
                      const summary = scoreRanked.find(s => s.student.id === student.id)!;
                      if (!summary) return null;
                      return (
                        <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 whitespace-nowrap">{student.titleTh}{student.firstNameTh}</td>
                          <td className="border border-gray-300 px-1 py-0.5 whitespace-nowrap">{student.lastNameTh}</td>
                          {summary.scores.map((s, si) => (
                            <td key={si} className="border border-gray-300 px-1 py-0.5 text-center">
                              {s > 0 ? Math.round(s) : ''}
                            </td>
                          ))}
                          <td className="border border-gray-300 px-1 py-0.5 text-center font-bold">{summary.scoreAvg.toFixed(2)}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{summary.scoreRank}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={3} className="border border-gray-300 px-2 py-1 text-center">คะแนนเฉลี่ย</td>
                      {subjectScoreAverages.map((a, i) => (
                        <td key={i} className="border border-gray-300 px-1 py-1 text-center font-bold">{a.toFixed(1)}</td>
                      ))}
                      <td className="border border-gray-300 px-1 py-1 text-center font-bold">
                        {subjectScoreAverages.length > 0 ? (subjectScoreAverages.reduce((a, b) => a + b, 0) / subjectScoreAverages.length).toFixed(1) : '0'}
                      </td>
                      <td className="border border-gray-300"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AchievementSummaryReport;
