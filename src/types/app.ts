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

export interface Profile {
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
}

export interface Section {
  id: string;
  name: string;
  description: string | null;
  section_head_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  section_id: string;
  team_leader_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
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
}

export interface RequestRecord {
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
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  related_request_id: string | null;
  created_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  hr_supervisor: "HR Supervisor",
  section_head: "Section Head",
  team_leader: "Team Leader",
  employee: "Employee",
};
