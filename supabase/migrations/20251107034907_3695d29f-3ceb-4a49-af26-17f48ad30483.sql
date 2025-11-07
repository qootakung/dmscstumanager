-- Add unique constraint for dental_milk_records to prevent duplicates
-- This allows upsert operations to work correctly
ALTER TABLE dental_milk_records 
ADD CONSTRAINT dental_milk_records_unique_key 
UNIQUE (student_id, academic_year, month, year, day, record_type);