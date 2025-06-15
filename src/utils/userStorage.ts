
import { User } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';

const CURRENT_USER_KEY = 'dmsc_current_user';

// User management
export const getUsers = async (): Promise<User[]> => {
  // Set the current user context for RLS
  const currentUser = getCurrentUser();
  if (currentUser) {
    await supabase.rpc('set_config', {
      setting: 'custom.current_user',
      value: currentUser.username,
      is_local: false
    }).catch(() => {
      // Ignore if function doesn't exist, we'll handle it differently
    });
  }

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
  // For now, we'll bypass RLS for login by using the service role temporarily
  // This is a workaround since we're using custom auth instead of Supabase Auth
  
  // First, try to find the user (this might fail due to RLS)
  let { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();
  
  // If RLS blocks us, we need to temporarily disable it for login
  if (error && error.code === 'PGRST116') {
    // User not found or RLS blocked access
    console.log('Login failed: Invalid credentials or RLS blocked access');
    setCurrentUser(null);
    return null;
  }

  if (error || !data) {
    console.error('Login error:', error);
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
