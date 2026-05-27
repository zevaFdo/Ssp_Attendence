import {
  Briefcase,
  Home,
  Users,
  Coffee,
  Car,
  LogOut,
  Clock,
  Palmtree,
  MinusCircle,
  type LucideIcon,
} from "lucide-react";
import type { AttendanceStatus, ApprovalStatus } from "@/types/app";

/**
 * Color tokens (Tailwind utility classes) for the status badge container.
 * One entry per AttendanceStatus value, including the legacy `absent`
 * (kept as a synthetic UI fallback for employees with no row today).
 */
export const ATTENDANCE_STATUS_CLASSES: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  wfh: "bg-sky-100 text-sky-800 ring-sky-600/20",
  meeting: "bg-violet-100 text-violet-800 ring-violet-600/20",
  break: "bg-teal-100 text-teal-800 ring-teal-600/20",
  out_of_office: "bg-orange-100 text-orange-800 ring-orange-600/20",
  clocked_out: "bg-rose-100 text-rose-800 ring-rose-600/20",
  late: "bg-amber-100 text-amber-800 ring-amber-600/20",
  on_leave: "bg-slate-100 text-slate-700 ring-slate-500/20",
  absent: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
};

/**
 * Solid color tokens used for the small status dot inside the badge.
 */
export const ATTENDANCE_STATUS_DOT_CLASSES: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  wfh: "bg-sky-500",
  meeting: "bg-violet-500",
  break: "bg-teal-500",
  out_of_office: "bg-orange-500",
  clocked_out: "bg-rose-500",
  late: "bg-amber-500",
  on_leave: "bg-slate-500",
  absent: "bg-zinc-400",
};

export const APPROVAL_STATUS_CLASSES: Record<ApprovalStatus, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-600/20",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  rejected: "bg-rose-100 text-rose-800 ring-rose-600/20",
};

/**
 * Canonical ordering used by the Daily Status Board filter row, the
 * team-leader override select and any other "all statuses" iteration.
 * Includes the legacy `absent` synthetic value at the end.
 */
export const ATTENDANCE_STATUS_VALUES: AttendanceStatus[] = [
  "present",
  "wfh",
  "meeting",
  "break",
  "out_of_office",
  "clocked_out",
  "late",
  "on_leave",
  "absent",
];

export const APPROVAL_STATUS_VALUES: ApprovalStatus[] = [
  "pending",
  "approved",
  "rejected",
];

/**
 * Statuses an employee can self-set from the ClockInOutCard switcher.
 * `absent` is excluded (it is derived/synthetic, never user-clicked).
 * Order matches the horizontal tile grid shown to the user.
 */
export type EmployeeStatus = Exclude<AttendanceStatus, "absent">;

export interface EmployeeStatusButton {
  key: EmployeeStatus;
  Icon: LucideIcon;
  tileClass: string;
}

/**
 * Vivid tile colors for the switcher grid, mirroring the green/orange/
 * teal/red palette of the reference Japanese groupware UI.
 */
export const EMPLOYEE_STATUS_BUTTONS: EmployeeStatusButton[] = [
  {
    key: "present",
    Icon: Briefcase,
    tileClass:
      "bg-emerald-500 text-white ring-emerald-600 hover:bg-emerald-600",
  },
  {
    key: "wfh",
    Icon: Home,
    tileClass: "bg-sky-500 text-white ring-sky-600 hover:bg-sky-600",
  },
  {
    key: "meeting",
    Icon: Users,
    tileClass:
      "bg-violet-500 text-white ring-violet-600 hover:bg-violet-600",
  },
  {
    key: "break",
    Icon: Coffee,
    tileClass: "bg-teal-500 text-white ring-teal-600 hover:bg-teal-600",
  },
  {
    key: "out_of_office",
    Icon: Car,
    tileClass:
      "bg-orange-500 text-white ring-orange-600 hover:bg-orange-600",
  },
  {
    key: "clocked_out",
    Icon: LogOut,
    tileClass: "bg-rose-500 text-white ring-rose-600 hover:bg-rose-600",
  },
  {
    key: "late",
    Icon: Clock,
    tileClass:
      "bg-amber-500 text-white ring-amber-600 hover:bg-amber-600",
  },
  {
    key: "on_leave",
    Icon: Palmtree,
    tileClass:
      "bg-slate-500 text-white ring-slate-600 hover:bg-slate-600",
  },
];

export const EMPLOYEE_STATUS_VALUES: EmployeeStatus[] =
  EMPLOYEE_STATUS_BUTTONS.map((b) => b.key);

/**
 * Icon for every AttendanceStatus (including the synthetic `absent`).
 * Used by the full-tile StatusCard on the Daily Status Board.
 */
export const ATTENDANCE_STATUS_ICONS: Record<AttendanceStatus, LucideIcon> = {
  present: Briefcase,
  wfh: Home,
  meeting: Users,
  break: Coffee,
  out_of_office: Car,
  clocked_out: LogOut,
  late: Clock,
  on_leave: Palmtree,
  absent: MinusCircle,
};

/**
 * Card-sized solid backgrounds for the Daily Status Board tiles.
 * Same palette as EMPLOYEE_STATUS_BUTTONS (so the switcher and the
 * board match perfectly) plus a muted zinc tile for `absent`.
 */
export const ATTENDANCE_STATUS_TILE_CLASSES: Record<AttendanceStatus, string> =
  {
    present: "bg-emerald-500 text-white",
    wfh: "bg-sky-500 text-white",
    meeting: "bg-violet-500 text-white",
    break: "bg-teal-500 text-white",
    out_of_office: "bg-orange-500 text-white",
    clocked_out: "bg-rose-500 text-white",
    late: "bg-amber-500 text-white",
    on_leave: "bg-slate-500 text-white",
    absent: "bg-zinc-200 text-zinc-700",
  };
