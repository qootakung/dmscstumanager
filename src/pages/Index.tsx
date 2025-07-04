
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import StudentManagement from "@/components/StudentManagement";
import StudentHealth from "@/components/StudentHealth";
import StudentAnalysis from "@/components/StudentAnalysis";
import Reports from "@/components/Reports";
import TeacherManagement from "@/components/TeacherManagement";
import TeacherReports from "@/components/TeacherReports";
import FinancialReports from "@/components/FinancialReports";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'health':
        return <StudentHealth />;
      case 'analysis':
        return <StudentAnalysis />;
      case 'reports':
        return <Reports />;
      case 'teachers':
        return <TeacherManagement />;
      case 'teacherReports':
        return <TeacherReports />;
      case 'finance':
        return <FinancialReports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 mr-8">
                ระบบจัดการข้อมูลโรงเรียน
              </h1>
              <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Index;
