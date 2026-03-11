
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Calculator, 
  FlaskConical, 
  Users, 
  History, 
  Heart, 
  Palette, 
  Briefcase,
  Globe,
  Shield,
  PlusCircle,
  FileText,
  ClipboardList,
  BarChart3,
  Printer,
  Settings,
  GraduationCap,
  Target,
  CheckSquare,
  Edit3,
  BookMarked,
  FileSpreadsheet,
  ArrowLeft
} from 'lucide-react';
import { generateAcademicYears, gradeOptions } from '@/utils/data';
import BasicInfoEntry from './pp5/BasicInfoEntry';
import PP5StudentInfo from './pp5/PP5StudentInfo';
import PP5Attendance from './pp5/PP5Attendance';
import PP5AttendanceHoursSummary from './pp5/PP5AttendanceHoursSummary';
import CurriculumIndicators from './pp5/CurriculumIndicators';
import ScoreRatioConfig from './pp5/ScoreRatioConfig';
import IndicatorScoreEntry from './pp5/IndicatorScoreEntry';
import StandardReport from './pp5/StandardReport';
import AchievementSummaryReport from './pp5/AchievementSummaryReport';
import AchievementChartReport from './pp5/AchievementChartReport';
import AchievementAnalysisReport from './pp5/AchievementAnalysisReport';

// Types for PP5 system
interface PP5MenuCategory {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  items: PP5MenuItem[];
}

interface PP5MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action?: () => void;
}

