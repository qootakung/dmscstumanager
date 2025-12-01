import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, X, Edit } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  scores: number[];
  total: number;
  grade: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface CompetencyPrintPreviewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  competencyNumber: number;
  title: string;
  academicYear: string;
  semester: string;
  students: Student[];
  grade: string; // Add grade as prop
}

const CompetencyPrintPreview: React.FC<CompetencyPrintPreviewProps> = ({
  isOpen,
  onOpenChange,
  competencyNumber,
  title,
  academicYear,
  semester,
  students,
  grade
}) => {
  const printRef = React.useRef<HTMLDivElement>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [customTeacherName, setCustomTeacherName] = useState('');
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [directorName, setDirectorName] = useState('');

  // Fetch teachers from database
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data: teachersData, error } = await supabase
          .from('teachers')
          .select('id, firstName, lastName')
          .order('firstName');

        if (error) throw error;
        setTeachers(teachersData || []);
        
        // Set first teacher as default if available
        if (teachersData && teachersData.length > 0) {
          setSelectedTeacherId(teachersData[0].id);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const getSelectedTeacherName = () => {
    if (isEditingTeacher) {
      return customTeacherName;
    }
    
    if (selectedTeacherId) {
      const teacher = teachers.find(t => t.id === selectedTeacherId);
      return teacher ? `${teacher.firstName} ${teacher.lastName}` : '';
    }
    
    return '';
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `แบบประเมินสมรรถนะด้าน_${competencyNumber}_${academicYear}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          font-family: 'TH Sarabun', 'Sarabun', Arial, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.1 !important;
          color: black !important;
        }
        table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        table, th, td {
          border: 1px solid #000 !important;
        }
        th {
          background-color: #f8f9fa !important;
          font-weight: bold !important;
        }
        .vertical-text {
          writing-mode: vertical-rl !important;
          text-orientation: mixed !important;
        }
        .signature-line {
          border-bottom: 1px dotted #000 !important;
          min-width: 200px !important;
          display: inline-block !important;
        }
      }
    `,
  });

  // Competency criteria matching the image
  const competencyCriteria = [
    'มีความสามารถในการรับสาร – ส่งสาร',
    'มีความสามารถในการถ่ายทอดความรู้ ความคิด ความเข้าใจของตนเอง โดยใช้ภาษาอย่างเหมาะสม',
    'ใช้วิธีการสื่อสารที่เหมาะสม มีประสิทธิภาพ',
    'เจรจาต่อรอง เพื่อขจัดและลดปัญหาความขัดแย้งต่าง ๆ ได้',
    'เลือกรับและไม่รับข้อมูลข่าวสารด้วยเหตุผลและถูกต้อง'
  ];

  const competencyTitles = {
    1: 'ความสามารถในการสื่อสาร',
    2: 'ความสามารถในการคิด', 
    3: 'ความสามารถในการแก้ปัญหา',
    4: 'ความสามารถในการใช้ทักษะชีวิต',
    5: 'ความสามารถในการใช้เทคโนโลยี'
  };

  // Function to calculate grade based on total score
  const calculateGrade = (total: number) => {
    if (total >= 13) return 'ดีเยี่ยม';
    if (total >= 11) return 'ดี';
    if (total >= 8) return 'ผ่าน';
    return 'ไม่ผ่าน';
  };

  // Generate student list with actual students + empty rows to fill up to 12
  const displayStudents = [...students];
  const emptyRowsNeeded = Math.max(0, 12 - students.length);
  for (let i = 0; i < emptyRowsNeeded; i++) {
    displayStudents.push({
      id: `empty-${i}`,
      name: '',
      scores: [0, 0, 0, 0, 0],
      total: 0,
      grade: ''
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>ตัวอย่างก่อนพิมพ์</span>
            <div className="flex gap-2 items-center">
              <Button onClick={handlePrint} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Printer className="h-4 w-4 mr-2" />
                พิมพ์
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                ปิด
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Controls for editing */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded">
          <div>
            <label className="text-sm font-medium mb-1 block">ชื่อผู้อำนวยการ:</label>
            <input
              type="text"
              value={directorName}
              onChange={(e) => setDirectorName(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="กรอกชื่อผู้อำนวยการ"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">ชื่อครูประจำชั้น:</label>
            <div className="flex gap-2">
              {!isEditingTeacher ? (
                <>
                  <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="เลือกครู" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingTeacher(true);
                      setCustomTeacherName(getSelectedTeacherName());
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={customTeacherName}
                    onChange={(e) => setCustomTeacherName(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    placeholder="กรอกชื่อครูประจำชั้น"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingTeacher(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div ref={printRef} className="bg-white p-6" style={{ fontFamily: "'TH Sarabun', 'Sarabun', Arial, sans-serif", fontSize: "14px" }}>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-base font-bold mb-1" style={{ lineHeight: "1.2" }}>
              แบบประเมินสมรรถนะสำหรับผู้เรียน ชั้นประถมศึกษาปีที่ {grade}
            </h1>
            <h2 className="text-sm font-semibold mb-1">
              สมรรถนะด้านที่ {competencyNumber} {competencyTitles[competencyNumber]}
            </h2>
            <p className="text-sm">ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}</p>
          </div>

          {/* Assessment Table */}
          <table className="w-full border-collapse border border-black" style={{ fontSize: "12px" }}>
            <thead>
              <tr>
                <th rowSpan={2} className="border border-black p-1 bg-gray-100 text-center" style={{ width: "40px" }}>
                  เลขที่
                </th>
                <th rowSpan={2} className="border border-black p-1 bg-gray-100 text-center" style={{ width: "180px" }}>
                  ชื่อ-สกุล
                </th>
                <th colSpan={5} className="border border-black p-1 bg-gray-100 text-center" style={{ fontSize: "12px" }}>
                  สมรรถนะด้านที่ {competencyNumber}
                </th>
                <th rowSpan={2} className="border border-black p-1 bg-gray-100 text-center" style={{ width: "40px" }}>
                  รวม
                </th>
                <th rowSpan={2} className="border border-black p-1 bg-gray-100 text-center" style={{ width: "60px" }}>
                  สรุปผล
                </th>
              </tr>
              <tr>
                {competencyCriteria.map((criteria, index) => (
                  <th 
                    key={index} 
                    className="border border-black p-1 bg-gray-100 text-center vertical-text"
                    style={{ 
                      width: "35px",
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      fontSize: "9px",
                      lineHeight: "1.1",
                      height: "120px"
                    }}
                  >
                    <div style={{ transform: "rotate(0deg)" }}>
                      {criteria}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayStudents.map((student, index) => (
                <tr key={student.id || `row-${index}`} style={{ height: "25px" }}>
                  <td className="border border-black text-center" style={{ padding: "2px", fontSize: "11px" }}>
                    {index + 1}
                  </td>
                  <td className="border border-black" style={{ padding: "2px 4px", fontSize: "11px" }}>
                    {student.name || ""}
                  </td>
                  <td className="border border-black text-center" style={{ padding: "2px", fontSize: "11px" }}>
                    {student.scores?.[0] || ""}
                  </td>
                  <td className="border border-black text-center" style={{ padding: "2px", fontSize: "11px" }}>
                    {student.scores?.[1] || ""}
                  </td>
                  <td className="border border-black text-center" style={{ padding: "2px", fontSize: "11px" }}>
                    {student.scores?.[2] || ""}
                  </td>
                  <td className="border border-black text-center" style={{ padding: "2px", fontSize: "11px" }}>
                    {student.scores?.[3] || ""}
                  </td>
                  <td className="border border-black text-center" style={{ padding: "2px", fontSize: "11px" }}>
                    {student.scores?.[4] || ""}
                  </td>
                  <td className="border border-black text-center font-semibold" style={{ padding: "2px", fontSize: "11px" }}>
                    {student.total || ""}
                  </td>
                  <td className="border border-black text-center" style={{ padding: "2px", fontSize: "11px" }}>
                    {student.grade || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature Section */}
          <div className="mt-8 flex justify-between items-start" style={{ fontSize: "12px" }}>
            <div className="text-center">
              <p className="mb-6">รับรองข้อมูลถูกต้อง</p>
              <div className="mb-2">
                <span className="signature-line" style={{ 
                  borderBottom: "1px dotted #000",
                  minWidth: "200px",
                  display: "inline-block",
                  paddingBottom: "2px"
                }}>
                  {directorName ? ` ${directorName} ` : " ................................. "}
                </span>
              </div>
              <p>ผู้อำนวยการโรงเรียนบ้านดอนมูล</p>
            </div>
            <div className="text-center">
              <p className="mb-6">ตรวจสอบข้อมูลถูกต้อง</p>
              <div className="mb-2">
                <span className="signature-line" style={{ 
                  borderBottom: "1px dotted #000",
                  minWidth: "200px",
                  display: "inline-block",
                  paddingBottom: "2px"
                }}>
                  {getSelectedTeacherName() ? ` ${getSelectedTeacherName()} ` : " ................................. "}
                </span>
              </div>
              <p>ครูประจำชั้น</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetencyPrintPreview;