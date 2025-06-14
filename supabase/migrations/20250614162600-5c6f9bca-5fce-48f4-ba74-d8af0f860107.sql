
CREATE OR REPLACE FUNCTION public.get_student_health_details(p_academic_year TEXT, p_month INT DEFAULT NULL)
RETURNS TABLE(
    record_id UUID,
    student_record_id UUID,
    student_code TEXT,
    full_name TEXT,
    age_years BIGINT,
    weight_kg NUMERIC,
    height_cm NUMERIC,
    measurement_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        shr.id AS record_id,
        s.id AS student_record_id,
        s."studentId" AS student_code,
        s."firstNameTh" || ' ' || s."lastNameTh" AS full_name,
        DATE_PART('year', AGE(shr.measurement_date, s."birthDate"))::bigint AS age_years,
        shr.weight_kg,
        shr.height_cm,
        shr.measurement_date
    FROM
        public.student_health_records AS shr
    JOIN
        public.students AS s ON shr.student_id = s.id
    WHERE
        shr.academic_year = p_academic_year
        AND (p_month IS NULL OR EXTRACT(MONTH FROM shr.measurement_date) = p_month)
    ORDER BY
        shr.measurement_date DESC, s."studentId" ASC;
END;
$$;
