import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Printer, FileText, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStudents } from '@/utils/studentStorage';
import type { Student } from '@/types/student';

interface CompetencyPageProps {
  competencyNumber: number;
  title: string;
}

interface StudentAssessment {
  studentId: string;
  studentName: string;
  scores: number[]; // 5 scores for each competency item
  totalScore: number;
  grade: string;
}

const competencyItems = {
  1: [
    'มีความสามารถในการรับสาร – ส่งสาร',
    'มีความสามารถในการถ่ายทอดความรู้ ความคิด ความเข้าใจของตนเอง โดยใช้ภาษาอย่างเหมาะสม',
    'ใช้วิธีการสื่อสารที่เหมาะสม มีประสิทธิภาพ',
    'เจรจาต่อรอง เพื่อขจัดและลดปัญหาความขัดแย้งต่าง ๆ ได้',
    'เลือกรับและไม่รับข้อมูลข่าวสารด้วยเหตุผลและถูกต้อง'
  ],
  2: [
    'มีความสามารถในการคิดวิเคราะห์ สังเคราะห์',
    'มีทักษะในการคิดนอกกรอบอย่างสร้างสรรค์',
    'สามารถคิดอย่างมีวิจารณญาณ',
    'มีความสามารถในการคิดอย่างมีระบบ',
    'ตัดสินใจแก้ปัญหาเกี่ยวกับตนเองได้อย่างเหมาะสม'
  ],
  3: [
    'สามารถแก้ปัญหาและอุปสรรคต่าง ๆ ที่เผชิญได้',
    'ใช้เหตุผลในการแก้ปัญหา',
    'เข้าใจความสัมพันธ์และการเปลี่ยนแปลงในสังคม',
    'แสวงหาความรู้ ประยุกต์ความรู้มาใช้ในการป้องกันและแก้ไขปัญหา',
    'สามารถตัดสินใจได้เหมาะสมตามวัย'
  ],
  4: [
    'เรียนรู้ด้วยตนเองได้เหมาะสมตามวัย',
    'สามารถทำงานกลุ่มร่วมกับผู้อื่นได้',
    'นำความรู้ที่ได้ไปใช้ประโยชน์ในชีวิตประจำวัน',
    'จัดการปัญหาและความขัดแย้งได้เหมาะสม',
    'หลีกเลี่ยงพฤติกรรมไม่พึงประสงค์ที่ส่งผลกระทบต่อตนเอง'
  ],
  5: [
    'เลือกและใช้เทคโนโลยีได้เหมาะสมตามวัย',
    'มีทักษะกระบวนการทางเทคโนโลยี',
    'สามารถนำเทคโนโลยีไปใช้พัฒนาตนเอง',
    'ใช้เทคโนโลยีในการแก้ปัญหาอย่างสร้างสรรค์',
    'มีคุณธรรม จริยธรรม ในการใช้เทคโนโลยี'
  ]
};

