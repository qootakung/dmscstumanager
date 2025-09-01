import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  FileText,
  NotebookPen,
  BookOpen,
  List,
  Info,
  Target,
  BarChart3,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

interface AssessmentSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: 'cover',
    title: 'หน้าปก',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    id: 'notes',
    title: 'บันทึกข้อความ',
    icon: NotebookPen,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
  {
    id: 'introduction',
    title: 'คำนำ',
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    id: 'instructions',
    title: 'คำชี้แจง',
    icon: Info,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
  },
];

const competencyItems = [
  { id: 'competency-1', title: 'สมรรถนะด้านที่ 1: การสื่อสาร' },
  { id: 'competency-2', title: 'สมรรถนะด้านที่ 2: การคิด' },
  { id: 'competency-3', title: 'สมรรถนะด้านที่ 3: การแก้ปัญหา' },
  { id: 'competency-4', title: 'สมรรถนะด้านที่ 4: การใช้ทักษะชีวิต' },
  { id: 'competency-5', title: 'สมรรถนะด้านที่ 5: การใช้เทคโนโลยี' },
];

export function AssessmentSidebar({ activeSection, onSectionChange }: AssessmentSidebarProps) {
  return (
    <Sidebar className="w-72 border-r border-gray-200 bg-white/90 backdrop-blur-sm">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="p-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-gray-800 mb-4">
            เมนูหลัก
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                      ${activeSection === item.id 
                        ? `${item.bgColor} ${item.color} border-l-4 border-current shadow-sm` 
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                    {activeSection === item.id && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Competency Sections */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-lg font-semibold text-gray-800 mb-4">
            สมรรถนะ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {competencyItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                      ${activeSection === item.id 
                        ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-sm' 
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <Target className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                    {activeSection === item.id && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Summary Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-lg font-semibold text-gray-800 mb-4">
            รายงาน
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onSectionChange('summary')}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${activeSection === 'summary' 
                      ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600 shadow-sm' 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">สรุปผลการประเมินรายชั้นเรียน</span>
                  {activeSection === 'summary' && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onSectionChange('student-report')}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${activeSection === 'student-report' 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm' 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="font-medium">สรุปผลการประเมินรายชั้นปี</span>
                  {activeSection === 'student-report' && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}