const PP5Management: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>('ป.1');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2568');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const academicYears = generateAcademicYears();
  const primaryGrades = gradeOptions.filter(g => g.startsWith('ป.'));

  // Define menu categories with colorful styling based on reference images
  const menuCategories: PP5MenuCategory[] = [
    {
      id: 'score-entry',
      title: 'กรอกคะแนนตามตัวชี้วัด',
      color: 'text-orange-700',
      bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200',
      borderColor: 'border-orange-300',
      items: [
        { id: 'thai', label: 'ภาษาไทย', icon: BookOpen },
        { id: 'math', label: 'คณิตศาสตร์', icon: Calculator },
        { id: 'science', label: 'วิทยาศาสตร์ฯ', icon: FlaskConical },
        { id: 'social', label: 'สังคมศึกษาฯ', icon: Users },
        { id: 'history', label: 'ประวัติศาสตร์', icon: History },
        { id: 'health', label: 'สุขศึกษาฯ', icon: Heart },
        { id: 'art', label: 'ศิลปะ', icon: Palette },
        { id: 'career', label: 'การงานอาชีพ', icon: Briefcase },
        { id: 'english', label: 'ภาษาต่างประเทศ', icon: Globe },
        { id: 'anti-corruption', label: 'ป้องกันการทุจริต', icon: Shield },
        { id: 'elective1', label: 'วิชาเพิ่มเติม 1', icon: PlusCircle },
        { id: 'elective2', label: 'วิชาเพิ่มเติม 2', icon: PlusCircle },
        { id: 'elective3', label: 'วิชาเพิ่มเติม 3', icon: PlusCircle },
      ]
    },
    {
      id: 'learning-reports',
      title: 'รายงานผลการเรียนรู้ตามมาตรฐาน',
      color: 'text-cyan-700',
      bgColor: 'bg-gradient-to-br from-cyan-100 to-cyan-200',
      borderColor: 'border-cyan-300',
      items: [
        { id: 'report-thai', label: 'ภาษาไทย', icon: BookOpen },
        { id: 'report-math', label: 'คณิตศาสตร์', icon: Calculator },
        { id: 'report-science', label: 'วิทยาศาสตร์ฯ', icon: FlaskConical },
        { id: 'report-social', label: 'สังคมศึกษาฯ', icon: Users },
        { id: 'report-history', label: 'ประวัติศาสตร์', icon: History },
        { id: 'report-health', label: 'สุขศึกษาฯ', icon: Heart },
        { id: 'report-art', label: 'ศิลปะ', icon: Palette },
        { id: 'report-career', label: 'การงานอาชีพ', icon: Briefcase },
        { id: 'report-english', label: 'ภาษาต่างประเทศ', icon: Globe },
        { id: 'summary-result', label: 'แบบสรุปผลสัมฤทธิ์ฯ', icon: BarChart3 },
        { id: 'achievement-map', label: 'แผนภูมิผลสัมฤทธิ์ฯ', icon: FileSpreadsheet },
        { id: 'analysis-result', label: 'วิเคราะห์ผลสัมฤทธิ์ฯ', icon: ClipboardList },
        { id: 'pp5-cover', label: 'หน้าปก ปพ.5', icon: FileText },
        { id: 'pp5-print', label: 'การสั่งพิมพ์ ปพ.5', icon: Printer },
      ]
    },
    {
      id: 'curriculum-indicators',
      title: 'ตัวชี้วัดตามหลักสูตร \'60',
      color: 'text-pink-700',
      bgColor: 'bg-gradient-to-br from-pink-100 to-pink-200',
      borderColor: 'border-pink-300',
      items: [
        { id: 'indicator-p1', label: 'ตัวชี้วัดชั้น ป.1', icon: Target },
        { id: 'indicator-p2', label: 'ตัวชี้วัดชั้น ป.2', icon: Target },
        { id: 'indicator-p3', label: 'ตัวชี้วัดชั้น ป.3', icon: Target },
        { id: 'indicator-p4', label: 'ตัวชี้วัดชั้น ป.4', icon: Target },
        { id: 'indicator-p5', label: 'ตัวชี้วัดชั้น ป.5', icon: Target },
        { id: 'indicator-p6', label: 'ตัวชี้วัดชั้น ป.6', icon: Target },
      ]
    },
    {
      id: 'basic-info',
      title: 'ข้อมูลพื้นฐาน',
      color: 'text-blue-700',
      bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
      borderColor: 'border-blue-300',
      items: [
        { id: 'basic-data', label: 'กรอกข้อมูลพื้นฐาน', icon: Edit3 },
        { id: 'student-info', label: 'ข้อมูลนักเรียน', icon: Users },
        { id: 'study-time', label: 'เช็คเวลาเรียน (วัน)', icon: CheckSquare },
        { id: 'study-time-hour', label: 'แบบนับเวลาเรียน(ชั่วโมง)', icon: ClipboardList },
        { id: 'indicator-table', label: 'ตารางจำนวนตัวชี้วัด(Print)', icon: FileSpreadsheet },
        { id: 'score-ratio', label: 'กำหนดสัดส่วนคะแนน', icon: Settings },
        { id: 'student-list', label: 'ใบรายชื่อนักเรียน', icon: FileText },
      ]
    },
    {
      id: 'assessment',
      title: 'การประเมินคุณลักษณะ',
      color: 'text-purple-700',
      bgColor: 'bg-gradient-to-br from-purple-100 to-purple-200',
      borderColor: 'border-purple-300',
      items: [
        { id: 'desirable-traits', label: 'การประเมินคุณลักษณะอันพึงประสงค์', icon: GraduationCap },
        { id: 'reading-analysis', label: 'การประเมินการอ่าน คิดวิเคราะห์ และเขียน', icon: BookMarked },
        { id: 'student-activity', label: 'กิจกรรมพัฒนาผู้เรียน', icon: Users },
        { id: 'grade-decision', label: 'การตัดสินผลการเรียน', icon: CheckSquare },
        { id: 'fix-grades', label: 'การแก้ "0", "ร", "มส"', icon: Edit3 },
      ]
    },
    {
      id: 'extra-activities',
      title: 'กิจกรรมเสริม',
      color: 'text-teal-700',
      bgColor: 'bg-gradient-to-br from-teal-100 to-teal-200',
      borderColor: 'border-teal-300',
      items: [
        { id: 'guidance', label: 'แนะแนว', icon: Target },
        { id: 'scout', label: 'ลูกเสือ เนตรนารีฯ', icon: Shield },
        { id: 'club', label: 'ชุมนุม ชมรม', icon: Users },
        { id: 'social-primary', label: 'เพื่อสังคมฯ (ประถม)', icon: Heart },
        { id: 'activity-summary', label: 'สรุปกิจกรรมพัฒนาผู้เรียน', icon: BarChart3 },
      ]
    }
  ];

  const handleMenuClick = (categoryId: string, itemId: string) => {
    setActiveSection(`${categoryId}-${itemId}`);
    console.log(`Selected: ${categoryId} -> ${itemId}`);
  };

  const handleBack = () => {
    setActiveSection(null);
  };

  // Show BasicInfoEntry when selected
  if (activeSection === 'basic-info-basic-data') {
    return (
      <BasicInfoEntry
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }

  // Show PP5StudentInfo when selected
  if (activeSection === 'basic-info-student-info') {
    return (
      <PP5StudentInfo
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }

  // Show PP5AttendanceHoursSummary when selected
  if (activeSection === 'basic-info-study-time-hour') {
    return (
      <PP5AttendanceHoursSummary
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }


  if (activeSection === 'basic-info-study-time') {
    return (
      <PP5Attendance
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }
  // Show Score Ratio Config when selected
  if (activeSection === 'basic-info-score-ratio') {
    return (
      <ScoreRatioConfig
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }

  // Show Indicator Score Entry when a score-entry subject is selected
  const scoreEntryMatch = activeSection?.match(/^score-entry-(.+)$/);
  if (scoreEntryMatch) {
    const subjectKey = scoreEntryMatch[1];
    return (
      <IndicatorScoreEntry
        subjectMenuId={subjectKey}
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }

  // Show Achievement Summary Report
  if (activeSection === 'learning-reports-summary-result') {
    return (
      <AchievementSummaryReport
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }

  // Show Achievement Chart Report
  if (activeSection === 'learning-reports-achievement-map') {
    return (
      <AchievementChartReport
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }

  const reportMatch = activeSection?.match(/^learning-reports-report-(.+)$/);
  if (reportMatch) {
    const subjectKey = reportMatch[1];
    return (
      <StandardReport
        subjectMenuId={subjectKey}
        selectedGrade={selectedGrade}
        selectedSemester={selectedSemester}
        selectedAcademicYear={selectedAcademicYear}
        onBack={handleBack}
      />
    );
  }

  // Show Curriculum Indicators when selected
  const indicatorMatch = activeSection?.match(/^curriculum-indicators-indicator-p(\d)$/);
  if (indicatorMatch) {
    const grade = `ป.${indicatorMatch[1]}`;
    return (
      <CurriculumIndicators
        gradeLevel={grade}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <GraduationCap className="w-8 h-8" />
                ระบบ ปพ.5 โปรแกรมวิเคราะห์และรายงานผลการเรียน
              </CardTitle>
              <p className="text-emerald-100 mt-1">
                ตามหลักสูตรแกนกลาง พ.ศ. 2551 ปรับปรุง พ.ศ. 2560 | โรงเรียนบ้านดอนมูล
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium whitespace-nowrap">ปีการศึกษา:</label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger className="w-28 bg-white/90 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white font-medium whitespace-nowrap">ภาคเรียน:</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-20 bg-white/90 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white font-medium whitespace-nowrap">ระดับชั้น:</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-24 bg-white/90 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {primaryGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuCategories.map((category) => (
          <Card 
            key={category.id} 
            className={`${category.bgColor} ${category.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg font-bold ${category.color} flex items-center gap-2`}>
                <div className={`w-2 h-6 rounded-full bg-current`}></div>
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    onClick={() => handleMenuClick(category.id, item.id)}
                    className={`
                      h-auto py-3 px-3 
                      bg-white/80 hover:bg-white 
                      border-2 ${category.borderColor}
                      ${category.color}
                      hover:scale-[1.02] transition-all duration-200
                      flex flex-col items-center justify-center gap-1
                      text-xs font-medium
                      shadow-sm hover:shadow-md
                      ${activeSection === `${category.id}-${item.id}` ? 'ring-2 ring-offset-1 ring-current bg-white' : ''}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-center leading-tight">{item.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <Card className="bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200">
        <CardContent className="py-4">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                ระบบ ปพ.5 สำหรับนักเรียนประถมศึกษา ป.1-6
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                ปีการศึกษา {selectedAcademicYear} ภาคเรียนที่ {selectedSemester}
              </span>
            </div>
            <div className="text-gray-500">
              <span className="font-medium">หมายเลขเลือก:</span> {activeSection || 'ยังไม่ได้เลือกเมนู'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PP5Management;
