
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import { allSubjectGroups } from '@/data/curriculumIndicators';
import { getStudents } from '@/utils/studentStorage';
import { Student } from '@/types/student';
import { generateEmptyRowsHtml } from '@/utils/pp5PrintUtils';

interface StandardReportProps {
  subjectMenuId: string;
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

interface StandardColumnGroup {
  strandName: string;
  strandIndex: number;
  standardCode: string;
  standardWeight: number;
  indicators: { id: string; index: number }[];
}

interface ScoreData {
  maxScorePerIndicator: number;
  studentScores: {
    [studentId: string]: {
      indicators: { [indicatorId: string]: number };
      endYearScore: number;
    };
  };
}

const SUBJECT_CONFIG: Record<string, { groupId: string; strandFilter?: (s: string) => boolean; displayName: string }> = {
  'thai': { groupId: 'thai', displayName: 'กลุ่มสาระการเรียนรู้ภาษาไทย' },
  'math': { groupId: 'math', displayName: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์' },
  'science': { groupId: 'science', displayName: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี' },
  'social': { groupId: 'social', strandFilter: (s) => !s.includes('ประวัติศาสตร์'), displayName: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนาและวัฒนธรรม' },
  'history': { groupId: 'social', strandFilter: (s) => s.includes('ประวัติศาสตร์'), displayName: 'ประวัติศาสตร์' },
  'health': { groupId: 'health', displayName: 'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา' },
  'art': { groupId: 'arts', displayName: 'กลุ่มสาระการเรียนรู้ศิลปะ' },
  'career': { groupId: 'career', displayName: 'กลุ่มสาระการเรียนรู้การงานอาชีพ' },
  'english': { groupId: 'english', displayName: 'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ (ภาษาอังกฤษ)' },
};

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

const getGradeLabel = (grade: number): string => {
  if (grade >= 3.5) return 'ดีเยี่ยม';
  if (grade >= 3) return 'ดีมาก';
  if (grade >= 2.5) return 'ดี';
  if (grade >= 2) return 'ผ่าน';
  if (grade >= 1.5) return 'พอใช้';
  if (grade >= 1) return 'ผ่านขั้นต่ำ';
  return 'ไม่ผ่าน';
};

const StandardReport: React.FC<StandardReportProps> = ({
  subjectMenuId,
  selectedGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData>({ maxScorePerIndicator: 10, studentScores: {} });
  const [loading, setLoading] = useState(true);

  const config = SUBJECT_CONFIG[subjectMenuId];
  const gradeKey = selectedGrade;
  const gradeNum = gradeKey.replace('ป.', '');

  // Build column structure
  const columnGroups = useMemo((): StandardColumnGroup[] => {
    if (!config) return [];
    const group = allSubjectGroups.find(g => g.id === config.groupId);
    if (!group) return [];
    const groups: StandardColumnGroup[] = [];
    let strandIdx = 0;
    group.subjects.forEach(subject => {
      if (config.strandFilter && !config.strandFilter(subject.strand)) return;
      strandIdx++;
      subject.standards.forEach(standard => {
        const indicators = standard.indicators[gradeKey];
        if (!indicators || indicators.length === 0) return;
        groups.push({
          strandName: subject.strand,
          strandIndex: strandIdx,
          standardCode: standard.code,
          standardWeight: 0,
          indicators: indicators.map((ind, i) => ({ id: ind.id, index: i + 1 })),
        });
      });
    });
    return groups;
  }, [config, gradeKey]);

  // Load weights
  const columnGroupsWithWeights = useMemo(() => {
    const ratioKey = getRatioStorageKey(gradeKey, selectedAcademicYear, selectedSemester);
    const savedRatios = localStorage.getItem(ratioKey);
    let ratioMap: { [stdCode: string]: number } = {};
    let endYearWeight = 0;
    if (savedRatios) {
      try {
        const ratios = JSON.parse(savedRatios);
        const matchingGroup = ratios.find((r: any) => r.groupId === config?.groupId);
        if (matchingGroup) {
          endYearWeight = matchingGroup.endYearScore || 0;
          matchingGroup.strands.forEach((strand: any) => {
            if (config?.strandFilter && !config.strandFilter(strand.strandName)) return;
            strand.standards.forEach((std: any) => {
              ratioMap[std.standardCode] = std.score;
            });
          });
        }
      } catch (e) { console.error(e); }
    }
    const midYearWeight = Object.values(ratioMap).reduce((sum, v) => sum + v, 0);
    return {
      groups: columnGroups.map(g => ({ ...g, standardWeight: ratioMap[g.standardCode] || 0 })),
      midYearWeight,
      endYearWeight,
    };
  }, [columnGroups, gradeKey, selectedAcademicYear, selectedSemester, config]);

  // Group standards by strand for report display
  const strandSummaries = useMemo(() => {
    const map = new Map<string, { strandName: string; strandIndex: number; standards: StandardColumnGroup[] }>();
    columnGroupsWithWeights.groups.forEach(g => {
      const existing = map.get(g.strandName);
      if (existing) {
        existing.standards.push(g);
      } else {
        map.set(g.strandName, { strandName: g.strandName, strandIndex: g.strandIndex, standards: [g] });
      }
    });
    return Array.from(map.values());
  }, [columnGroupsWithWeights.groups]);

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

  useEffect(() => {
    const key = getScoreStorageKey(subjectMenuId, gradeKey, selectedAcademicYear, selectedSemester);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setScoreData(JSON.parse(saved)); } catch { setScoreData({ maxScorePerIndicator: 10, studentScores: {} }); }
    } else {
      setScoreData({ maxScorePerIndicator: 10, studentScores: {} });
    }
  }, [subjectMenuId, gradeKey, selectedAcademicYear, selectedSemester]);

  const getScore = (studentId: string, indicatorId: string): number =>
    scoreData.studentScores[studentId]?.indicators?.[indicatorId] ?? 0;

  const getEndYearScore = (studentId: string): number =>
    scoreData.studentScores[studentId]?.endYearScore ?? 0;

  const calcStandardSummary = (studentId: string, group: StandardColumnGroup): number => {
    if (group.standardWeight === 0) return 0;
    const totalMax = group.indicators.length * scoreData.maxScorePerIndicator;
    if (totalMax === 0) return 0;
    const totalScore = group.indicators.reduce((sum, ind) => sum + getScore(studentId, ind.id), 0);
    return parseFloat(((totalScore / totalMax) * group.standardWeight).toFixed(1));
  };

  const calcStrandTotal = (studentId: string, standards: StandardColumnGroup[]): number =>
    standards.reduce((sum, g) => sum + calcStandardSummary(studentId, g), 0);

  const calcMidYearTotal = (studentId: string): number =>
    columnGroupsWithWeights.groups.reduce((sum, g) => sum + calcStandardSummary(studentId, g), 0);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=900,width=700');
    if (!printWindow) return;

    const { midYearWeight, endYearWeight } = columnGroupsWithWeights;
    const grandTotalWeight = midYearWeight + endYearWeight;
    const displayName = config?.displayName || '';
    const title = `รายงานผลการประเมินนักเรียนตามมาตรฐานการเรียนรู้  ${displayName}`;
    const subtitle = `โรงเรียนบ้านดอนมูล  ชั้นประถมศึกษาปีที่ ${gradeNum}  ปีการศึกษา ${selectedAcademicYear}`;

    // Page 1: Score details by strand
    const strandHeaders = strandSummaries.map(s => {
      const strandWeight = s.standards.reduce((sum, st) => sum + st.standardWeight, 0);
      const stdCodes = s.standards.map(st => `ท ${st.standardCode}`).join('<br/>');
      return { name: s.strandName, strandIndex: s.strandIndex, weight: strandWeight, stdCodes, standards: s.standards };
    });

    // Build per-standard columns grouped by strand for header spanning
    const allStandards = columnGroupsWithWeights.groups;

    let page1Html = `
      <div class="page">
        <div class="title-box">${title}</div>
        <div class="subtitle">${subtitle}</div>
        <table>
          <thead>
            <tr>
              <th rowspan="3" style="width:25px">ที่</th>
              <th rowspan="3" style="min-width:100px">ชื่อ-นามสกุล</th>
              ${strandHeaders.map(s => `<th colspan="${s.standards.length}">สาระที่ ${s.strandIndex}</th>`).join('')}
              <th rowspan="2">ระหว่าง<br/>ปี</th>
              <th rowspan="2">สอบ<br/>ปลายปี</th>
            </tr>
            <tr>
              ${allStandards.map(st => `<th style="font-size:9pt">${st.standardCode}</th>`).join('')}
            </tr>
            <tr>
              ${allStandards.map(st => `<th>${st.standardWeight.toFixed(1)}</th>`).join('')}
              <th>${midYearWeight}</th>
              <th>${endYearWeight}</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              const midYear = parseFloat(calcMidYearTotal(student.id).toFixed(1));
              const endYear = getEndYearScore(student.id);
              return `
                <tr class="${idx % 2 === 0 ? 'even' : ''}">
                  <td class="text-center">${idx + 1}</td>
                  <td class="name-cell">${student.titleTh || ''}${student.firstNameTh || ''} ${student.lastNameTh || ''}</td>
                  ${allStandards.map(st => {
                    const score = parseFloat(calcStandardSummary(student.id, st).toFixed(1));
                    return `<td class="text-center">${score.toFixed(1)}</td>`;
                  }).join('')}
                  <td class="text-center font-bold">${midYear.toFixed(1)}</td>
                  <td class="text-center">${endYear}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Page 2: Summary with total, grade level, criteria
    let page2Html = `
      <div class="page">
        <div class="title-box">${title}</div>
        <div class="subtitle">${subtitle}</div>
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width:25px">ที่</th>
              <th rowspan="2" colspan="2" style="min-width:150px">ชื่อ-นามสกุล</th>
              <th>รวม</th>
              <th>ระดับ</th>
              <th>เกณฑ์</th>
            </tr>
            <tr>
              <th>${grandTotalWeight}</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              const midYear = parseFloat(calcMidYearTotal(student.id).toFixed(1));
              const endYear = getEndYearScore(student.id);
              const total = parseFloat((midYear + endYear).toFixed(1));
              const gradeLevel = grandTotalWeight > 0 ? calculateGradeLevel((total / grandTotalWeight) * 100) : 0;
              const label = getGradeLabel(gradeLevel);
              return `
                <tr class="${idx % 2 === 0 ? 'even' : ''}">
                  <td class="text-center">${idx + 1}</td>
                  <td class="name-cell" colspan="2">${student.titleTh || ''}${student.firstNameTh || ''} ${student.lastNameTh || ''}</td>
                  <td class="text-center font-bold">${total.toFixed(0)}</td>
                  <td class="text-center font-bold">${gradeLevel}</td>
                  <td class="text-center">${label}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif; font-size: 14pt; }
            @page { size: A4 portrait; margin: 10mm; }
            .page { page-break-after: always; padding: 5mm 0; }
            .page:last-child { page-break-after: auto; }
            .title-box { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 2px;
              border: 2px solid #333; padding: 4px 12px; display: inline-block; width: 100%; }
            .subtitle { font-size: 14pt; text-align: center; margin-bottom: 8px; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 3px 5px; font-size: 12pt; }
            th { background: #e8e8e8; text-align: center; font-weight: bold; font-size: 11pt; }
            td.text-center { text-align: center; }
            td.name-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; font-size: 12pt; }
            tr.even { background: #f5f5f5; }
            .font-bold { font-weight: bold; }
            @media print { body { padding: 0; } .page { padding: 0; } }
          </style>
        </head>
        <body>${page1Html}${page2Html}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 500);
  };

  if (!config) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> กลับ</Button>
        <Card><CardContent className="py-8 text-center text-muted-foreground">ยังไม่รองรับรายวิชานี้</CardContent></Card>
      </div>
    );
  }

