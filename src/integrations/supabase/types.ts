export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
