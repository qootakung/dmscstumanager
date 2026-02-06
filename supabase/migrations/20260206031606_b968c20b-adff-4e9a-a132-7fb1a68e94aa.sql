-- Delete duplicate students keeping only the first record (by createdAt)
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY "studentId", "citizenId", grade, "academicYear" 
      ORDER BY "createdAt" ASC
    ) as rn
  FROM students
)
DELETE FROM students 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);