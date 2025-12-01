-- Add semester column to dental_milk_records table
ALTER TABLE public.dental_milk_records 
ADD COLUMN semester text NOT NULL DEFAULT '1';

-- Add semester column to student_health_records table
ALTER TABLE public.student_health_records 
ADD COLUMN semester text NOT NULL DEFAULT '1';

-- Add semester column to student_scores table
ALTER TABLE public.student_scores 
ADD COLUMN semester text NOT NULL DEFAULT '1';

-- Add semester column to competency_assessments table
ALTER TABLE public.competency_assessments 
ADD COLUMN semester text NOT NULL DEFAULT '1';

-- Add comments
COMMENT ON COLUMN public.dental_milk_records.semester IS 'ภาคเรียน: 1 หรือ 2';
COMMENT ON COLUMN public.student_health_records.semester IS 'ภาคเรียน: 1 หรือ 2';
COMMENT ON COLUMN public.student_scores.semester IS 'ภาคเรียน: 1 หรือ 2';
COMMENT ON COLUMN public.competency_assessments.semester IS 'ภาคเรียน: 1 หรือ 2';

-- Create indexes for better query performance
CREATE INDEX idx_dental_milk_semester ON public.dental_milk_records(semester);
CREATE INDEX idx_dental_milk_academic_year_semester ON public.dental_milk_records("academic_year", semester);

CREATE INDEX idx_student_health_semester ON public.student_health_records(semester);
CREATE INDEX idx_student_health_academic_year_semester ON public.student_health_records("academic_year", semester);

CREATE INDEX idx_student_scores_semester ON public.student_scores(semester);
CREATE INDEX idx_student_scores_academic_year_semester ON public.student_scores("academic_year", semester);

CREATE INDEX idx_competency_semester ON public.competency_assessments(semester);
CREATE INDEX idx_competency_academic_year_semester ON public.competency_assessments("academic_year", semester);