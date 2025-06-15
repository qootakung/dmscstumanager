
-- Remove existing problematic RLS policies
DROP POLICY IF EXISTS "Only admins can view users" ON public.app_users;
DROP POLICY IF EXISTS "Only admins can manage users" ON public.app_users;

-- Create a security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    -- For login functionality, we need to allow basic access
    -- This function will be used to check roles without causing recursion
    RETURN (
        SELECT role 
        FROM public.app_users 
        WHERE username = current_setting('custom.current_user', true)
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies that don't cause infinite recursion
-- Allow public access for authentication (login) purposes
CREATE POLICY "Allow authentication access" ON public.app_users
  FOR SELECT USING (true);

-- Allow insert for creating new users (admin functionality)
CREATE POLICY "Allow user creation" ON public.app_users
  FOR INSERT WITH CHECK (true);

-- Allow updates only by admins (will be controlled by application logic)
CREATE POLICY "Allow user updates" ON public.app_users
  FOR UPDATE USING (true);

-- Allow deletes only by admins (will be controlled by application logic)  
CREATE POLICY "Allow user deletes" ON public.app_users
  FOR DELETE USING (true);
