
import React, { useState, useEffect } from 'react';
import { getStudentStatistics } from '@/utils/storage';
import { getTeacherStatistics } from '@/utils/teacherStorage';
import StatisticsCards from './dashboard/StatisticsCards';
import StudentChartsSection from './dashboard/StudentChartsSection';
import TeacherPositionChart from './dashboard/TeacherPositionChart';
import AcademicYearsDisplay from './dashboard/AcademicYearsDisplay';
import DashboardSkeleton from './dashboard/DashboardSkeleton';

type StudentStats = Awaited<ReturnType<typeof getStudentStatistics>>;
type TeacherStats = Awaited<ReturnType<typeof getTeacherStatistics>>;

const Dashboard: React.FC = () => {
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [sStats, tStats] = await Promise.all([
          getStudentStatistics(),
          getTeacherStatistics(),
        ]);
        setStudentStats(sStats);
        setTeacherStats(tStats);
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  if (loading || !studentStats || !teacherStats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <StatisticsCards studentStats={studentStats} teacherStats={teacherStats} />
      <StudentChartsSection studentStats={studentStats} />
      <TeacherPositionChart teacherStats={teacherStats} />
      <AcademicYearsDisplay academicYears={studentStats.academicYears} />
    </div>
  );
};

export default Dashboard;