const getGradeFromScore = (score: number): string => {
  if (score >= 13) return 'ดีเยี่ยม';
  if (score >= 9) return 'ดี';
  if (score >= 5) return 'ผ่าน';
  return 'ไม่ผ่าน';
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'ดีเยี่ยม': return 'bg-green-100 text-green-800 border-green-200';
    case 'ดี': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ผ่าน': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ไม่ผ่าน': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const CompetencyPage: React.FC<CompetencyPageProps> = ({ competencyNumber, title }) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<StudentAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const items = competencyItems[competencyNumber as keyof typeof competencyItems] || [];

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const studentData = await getStudents();
        setStudents(studentData);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถดึงข้อมูลนักเรียนได้',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students by grade
  useEffect(() => {
    if (selectedGrade) {
      const filtered = students.filter(student => student.grade === selectedGrade);
      setFilteredStudents(filtered);
      
      // Initialize assessments for filtered students
      const initialAssessments = filtered.map(student => ({
        studentId: student.studentId,
        studentName: `${student.titleTh || ''}${student.firstNameTh} ${student.lastNameTh}`.trim(),
        scores: [0, 0, 0, 0, 0],
        totalScore: 0,
        grade: 'ไม่ผ่าน'
      }));
      setAssessments(initialAssessments);
    } else {
      setFilteredStudents([]);
      setAssessments([]);
    }
  }, [selectedGrade, students]);

  // Get unique grades from students
  const availableGrades = [...new Set(students.map(student => student.grade))]
    .filter(Boolean)
    .sort((a, b) => {
      const gradeOrder = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
      return gradeOrder.indexOf(a) - gradeOrder.indexOf(b);
    });

  const updateScore = (studentId: string, itemIndex: number, score: number) => {
    setAssessments(prev => prev.map(assessment => {
      if (assessment.studentId === studentId) {
        const newScores = [...assessment.scores];
        newScores[itemIndex] = score;
        const newTotalScore = newScores.reduce((sum, s) => sum + s, 0);
        const newGrade = getGradeFromScore(newTotalScore);
        
        return {
          ...assessment,
          scores: newScores,
          totalScore: newTotalScore,
          grade: newGrade
        };
      }
      return assessment;
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'บันทึกสำเร็จ',
        description: 'ข้อมูลการประเมินได้รับการบันทึกแล้ว',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">ประเมินสมรรถนะนักเรียนในด้านต่างๆ</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </Button>
          <Button 
            onClick={handlePrint}
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์
          </Button>
        </div>
      </div>

      {/* Grade Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            เลือกระดับชั้น
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="เลือกระดับชั้น" />
            </SelectTrigger>
            <SelectContent>
              {availableGrades.map(grade => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Assessment Table */}
      {selectedGrade && (
        <Card>
          <CardHeader>
            <CardTitle>แบบประเมินสมรรถนะด้านที่ {competencyNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-center min-w-[60px]">ลำดับที่</th>
                    <th className="border border-gray-300 p-3 text-center min-w-[200px]">ชื่อ-สกุล</th>
                    <th className="border border-gray-300 p-2 text-center" colSpan={5}>
                      สมรรถนะด้านที่ {competencyNumber}
                    </th>
                    <th className="border border-gray-300 p-3 text-center min-w-[80px]">รวม</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2"></th>
                    <th className="border border-gray-300 p-2"></th>
                    {items.map((item, index) => (
                      <th key={index} className="border border-gray-300 p-2 text-xs text-center min-w-[100px]">
                        {competencyNumber}.{index + 1}
                        <div className="mt-1 text-xs font-normal text-gray-600">
                          {item.length > 30 ? item.substring(0, 30) + '...' : item}
                        </div>
                        <div className="mt-1 text-xs text-blue-600">3</div>
                      </th>
                    ))}
                    <th className="border border-gray-300 p-2 text-center">15</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment, index) => (
                    <tr key={assessment.studentId} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                      <td className="border border-gray-300 p-3">{assessment.studentName}</td>
                      {assessment.scores.map((score, itemIndex) => (
                        <td key={itemIndex} className="border border-gray-300 p-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="3"
                            value={score}
                            onChange={(e) => updateScore(assessment.studentId, itemIndex, parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold">{assessment.totalScore}</span>
                          <Badge className={getGradeColor(assessment.grade)}>
                            {assessment.grade}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grading Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>เกณฑ์การให้คะแนน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">เกณฑ์การให้คะแนนระดับคุณภาพ</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium">ดีเยี่ยม</span> – พฤติกรรมที่ปฏิบัติชัดเจนและสม่ำเสมอ ให้ 3 คะแนน</li>
                <li><span className="font-medium">ดี</span> – พฤติกรรมที่ปฏิบัติชัดเจนและบ่อยครั้ง ให้ 2 คะแนน</li>
                <li><span className="font-medium">ผ่าน</span> – พฤติกรรมที่ปฏิบัติบางครั้ง ให้ 1 คะแนน</li>
                <li><span className="font-medium">ไม่ผ่าน</span> – ไม่เคยปฏิบัติพฤติกรรม ให้ 0 คะแนน</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">เกณฑ์การสรุปผล</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium">ดีเยี่ยม</span> 13 – 15 คะแนน</li>
                <li><span className="font-medium">ดี</span> 9 – 12 คะแนน</li>
                <li><span className="font-medium">ผ่าน</span> 5 – 8 คะแนน</li>
                <li><span className="font-medium">ไม่ผ่าน</span> 0 – 4 คะแนน</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetencyPage;