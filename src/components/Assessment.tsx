import React, { useState } from 'react';
import { AssessmentSidebar } from './assessment/AssessmentSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu, ClipboardList } from 'lucide-react';

// Import assessment pages
import { CoverPage } from './assessment/pages/CoverPage';
import { NotesPage } from './assessment/pages/NotesPage';
import { IntroductionPage } from './assessment/pages/IntroductionPage';
import { InstructionsPage } from './assessment/pages/InstructionsPage';
import { CompetencyPage } from './assessment/pages/CompetencyPage';
import { SummaryPage } from './assessment/pages/SummaryPage';
import { StudentImportPage } from './assessment/pages/StudentImportPage';

const Assessment = () => {
  const [activeSection, setActiveSection] = useState('student-import');

  const renderContent = () => {
    switch (activeSection) {
      case 'student-import':
        return <StudentImportPage />;
      case 'cover':
        return <CoverPage />;
      case 'notes':
        return <NotesPage />;
      case 'introduction':
        return <IntroductionPage />;
      case 'instructions':
        return <InstructionsPage />;
      case 'competency-1':
        return <CompetencyPage competencyNumber={1} title="สมรรถนะด้านที่ 1: ความสามารถในการสื่อสาร" />;
      case 'competency-2':
        return <CompetencyPage competencyNumber={2} title="สมรรถนะด้านที่ 2: ความสามารถในการคิด" />;
      case 'competency-3':
        return <CompetencyPage competencyNumber={3} title="สมรรถนะด้านที่ 3: ความสามารถในการแก้ปัญหา" />;
      case 'competency-4':
        return <CompetencyPage competencyNumber={4} title="สมรรถนะด้านที่ 4: ความสามารถในการใช้ทักษะชีวิต" />;
      case 'competency-5':
        return <CompetencyPage competencyNumber={5} title="สมรรถนะด้านที่ 5: ความสามารถในการใช้เทคโนโลยี" />;
      case 'summary':
        return <SummaryPage />;
      default:
        return <StudentImportPage />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <AssessmentSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      แบบประเมินสมรรถนะนักเรียน
                    </h1>
                    <p className="text-sm text-gray-600">ระบบประเมินและติดตามพัฒนาการนักเรียน</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/70 hover:bg-white border-gray-300"
                >
                  บันทึกการทำงาน
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md"
                >
                  ส่งออกรายงาน
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-8">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Assessment;