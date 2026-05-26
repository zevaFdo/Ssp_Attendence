/**
 * Database types — kept hand-maintained until you generate from your Supabase project:
 *   npx supabase gen types typescript --project-id <id> --schema public > src/types/database.types.ts
 *
 * Mirrors the SQL in supabase/migrations/.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "admin"
  | "hr_supervisor"
  | "section_head"
  | "team_leader"
  | "employee";

export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "wfh"
  | "on_leave";

export type RequestType = "leave" | "late";
export type ApprovalStatus = "pending" | "approved" | "rejected";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  section_id: string | null;
  team_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ProfileInsert = {
  id: string;
  full_name: string;
  email: string;
  role?: UserRole;
  section_id?: string | null;
  team_id?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

type SectionRow = {
  id: string;
  name: string;
  description: string | null;
  section_head_id: string | null;
  created_at: string;
  updated_at: string;
};

type SectionInsert = {
  id?: string;
  name: string;
  description?: string | null;
  section_head_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

type TeamRow = {
  id: string;
  name: string;
  section_id: string;
  team_leader_id: string | null;
  created_at: string;
  updated_at: string;
};

type TeamInsert = {
  id?: string;
  name: string;
  section_id: string;
  team_leader_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

type AttendanceRow = {
  id: string;
  user_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: AttendanceStatus;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
};

type AttendanceInsert = {
  id?: string;
  user_id: string;
  date?: string;
  clock_in?: string | null;
  clock_out?: string | null;
  status?: AttendanceStatus;
  notes?: string | null;
  recorded_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

type RequestRow = {
  id: string;
  user_id: string;
  type: RequestType;
  date: string;
  reason: string;
  hr_approval: ApprovalStatus;
  hr_approved_by: string | null;
  hr_approved_at: string | null;
  section_head_approval: ApprovalStatus;
  section_head_approved_by: string | null;
  section_head_approved_at: string | null;
  document_path: string | null;
  created_at: string;
  updated_at: string;
};

type RequestInsert = {
  id?: string;
  user_id: string;
  type: RequestType;
  date: string;
  reason: string;
  hr_approval?: ApprovalStatus;
  hr_approved_by?: string | null;
  hr_approved_at?: string | null;
  section_head_approval?: ApprovalStatus;
  section_head_approved_by?: string | null;
  section_head_approved_at?: string | null;
  document_path?: string | null;
  created_at?: string;
  updated_at?: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  related_request_id: string | null;
  created_at: string;
};

type NotificationInsert = {
  id?: string;
  user_id: string;
  title: string;
  message: string;
  is_read?: boolean;
  related_request_id?: string | null;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
      sections: {
        Row: SectionRow;
        Insert: SectionInsert;
        Update: Partial<SectionInsert>;
        Relationships: [];
      };
      teams: {
        Row: TeamRow;
        Insert: TeamInsert;
        Update: Partial<TeamInsert>;
        Relationships: [
          {
            foreignKeyName: "teams_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance: {
        Row: AttendanceRow;
        Insert: AttendanceInsert;
        Update: Partial<AttendanceInsert>;
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      requests: {
        Row: RequestRow;
        Insert: RequestInsert;
        Update: Partial<RequestInsert>;
        Relationships: [
          {
            foreignKeyName: "requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requests_hr_approved_by_fkey";
            columns: ["hr_approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requests_section_head_approved_by_fkey";
            columns: ["section_head_approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: Partial<NotificationInsert>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      attendance_status: AttendanceStatus;
      request_type: RequestType;
      approval_status: ApprovalStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
