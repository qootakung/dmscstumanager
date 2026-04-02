import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Users } from 'lucide-react';
import { getStudents } from '@/utils/studentStorage';
import type { Student } from '@/types/student';
import { calculateAge, formatBirthDate } from '@/utils/studentReportUtils';
import { createRoot } from 'react-dom/client';
import { getEmptyRowData } from '@/utils/pp5PrintUtils';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Primary grade options (ป.1-6)
const primaryGrades = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

interface PP5StudentInfoProps {
  selectedGrade: string;
  selectedSemester: string;
  selectedAcademicYear: string;
  onBack: () => void;
}

const PP5StudentInfo: React.FC<PP5StudentInfoProps> = ({
  selectedGrade: initialGrade,
  selectedSemester,
  selectedAcademicYear,
  onBack
}) => {
  const [currentGrade, setCurrentGrade] = useState(initialGrade);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      const allStudents = await getStudents();
      // Filter by current grade and academic year
      const filtered = allStudents.filter(s => 
        s.grade === currentGrade && 
        s.academicYear === selectedAcademicYear
      );
      // Deduplicate by studentId (students may exist in both semesters)
      const seen = new Set<string>();
      const unique = filtered.filter(s => {
        const key = s.studentId || s.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      // Sort by studentId
      unique.sort((a, b) => {
        const aId = a.studentId || '';
        const bId = b.studentId || '';
        const aIs3Digit = aId.length === 3;
        const bIs3Digit = bId.length === 3;
        if (aIs3Digit && !bIs3Digit) return -1;
        if (!aIs3Digit && bIs3Digit) return 1;
        return parseInt(aId) - parseInt(bId);
      });
      setStudents(unique);
      setLoading(false);
    };
    loadStudents();
  }, [currentGrade, selectedAcademicYear]);
 
   const maleCount = students.filter(s => s.gender === 'ชาย' || s.gender === 'ช').length;
   const femaleCount = students.filter(s => s.gender === 'หญิง' || s.gender === 'ญ').length;
 
   const handlePrint = () => {
     const printWindow = window.open('', '', 'height=800,width=1000');
     if (!printWindow) {
       toast({
         title: "เกิดข้อผิดพลาด",
         description: "กรุณาอนุญาต pop-ups เพื่อพิมพ์รายงาน",
         variant: "destructive",
       });
       return;
     }
 
     document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
       printWindow.document.head.appendChild(style.cloneNode(true));
     });
 
      printWindow.document.title = `รายชื่อนักเรียน ${currentGrade}`;
      const printRootEl = printWindow.document.createElement('div');
      printWindow.document.body.appendChild(printRootEl);
      
      const root = createRoot(printRootEl);
      root.render(
        <PP5StudentPrintable 
          students={students} 
          grade={currentGrade}
          semester={selectedSemester}
          academicYear={selectedAcademicYear}
          maleCount={maleCount}
          femaleCount={femaleCount}
        />
      );
 
     setTimeout(() => {
       printWindow.focus();
       printWindow.print();
       printWindow.close();
     }, 1000);
   };
 
    return (
      <div className="space-y-4">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-primary to-primary/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
              <CardTitle className="text-xl font-bold text-primary-foreground flex items-center gap-2">
                <Users className="w-6 h-6" />
                ข้อมูลนักเรียน - ปพ.5
              </CardTitle>
              <div className="text-primary-foreground text-sm">
                ปีการศึกษา {selectedAcademicYear}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Grade Selection */}
        <Card className="shadow-md">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Label className="text-primary font-medium whitespace-nowrap">เลือกระดับชั้น:</Label>
              <Select value={currentGrade} onValueChange={setCurrentGrade}>
                <SelectTrigger className="w-48 bg-accent/50 border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {primaryGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      ประถมศึกษาปีที่ {grade.replace('ป.', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Student Table Card */}
        <Card className="shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-primary">
                รายชื่อนักเรียนระดับชั้น {currentGrade}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                จำนวนเพศชาย {maleCount} คน | เพศหญิง {femaleCount} คน | รวม {students.length} คน
              </p>
            </div>
            <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
              <Printer className="w-4 h-4 mr-2" />
              พิมพ์
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                ไม่พบข้อมูลนักเรียนในระดับชั้น {currentGrade} ปีการศึกษา {selectedAcademicYear}
             </div>
           ) : (
             <div className="overflow-auto">
               <table className="w-full border-collapse text-sm font-sarabun">
                 <thead>
                   <tr className="bg-gray-100">
                     <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-16">ลำดับที่</th>
                     <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-20">รหัสนักเรียน</th>
                     <th className="border border-gray-300 px-3 py-2 text-left font-semibold">ชื่อ - นามสกุล</th>
                     <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-12">เพศ</th>
                     <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-36">เลขบัตรประจำตัวประชาชน</th>
                     <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-40">อายุ</th>
                     <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-28">วันเดือนปีเกิด</th>
                   </tr>
                 </thead>
                 <tbody>
                   {students.map((student, index) => (
                     <tr key={student.id} className="hover:bg-gray-50">
                       <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                       <td className="border border-gray-300 px-3 py-2 text-center">{student.studentId}</td>
                       <td className="border border-gray-300 px-3 py-2">
                         {student.titleTh}{student.firstNameTh} {student.lastNameTh}
                       </td>
                       <td className="border border-gray-300 px-3 py-2 text-center">
                         {student.gender === 'ชาย' || student.gender === 'ช' ? 'ช' : 'ญ'}
                       </td>
                       <td className="border border-gray-300 px-3 py-2 text-center">{student.citizenId}</td>
                       <td className="border border-gray-300 px-3 py-2 text-center">{calculateAge(student.birthDate)}</td>
                       <td className="border border-gray-300 px-3 py-2 text-center">{formatBirthDate(student.birthDate)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 };
 
 // Print Preview Component
 interface PP5StudentPrintableProps {
   students: Student[];
   grade: string;
   semester: string;
   academicYear: string;
   maleCount: number;
   femaleCount: number;
 }
 
 const PP5StudentPrintable: React.FC<PP5StudentPrintableProps> = ({
   students,
   grade,
   semester,
   academicYear,
   maleCount,
   femaleCount
 }) => {
   return (
     <div className="p-4 font-sarabun" style={{ fontFamily: "'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif" }}>
       <style>{`
         body { 
           -webkit-print-color-adjust: exact !important;
           print-color-adjust: exact !important;
         }
         @page {
           size: A4 portrait;
           margin: 10mm;
         }
         @media print {
           .print-table {
             width: 100% !important;
             table-layout: auto !important;
             font-size: 16pt !important;
             font-family: 'TH SarabunPSK', 'TH Sarabun', 'Sarabun', sans-serif !important;
           }
           .print-table th,
           .print-table td {
             padding: 4px 6px !important;
             white-space: normal !important;
             word-break: keep-all !important;
           }
           table, th, td {
             border: 1px solid #000 !important;
             border-collapse: collapse !important;
           }
           th {
             background-color: #f3f4f6 !important;
           }
           thead {
             display: table-header-group !important;
           }
           tr {
             page-break-inside: avoid !important;
           }
         }
       `}</style>
       
       {/* Header */}
       <div className="text-center mb-4" style={{ fontSize: '18pt' }}>
         <h3 className="font-bold" style={{ fontSize: '21pt' }}>รายชื่อนักเรียนโรงเรียนบ้านดอนมูล</h3>
         <p style={{ fontSize: '18pt' }}>ระดับชั้น {grade} ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}</p>
       </div>
 
       {/* Summary */}
       <div className="mb-3 flex gap-4" style={{ fontSize: '16pt' }}>
         <span>จำนวนเพศชาย {maleCount} คน</span>
         <span>เพศหญิง {femaleCount} คน</span>
         <span>รวม {students.length} คน</span>
       </div>
 
       {/* Table */}
       <table className="w-full border-collapse print-table" style={{ fontSize: '16pt' }}>
         <thead>
           <tr style={{ backgroundColor: '#f3f4f6' }}>
             <th className="border border-black px-2 py-1 text-center font-semibold" style={{ width: '50px' }}>ลำดับที่</th>
             <th className="border border-black px-2 py-1 text-center font-semibold" style={{ width: '70px' }}>รหัสนักเรียน</th>
             <th className="border border-black px-2 py-1 text-center font-semibold">ชื่อ - นามสกุล</th>
             <th className="border border-black px-2 py-1 text-center font-semibold" style={{ width: '40px' }}>เพศ</th>
             <th className="border border-black px-2 py-1 text-center font-semibold" style={{ width: '130px' }}>เลขบัตรประจำตัวประชาชน</th>
             <th className="border border-black px-2 py-1 text-center font-semibold" style={{ width: '110px' }}>อายุ</th>
             <th className="border border-black px-2 py-1 text-center font-semibold" style={{ width: '90px' }}>วันเดือนปีเกิด</th>
           </tr>
         </thead>
         <tbody>
           {students.map((student, index) => (
             <tr key={student.id}>
               <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
               <td className="border border-black px-2 py-1 text-center">{student.studentId}</td>
               <td className="border border-black px-2 py-1">{student.titleTh}{student.firstNameTh} {student.lastNameTh}</td>
               <td className="border border-black px-2 py-1 text-center">
                 {student.gender === 'ชาย' || student.gender === 'ช' ? 'ช' : 'ญ'}
               </td>
               <td className="border border-black px-2 py-1 text-center">{student.citizenId}</td>
               <td className="border border-black px-2 py-1 text-center">{calculateAge(student.birthDate)}</td>
               <td className="border border-black px-2 py-1 text-center">{formatBirthDate(student.birthDate)}</td>
              </tr>
            ))}
            {/* Empty rows to fill A4 */}
            {Array.from({ length: getEmptyRowData(students.length).count }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black px-2 py-1 text-center" style={{ color: '#ccc' }}>{students.length + i + 1}</td>
                <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                <td className="border border-black px-2 py-1">&nbsp;</td>
                <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
                <td className="border border-black px-2 py-1 text-center">&nbsp;</td>
              </tr>
            ))}
          </tbody>
       </table>
     </div>
   );
 };
 
 export default PP5StudentInfo;