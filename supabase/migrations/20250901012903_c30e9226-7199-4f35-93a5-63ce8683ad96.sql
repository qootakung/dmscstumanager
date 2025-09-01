-- Update the check constraint to include 'notes' and 'instructions' document types
ALTER TABLE public.assessment_documents 
DROP CONSTRAINT assessment_documents_document_type_check;

ALTER TABLE public.assessment_documents 
ADD CONSTRAINT assessment_documents_document_type_check 
CHECK (document_type = ANY (ARRAY['cover'::text, 'introduction'::text, 'table_of_contents'::text, 'notes'::text, 'instructions'::text]));