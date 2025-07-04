
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Users, GraduationCap, FileText, BarChart3, Activity, User } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const getButtonClass = (view: string) => 
    `px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
      currentView === view
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      {/* Student Data Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className={`${getButtonClass('student-menu')} flex items-center gap-2`}
            variant="outline"
          >
            <Users className="w-5 h-5" />
            ข้อมูลนักเรียน
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem 
            onClick={() => onViewChange('student')}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            จัดการข้อมูลนักเรียน
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onViewChange('health')}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            น้ำหนักส่วนสูง
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onViewChange('analysis')}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            วิเคราะห์ผู้เรียน
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onViewChange('reports')}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            รายงานข้อมูลนักเรียน
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Teacher Data Button */}
      <Button
        onClick={() => onViewChange('teacher')}
        className={`${getButtonClass('teacher')} flex items-center gap-2`}
        variant="outline"
      >
        <User className="w-5 h-5" />
        ข้อมูลครู
      </Button>

      {/* Financial Reports Button */}
      <Button
        onClick={() => onViewChange('financial')}
        className={`${getButtonClass('financial')} flex items-center gap-2`}
        variant="outline"
      >
        <FileText className="w-5 h-5" />
        รายงานการเงิน
      </Button>

      {/* Teacher Reports Button */}
      <Button
        onClick={() => onViewChange('teacher-reports')}
        className={`${getButtonClass('teacher-reports')} flex items-center gap-2`}
        variant="outline"
      >
        <FileText className="w-5 h-5" />
        รายงานครู
      </Button>
    </div>
  );
};

export default Navigation;
