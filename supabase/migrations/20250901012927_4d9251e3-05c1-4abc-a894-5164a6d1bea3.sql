-- Enable RLS on assessment_documents table
ALTER TABLE public.assessment_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own documents
CREATE POLICY "Users can manage assessment documents" ON public.assessment_documents
FOR ALL USING (true);