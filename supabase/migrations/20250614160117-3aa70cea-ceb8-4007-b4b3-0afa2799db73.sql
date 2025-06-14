
CREATE TABLE public.student_health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg NUMERIC(5, 2),
  height_cm NUMERIC(5, 2),
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT student_measurement_per_day_unique UNIQUE (student_id, measurement_date)
);

-- Add indexes for faster lookups
CREATE INDEX ON public.student_health_records (student_id);
CREATE INDEX ON public.student_health_records (academic_year);
CREATE INDEX ON public.student_health_records (measurement_date);
