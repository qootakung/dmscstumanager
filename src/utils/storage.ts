import { Student, User } from '@/types/student';

const STUDENTS_KEY = 'dmsc_students';
const USERS_KEY = 'dmsc_users';
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
export const saveStudents = (students: Student[]): void => {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addStudent = (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Student => {
  const students = getStudents();
  const newStudent: Student = {
    ...student,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
};

export const updateStudent = (id: string, studentData: Partial<Student>): Student | null => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  students[index] = {
    ...students[index],
    ...studentData,
    updatedAt: new Date().toISOString(),
  };
  saveStudents(students);
  return students[index];
};

export const deleteStudent = (id: string): boolean => {
  const students = getStudents();
  const filteredStudents = students.filter(s => s.id !== id);
  if (filteredStudents.length === students.length) return false;
  saveStudents(filteredStudents);
  return true;
};

export const clearAllStudents = (): void => {
  saveStudents([]);
};

// User management
export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  const users = data ? JSON.parse(data) : [];
  
  // Ensure default admin exists
  if (users.length === 0) {
    const defaultAdmin: User = {
      id: '1',
      username: 'dmsc@',
      password: 'donmoondmsc@',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    users.push(defaultAdmin);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  
  return users;
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
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

export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logout = (): void => {
  setCurrentUser(null);
};

// Statistics
export const getStudentStatistics = () => {
  const students = getStudents();
  const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist year
  const currentAcademicYear = currentYear.toString();
  
  const currentYearStudents = students.filter(s => s.academicYear === currentAcademicYear);
  
  const gradeStats = gradeOptions.reduce((acc, grade) => {
    acc[grade] = currentYearStudents.filter(s => s.grade === grade).length;
    return acc;
  }, {} as Record<string, number>);
  
  const genderStats = {
    ชาย: currentYearStudents.filter(s => s.gender === 'ชาย').length,
    หญิง: currentYearStudents.filter(s => s.gender === 'หญิง').length,
  };
  
  return {
    total: currentYearStudents.length,
    byGrade: gradeStats,
    byGender: genderStats,
    academicYears: [...new Set(students.map(s => s.academicYear))].sort().reverse(),
  };
};

// Add getTeachers function for compatibility
export const getTeachers = () => {
  try {
    const teachers = localStorage.getItem('school_teachers');
    return teachers ? JSON.parse(teachers) : [];
  } catch (error) {
    console.error('Error loading teachers:', error);
    return [];
  }
};
