import {
  Home,
  Clock,
  History,
  FileText,
  Inbox,
  Users,
  Building2,
  UsersRound,
  Bell,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/app";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  allow?: UserRole[];
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Status Board", icon: Home, mobile: true },
  { href: "/attendance", label: "Clock In/Out", icon: Clock, mobile: true },
  { href: "/attendance/history", label: "Attendance", icon: History },
  { href: "/requests", label: "Requests", icon: FileText, mobile: true },
  {
    href: "/approvals",
    label: "Approvals",
    icon: Inbox,
    allow: ["admin", "hr_supervisor", "section_head"],
  },
  {
    href: "/team",
    label: "My Team",
    icon: UsersRound,
    allow: ["team_leader", "admin"],
  },
  {
    href: "/employees",
    label: "Employees",
    icon: Users,
    allow: ["admin", "hr_supervisor", "section_head"],
  },
  { href: "/notifications", label: "Notifications", icon: Bell, mobile: true },
  {
    href: "/admin/users",
    label: "Admin · Users",
    icon: Shield,
    allow: ["admin"],
  },
  {
    href: "/admin/sections",
    label: "Admin · Sections",
    icon: Building2,
    allow: ["admin"],
  },
  {
    href: "/admin/teams",
    label: "Admin · Teams",
    icon: UsersRound,
    allow: ["admin"],
  },
];

export function visibleItems(role: UserRole | null | undefined) {
  return NAV_ITEMS.filter((it) => !it.allow || (role && it.allow.includes(role)));
}
