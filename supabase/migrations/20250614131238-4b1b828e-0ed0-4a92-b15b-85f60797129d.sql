
-- Create students table
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "academicYear" text,
  "citizenId" text,
  "studentId" text,
  grade text,
  gender text,
  "titleTh" text,
  "firstNameTh" text,
  "lastNameTh" text,
  "firstNameEn" text,
  "lastNameEn" text,
  "birthDate" date,
  "fatherTitle" text,
  "fatherFirstName" text,
  "fatherLastName" text,
  "motherTitle" text,
  "motherFirstName" text,
  "motherLastName" text,
  "guardianTitle" text,
  "guardianFirstName" text,
  "guardianLastName" text,
  "guardianPhone" text,
  "houseNumber" text,
  moo text,
  "subDistrict" text,
  district text,
  province text,
  "postalCode" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "positionNumber" text,
  "firstName" text,
  "lastName" text,
  position text,
  "appointmentDate" date,
  education text,
  "citizenId" text,
  "birthDate" date,
  "scoutLevel" text,
  "majorSubject" text,
  salary text,
  phone text,
  "lineId" text,
  email text,
  "academicYear" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now()
);

-- Enable RLS for students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow public access to students table for now
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public write access to students" ON public.students FOR ALL USING (true);

-- Enable RLS for teachers table
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Allow public access to teachers table for now
CREATE POLICY "Allow public read access to teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow public write access to teachers" ON public.teachers FOR ALL USING (true);
