
import { User } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';

const CURRENT_USER_KEY = 'dmsc_current_user';

type DbUserRow = {
  id: string;
  username: string;
  password: string;
  role: string;
  created_at: string;
  can_edit?: boolean;
};

const mapRow = (row: DbUserRow): User => ({
  id: row.id,
  username: row.username,
  password: row.password,
  role: row.role as 'admin' | 'user',
  canEdit: row.role === 'admin' ? true : Boolean(row.can_edit),
  createdAt: row.created_at,
});

// User management
export const getUsers = async (): Promise<User[]> => {
  let { data: users, error } = await supabase.from('app_users').select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  // Ensure default admin exists
  if (users && users.length === 0) {
    const defaultAdmin = {
      username: 'dmsc@',
      password: 'donmoondmsc@',
      role: 'admin',
      can_edit: true,
    };
    const { data: newAdmin, error: addAdminError } = await supabase
      .from('app_users')
      .insert(defaultAdmin as any)
      .select()
      .single();

    if (addAdminError) {
      console.error('Error creating default admin:', addAdminError);
    } else if (newAdmin) {
      users = [newAdmin];
    }
  }

  if (!users) return [];
  return (users as DbUserRow[]).map(mapRow);
};

export const addUser = async (
  userData: Omit<User, 'id' | 'createdAt'>
): Promise<User | null> => {
  const insertPayload: any = {
    username: userData.username,
    password: userData.password,
    role: userData.role,
    can_edit: userData.role === 'admin' ? true : Boolean(userData.canEdit),
  };
  const { data, error } = await supabase
    .from('app_users')
    .insert(insertPayload)
    .select()
    .single();
  if (error || !data) {
    console.error('Error adding user:', error);
    return null;
  }
  return mapRow(data as DbUserRow);
};

export const updateUserPermission = async (
  userId: string,
  canEdit: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from('app_users')
    .update({ can_edit: canEdit } as any)
    .eq('id', userId);
  if (error) {
    console.error('Error updating user permission:', error);
    return false;
  }
  // Refresh cached current user if it's the same
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser({ ...current, canEdit });
  }
  return true;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }
  return true;
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
  console.log('Attempting to login with username:', username);

  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      console.error('Login error:', error);
      setCurrentUser(null);
      return null;
    }

    const user = mapRow(data as DbUserRow);
    console.log('Login successful for user:', user.username);
    setCurrentUser(user);
    return user;
  } catch (error) {
    console.error('Unexpected login error:', error);
    setCurrentUser(null);
    return null;
  }
};

export const logout = (): void => {
  setCurrentUser(null);
};

/**
 * Returns true when the current logged-in user is allowed to edit/delete data.
 * Admins always can; regular users must have can_edit = true.
 */
export const canCurrentUserEdit = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  return Boolean(user.canEdit);
};
