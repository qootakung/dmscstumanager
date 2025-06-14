
import { User } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';

const CURRENT_USER_KEY = 'dmsc_current_user';

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
  
  if (!users) {
    return [];
  }

  return users.map(({ created_at, ...rest }) => ({
    ...rest,
    role: rest.role as 'admin' | 'user',
    createdAt: created_at,
  }));
};

export const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> => {
  const { data, error } = await supabase.from('app_users').insert(userData).select().single();
  if (error) {
    console.error('Error adding user:', error);
    return null;
  }
  if (!data) {
    return null;
  }
  const { created_at, ...rest } = data;
  return {
    ...rest,
    role: rest.role as 'admin' | 'user',
    createdAt: created_at,
  };
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

  const { created_at, ...rest } = data;
  const user = {
    ...rest,
    role: rest.role as 'admin' | 'user',
    createdAt: created_at
  };
  setCurrentUser(user);
  return user;
};

export const logout = (): void => {
  setCurrentUser(null);
};
