import type { AttendanceStatus, ApprovalStatus } from "@/types/app";

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  wfh: "WFH",
  on_leave: "On Leave",
};

/**
 * Color tokens (Tailwind utility classes) for the status badge.
 * Mirrors the brief: Green / Blue / Grey / Orange.
 */
export const ATTENDANCE_STATUS_CLASSES: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  late: "bg-orange-100 text-orange-800 ring-orange-600/20",
  absent: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  wfh: "bg-sky-100 text-sky-800 ring-sky-600/20",
  on_leave: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const APPROVAL_STATUS_CLASSES: Record<ApprovalStatus, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-600/20",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  rejected: "bg-rose-100 text-rose-800 ring-rose-600/20",
};
