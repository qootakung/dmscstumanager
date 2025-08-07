-- Create storage bucket for assessment documents
INSERT INTO storage.buckets (id, name, public) VALUES ('assessment-documents', 'assessment-documents', true);

-- Create table for assessment documents
CREATE TABLE public.assessment_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL CHECK (document_type IN ('cover', 'introduction', 'table_of_contents')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessment_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment documents
CREATE POLICY "Allow authenticated users to view assessment documents" 
ON public.assessment_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert assessment documents" 
ON public.assessment_documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update assessment documents" 
ON public.assessment_documents 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated users to delete assessment documents" 
ON public.assessment_documents 
FOR DELETE 
USING (true);

-- Create storage policies for assessment documents
CREATE POLICY "Assessment documents are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assessment-documents');

CREATE POLICY "Authenticated users can upload assessment documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'assessment-documents');

CREATE POLICY "Authenticated users can update assessment documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'assessment-documents');

CREATE POLICY "Authenticated users can delete assessment documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'assessment-documents');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_assessment_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_assessment_documents_updated_at
  BEFORE UPDATE ON public.assessment_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assessment_documents_updated_at();