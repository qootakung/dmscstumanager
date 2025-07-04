
import React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
              currentPage === 'dashboard' && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onPageChange('dashboard')}
          >
            หน้าแรก
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>ข้อมูลนักเรียน</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <button
                    className={cn(
                      "flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md text-left",
                      currentPage === 'students' && 'bg-accent'
                    )}
                    onClick={() => onPageChange('students')}
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      จัดการข้อมูลนักเรียน
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      เพิ่ม แก้ไข และจัดการข้อมูลนักเรียน
                    </p>
                  </button>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <button
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left",
                      currentPage === 'health' && 'bg-accent'
                    )}
                    onClick={() => onPageChange('health')}
                  >
                    <div className="text-sm font-medium leading-none">น้ำหนักส่วนสูง</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      จัดการข้อมูลน้ำหนักและส่วนสูงนักเรียน
                    </p>
                  </button>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <button
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left",
                      currentPage === 'analysis' && 'bg-accent'
                    )}
                    onClick={() => onPageChange('analysis')}
                  >
                    <div className="text-sm font-medium leading-none">วิเคราะห์ผู้เรียน</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      วิเคราะห์และประเมินผลการเรียนรู้
                    </p>
                  </button>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <button
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left",
                      currentPage === 'reports' && 'bg-accent'
                    )}
                    onClick={() => onPageChange('reports')}
                  >
                    <div className="text-sm font-medium leading-none">รายงานข้อมูลนักเรียน</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      สร้างและส่งออกรายงานต่างๆ
                    </p>
                  </button>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
              currentPage === 'teachers' && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onPageChange('teachers')}
          >
            ข้อมูลครู
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
              currentPage === 'teacherReports' && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onPageChange('teacherReports')}
          >
            รายงานข้อมูลครู
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
              currentPage === 'finance' && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onPageChange('finance')}
          >
            การเงิน
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
