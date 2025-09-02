-- Fix security issues: Enable RLS on tables that don't have it enabled
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_documents ENABLE ROW LEVEL SECURITY;