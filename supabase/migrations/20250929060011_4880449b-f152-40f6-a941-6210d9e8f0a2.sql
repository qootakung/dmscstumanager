-- Create student_scores table for storing student grades
CREATE TABLE public.student_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for student_scores
CREATE POLICY "Authenticated users can view student scores" 
ON public.student_scores 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage student scores" 
ON public.student_scores 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_student_scores_student_id ON public.student_scores(student_id);
CREATE INDEX idx_student_scores_teacher_id ON public.student_scores(teacher_id);
CREATE INDEX idx_student_scores_academic_year ON public.student_scores(academic_year);
CREATE INDEX idx_student_scores_grade_level ON public.student_scores(grade_level);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_student_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_student_scores_updated_at
  BEFORE UPDATE ON public.student_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_scores_updated_at();