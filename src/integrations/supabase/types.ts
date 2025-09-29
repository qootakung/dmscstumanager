export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string
          id: string
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          role: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      assessment_documents: {
        Row: {
          academic_year: string
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      competency_assessments: {
        Row: {
          academic_year: string
          assessed_by: string | null
          competency_number: number
          created_at: string
          grade: string
          id: string
          item_1_score: number
          item_2_score: number
          item_3_score: number
          item_4_score: number
          item_5_score: number
          student_id: string
          total_score: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          assessed_by?: string | null
          competency_number: number
          created_at?: string
          grade?: string
          id?: string
          item_1_score?: number
          item_2_score?: number
          item_3_score?: number
          item_4_score?: number
          item_5_score?: number
          student_id: string
          total_score?: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          assessed_by?: string | null
          competency_number?: number
          created_at?: string
          grade?: string
          id?: string
          item_1_score?: number
          item_2_score?: number
          item_3_score?: number
          item_4_score?: number
          item_5_score?: number
          student_id?: string
          total_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      dental_milk_records: {
        Row: {
          academic_year: string
          created_at: string
          day: number
          id: string
          is_recorded: boolean
          month: number
          record_type: string
          student_id: string
          updated_at: string
          year: number
        }
        Insert: {
          academic_year: string
          created_at?: string
          day: number
          id?: string
          is_recorded?: boolean
          month: number
          record_type: string
          student_id: string
          updated_at?: string
          year: number
        }
        Update: {
          academic_year?: string
          created_at?: string
          day?: number
          id?: string
          is_recorded?: boolean
          month?: number
          record_type?: string
          student_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_dental_milk_records_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_health_records: {
        Row: {
          academic_year: string
          created_at: string
          height_cm: number | null
          id: string
          measurement_date: string
          student_id: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          academic_year: string
          created_at?: string
          height_cm?: number | null
          id?: string
          measurement_date: string
          student_id: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          academic_year?: string
          created_at?: string
          height_cm?: number | null
          id?: string
          measurement_date?: string
          student_id?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_health_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_scores: {
        Row: {
          academic_year: string
          created_at: string
          grade_level: string
          id: string
          max_score: number
          score: number
          student_id: string
          subject_code: string
          subject_name: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          grade_level: string
          id?: string
          max_score?: number
          score?: number
          student_id: string
          subject_code: string
          subject_name: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          grade_level?: string
          id?: string
          max_score?: number
          score?: number
          student_id?: string
          subject_code?: string
          subject_name?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_scores_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academicYear: string | null
          birthDate: string | null
          citizenId: string | null
          createdAt: string | null
          district: string | null
          fatherFirstName: string | null
          fatherLastName: string | null
          fatherTitle: string | null
          firstNameEn: string | null
          firstNameTh: string | null
          gender: string | null
          grade: string | null
          guardianFirstName: string | null
          guardianLastName: string | null
          guardianPhone: string | null
          guardianTitle: string | null
          houseNumber: string | null
          id: string
          lastNameEn: string | null
          lastNameTh: string | null
          moo: string | null
          motherFirstName: string | null
          motherLastName: string | null
          motherTitle: string | null
          postalCode: string | null
          province: string | null
          studentId: string | null
          subDistrict: string | null
          titleTh: string | null
          updatedAt: string | null
        }
        Insert: {
          academicYear?: string | null
          birthDate?: string | null
          citizenId?: string | null
          createdAt?: string | null
          district?: string | null
          fatherFirstName?: string | null
          fatherLastName?: string | null
          fatherTitle?: string | null
          firstNameEn?: string | null
          firstNameTh?: string | null
          gender?: string | null
          grade?: string | null
          guardianFirstName?: string | null
          guardianLastName?: string | null
          guardianPhone?: string | null
          guardianTitle?: string | null
          houseNumber?: string | null
          id?: string
          lastNameEn?: string | null
          lastNameTh?: string | null
          moo?: string | null
          motherFirstName?: string | null
          motherLastName?: string | null
          motherTitle?: string | null
          postalCode?: string | null
          province?: string | null
          studentId?: string | null
          subDistrict?: string | null
          titleTh?: string | null
          updatedAt?: string | null
        }
        Update: {
          academicYear?: string | null
          birthDate?: string | null
          citizenId?: string | null
          createdAt?: string | null
          district?: string | null
          fatherFirstName?: string | null
          fatherLastName?: string | null
          fatherTitle?: string | null
          firstNameEn?: string | null
          firstNameTh?: string | null
          gender?: string | null
          grade?: string | null
          guardianFirstName?: string | null
          guardianLastName?: string | null
          guardianPhone?: string | null
          guardianTitle?: string | null
          houseNumber?: string | null
          id?: string
          lastNameEn?: string | null
          lastNameTh?: string | null
          moo?: string | null
          motherFirstName?: string | null
          motherLastName?: string | null
          motherTitle?: string | null
          postalCode?: string | null
          province?: string | null
          studentId?: string | null
          subDistrict?: string | null
          titleTh?: string | null
          updatedAt?: string | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          academicYear: string | null
          appointmentDate: string | null
          birthDate: string | null
          citizenId: string | null
          createdAt: string | null
          education: string | null
          email: string | null
          firstName: string | null
          id: string
          lastName: string | null
          lineId: string | null
          majorSubject: string | null
          phone: string | null
          position: string | null
          positionNumber: string | null
          salary: string | null
          scoutLevel: string | null
          updatedAt: string | null
        }
        Insert: {
          academicYear?: string | null
          appointmentDate?: string | null
          birthDate?: string | null
          citizenId?: string | null
          createdAt?: string | null
          education?: string | null
          email?: string | null
          firstName?: string | null
          id?: string
          lastName?: string | null
          lineId?: string | null
          majorSubject?: string | null
          phone?: string | null
          position?: string | null
          positionNumber?: string | null
          salary?: string | null
          scoutLevel?: string | null
          updatedAt?: string | null
        }
        Update: {
          academicYear?: string | null
          appointmentDate?: string | null
          birthDate?: string | null
          citizenId?: string | null
          createdAt?: string | null
          education?: string | null
          email?: string | null
          firstName?: string | null
          id?: string
          lastName?: string | null
          lineId?: string | null
          majorSubject?: string | null
          phone?: string | null
          position?: string | null
          positionNumber?: string | null
          salary?: string | null
          scoutLevel?: string | null
          updatedAt?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_student_health_details: {
        Args: { p_academic_year: string; p_grade?: string; p_month?: number }
        Returns: {
          age_days: number
          age_months: number
          age_years: number
          full_name: string
          height_cm: number
          measurement_date: string
          record_id: string
          student_code: string
          student_record_id: string
          weight_kg: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
