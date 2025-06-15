
-- Enable Row Level Security for all tables
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_health_records ENABLE ROW LEVEL SECURITY;

-- Create policies for app_users (admin only access)
CREATE POLICY "Only admins can view users" ON public.app_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.app_users 
      WHERE username = current_user AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage users" ON public.app_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.app_users 
      WHERE username = current_user AND role = 'admin'
    )
  );

-- Create policies for students (authenticated users can access)
CREATE POLICY "Authenticated users can view students" ON public.students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage students" ON public.students
  FOR ALL TO authenticated USING (true);

-- Create policies for teachers (authenticated users can access)
CREATE POLICY "Authenticated users can view teachers" ON public.teachers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage teachers" ON public.teachers
  FOR ALL TO authenticated USING (true);

-- Create policies for student health records (authenticated users can access)
CREATE POLICY "Authenticated users can view health records" ON public.student_health_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage health records" ON public.student_health_records
  FOR ALL TO authenticated USING (true);
