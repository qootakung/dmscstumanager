-- Create table for dental and milk tracking records
CREATE TABLE public.dental_milk_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  academic_year TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  record_type TEXT NOT NULL CHECK (record_type IN ('brushing', 'milk')),
  is_recorded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year, month, year, day, record_type)
);

-- Enable Row Level Security
ALTER TABLE public.dental_milk_records ENABLE ROW LEVEL SECURITY;

-- Create policies for dental_milk_records
CREATE POLICY "Allow authenticated users to view dental milk records" 
ON public.dental_milk_records 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert dental milk records" 
ON public.dental_milk_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update dental milk records" 
ON public.dental_milk_records 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated users to delete dental milk records" 
ON public.dental_milk_records 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_dental_milk_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dental_milk_records_updated_at
BEFORE UPDATE ON public.dental_milk_records
FOR EACH ROW
EXECUTE FUNCTION public.update_dental_milk_records_updated_at();

-- Add foreign key constraint to students table
ALTER TABLE public.dental_milk_records 
ADD CONSTRAINT fk_dental_milk_records_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_dental_milk_records_student_month ON public.dental_milk_records(student_id, year, month);
CREATE INDEX idx_dental_milk_records_date ON public.dental_milk_records(year, month, day);