-- Add semester column to students table
ALTER TABLE public.students 
ADD COLUMN semester text NOT NULL DEFAULT '1';

-- Add comment to explain the column
COMMENT ON COLUMN public.students.semester IS 'ภาคเรียน: 1 หรือ 2';

-- Create index for better query performance
CREATE INDEX idx_students_semester ON public.students(semester);
CREATE INDEX idx_students_academic_year_semester ON public.students("academicYear", semester);