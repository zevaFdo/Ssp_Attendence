import type { UserRole } from "@/types/app";

export function hasMasterView(role: UserRole | null | undefined) {
  if (!role) return false;
  return (
    role === "admin" ||
    role === "hr_supervisor" ||
    role === "section_head" ||
    role === "team_leader"
  );
}

export function isAdmin(role: UserRole | null | undefined) {
  return role === "admin";
}

export function canRegisterEmployees(role: UserRole | null | undefined) {
  return role === "admin" || role === "hr_supervisor" || role === "section_head";
}

export function canApproveAsHR(role: UserRole | null | undefined) {
  return role === "admin" || role === "hr_supervisor";
}

export function canApproveAsSectionHead(role: UserRole | null | undefined) {
  return role === "admin" || role === "section_head";
}

export function canManageTeam(role: UserRole | null | undefined) {
  return role === "team_leader" || role === "admin";
}
