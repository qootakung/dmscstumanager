
-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create attendance records table for daily attendance tracking
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT '/', -- '/' = present, 'ป' = sick leave, 'ล' = personal leave, 'ข' = absent
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL DEFAULT '1',
  grade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, attendance_date)
);

-- Enable Row Level Security
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to attendance" 
ON public.attendance_records 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public write access to attendance" 
ON public.attendance_records 
FOR ALL 
USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_attendance_student_date ON public.attendance_records(student_id, attendance_date);
CREATE INDEX idx_attendance_grade_semester ON public.attendance_records(grade, semester, academic_year);
CREATE INDEX idx_attendance_date ON public.attendance_records(attendance_date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
