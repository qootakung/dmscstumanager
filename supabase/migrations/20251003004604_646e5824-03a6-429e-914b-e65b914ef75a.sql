-- Fix RLS policies for student_health_records table to work with custom authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view health records" ON student_health_records;
DROP POLICY IF EXISTS "Authenticated users can manage health records" ON student_health_records;

-- Create new policies that allow anon access (since the app uses custom auth via app_users table)
CREATE POLICY "Allow anon to view health records"
  ON student_health_records
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert health records"
  ON student_health_records
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update health records"
  ON student_health_records
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete health records"
  ON student_health_records
  FOR DELETE
  TO anon
  USING (true);