import { Student, User } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';

const CURRENT_USER_KEY = 'dmsc_current_user';

// Generate academic years from 2568 to 2600
export const generateAcademicYears = (): string[] => {
  const years: string[] = [];
  for (let year = 2568; year <= 2600; year++) {
    years.push(`${year}`);
  }
  return years;
};

export const gradeOptions = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

// Student data management
export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase.from('students').select('*').order('studentId', { ascending: true });
  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  return data as Student[];
};

export const addStudent = async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student | null> => {
  const { data, error } = await supabase.from('students').insert(student).select().single();
  if (error) {
    console.error('Error adding student:', error);
    return null;
  }
  return data as Student;
};

export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .update({ ...studentData, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating student:', error);
    return null;
  }
  return data as Student;
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) {
    console.error('Error deleting student:', error);
    return false;
  }
  return true;
};

export const clearAllStudents = async (): Promise<void> => {
  const { error } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error('Error clearing all students:', error);
  }
};

// User management
export const getUsers = async (): Promise<User[]> => {
  let { data: users, error } = await supabase.from('app_users').select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  // Ensure default admin exists
  if (users && users.length === 0) {
    const defaultAdmin: Omit<User, 'id' | 'createdAt'> = {
      username: 'dmsc@',
      password: 'donmoondmsc@',
      role: 'admin',
    };
    const { data: newAdmin, error: addAdminError } = await supabase
      .from('app_users')
      .insert(defaultAdmin)
      .select()
      .single();
    
    if (addAdminError) {
      console.error('Error creating default admin:', addAdminError);
    } else if (newAdmin) {
      users = [newAdmin];
    }
  }
  
  return (users || []) as User[];
};

export const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> => {
  const { data, error } = await supabase.from('app_users').insert(userData).select().single();
  if (error) {
    console.error('Error adding user:', error);
    return null;
  }
  return data as User;
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const login = async (username: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();
  
  if (error || !data) {
    if (error && error.code !== 'PGRST116') { // "Matched row not found" is a valid login failure, not an error.
      console.error('Login error:', error);
    }
    setCurrentUser(null);
    return null;
  }

  const user = data as User;
  setCurrentUser(user);
  return user;
};

export const logout = (): void => {
  setCurrentUser(null);
};

// Statistics
export const getStudentStatistics = async () => {
  const students = await getStudents();
  const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist year
  const currentAcademicYear = currentYear.toString();
  
  const currentYearStudents = students.filter(s => s.academicYear === currentAcademicYear);
  
  const gradeStats = gradeOptions.reduce((acc, grade) => {
    acc[grade] = currentYearStudents.filter(s => s.grade === grade).length;
    return acc;
  }, {} as Record<string, number>);
  
  const genderStats = {
    ชาย: currentYearStudents.filter(s => {
      const gender = s.gender?.trim();
      return gender === 'ชาย' || gender === 'ช';
    }).length,
    หญิง: currentYearStudents.filter(s => {
      const gender = s.gender?.trim();
      return gender === 'หญิง' || gender === 'ญ';
    }).length,
  };
  
  return {
    total: currentYearStudents.length,
    byGrade: gradeStats,
    byGender: genderStats,
    academicYears: [...new Set(students.map(s => s.academicYear))].sort().reverse(),
  };
};