  const { midYearWeight, endYearWeight } = columnGroupsWithWeights;
  const grandTotalWeight = midYearWeight + endYearWeight;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
          </Button>
          <div>
            <h2 className="text-lg font-bold text-primary">
              รายงานผลการประเมินตามมาตรฐาน - {config.displayName}
            </h2>
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
          {/* Page 1 Preview: Score by Strand */}
          <Card className="border-2 shadow-md">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-t-lg">
              <CardTitle className="text-base">หน้าที่ 1: คะแนนตามสาระ/มาตรฐาน</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-cyan-100">
                      <th rowSpan={3} className="border border-gray-300 px-2 py-1 text-center w-8">ที่</th>
                      <th rowSpan={3} className="border border-gray-300 px-2 py-1 text-left min-w-[120px]">ชื่อ-นามสกุล</th>
                      {strandSummaries.map((s, i) => (
                        <th key={i} colSpan={s.standards.length} className="border border-gray-300 px-2 py-1 text-center bg-blue-100 text-blue-800">
                          สาระที่ {s.strandIndex}
                        </th>
                      ))}
                      <th rowSpan={3} className="border border-gray-300 px-2 py-1 text-center bg-green-100 text-green-800 w-14">ระหว่าง<br/>ปี</th>
                      <th rowSpan={3} className="border border-gray-300 px-2 py-1 text-center bg-orange-100 text-orange-800 w-14">สอบ<br/>ปลายปี</th>
                    </tr>
                    <tr className="bg-cyan-50">
                      {columnGroupsWithWeights.groups.map((st, i) => (
                        <th key={i} className="border border-gray-300 px-1 py-1 text-center text-[10px]">
                          {st.standardCode}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-gray-100">
                      {columnGroupsWithWeights.groups.map((st, i) => (
                        <th key={i} className="border border-gray-300 px-1 py-1 text-center text-[10px]">{st.standardWeight.toFixed(1)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => {
                      const midYear = parseFloat(calcMidYearTotal(student.id).toFixed(1));
                      const endYear = getEndYearScore(student.id);
                      return (
                        <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 whitespace-nowrap">
                            {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                          </td>
                          {columnGroupsWithWeights.groups.map((st, i) => {
                            const score = parseFloat(calcStandardSummary(student.id, st).toFixed(1));
                            return (
                              <td key={i} className="border border-gray-300 px-1 py-0.5 text-center">
                                {score.toFixed(1)}
                              </td>
                            );
                          })}
                          <td className="border border-gray-300 px-1 py-0.5 text-center font-semibold bg-green-50">{midYear.toFixed(1)}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center bg-orange-50">{endYear}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Page 2 Preview: Summary */}
          <Card className="border-2 shadow-md">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-t-lg">
              <CardTitle className="text-base">หน้าที่ 2: สรุปผลรวม ระดับ และเกณฑ์</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-center w-8">ที่</th>
                      <th rowSpan={2} className="border border-gray-300 px-2 py-1 text-left min-w-[150px]" colSpan={2}>ชื่อ-นามสกุล</th>
                      <th className="border border-gray-300 px-2 py-1 text-center w-16">รวม</th>
                      <th className="border border-gray-300 px-2 py-1 text-center w-16">ระดับ</th>
                      <th className="border border-gray-300 px-2 py-1 text-center w-20">เกณฑ์</th>
                    </tr>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-1 py-1 text-center">{grandTotalWeight}</th>
                      <th className="border border-gray-300 px-1 py-1 text-center"></th>
                      <th className="border border-gray-300 px-1 py-1 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => {
                      const midYear = parseFloat(calcMidYearTotal(student.id).toFixed(1));
                      const endYear = getEndYearScore(student.id);
                      const total = parseFloat((midYear + endYear).toFixed(1));
                      const gradeLevel = grandTotalWeight > 0 ? calculateGradeLevel((total / grandTotalWeight) * 100) : 0;
                      const label = getGradeLabel(gradeLevel);
                      return (
                        <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-1 py-0.5 whitespace-nowrap" colSpan={2}>
                            {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                          </td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center font-bold">{total.toFixed(0)}</td>
                          <td className={`border border-gray-300 px-1 py-0.5 text-center font-bold ${
                            gradeLevel >= 3 ? 'text-green-700' : gradeLevel >= 2 ? 'text-yellow-700' : gradeLevel >= 1 ? 'text-orange-700' : 'text-red-700'
                          }`}>{gradeLevel}</td>
                          <td className="border border-gray-300 px-1 py-0.5 text-center">{label}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {midYearWeight === 0 && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="py-3 text-center text-amber-700 text-sm">
                ⚠️ ยังไม่ได้กำหนดสัดส่วนคะแนน กรุณาไปที่ "ข้อมูลพื้นฐาน → กำหนดสัดส่วนคะแนน" ก่อน
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default StandardReport;
