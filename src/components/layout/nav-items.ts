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
  /** Translation key under the `nav` namespace. */
  labelKey: string;
  /** Translation key under `nav.mobileLabels`, used by the mobile bottom nav. */
  mobileLabelKey?: string;
  icon: LucideIcon;
  allow?: UserRole[];
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    labelKey: "statusBoard",
    mobileLabelKey: "statusBoard",
    icon: Home,
    mobile: true,
  },
  {
    href: "/attendance",
    labelKey: "clockInOut",
    mobileLabelKey: "clockInOut",
    icon: Clock,
    mobile: true,
  },
  { href: "/attendance/history", labelKey: "attendance", icon: History },
  {
    href: "/requests",
    labelKey: "requests",
    mobileLabelKey: "requests",
    icon: FileText,
    mobile: true,
  },
  {
    href: "/approvals",
    labelKey: "approvals",
    icon: Inbox,
    allow: ["admin", "hr_supervisor", "section_head"],
  },
  {
    href: "/team",
    labelKey: "myTeam",
    icon: UsersRound,
    allow: ["team_leader", "admin"],
  },
  {
    href: "/employees",
    labelKey: "employees",
    icon: Users,
    allow: ["admin", "hr_supervisor", "section_head"],
  },
  {
    href: "/notifications",
    labelKey: "notifications",
    mobileLabelKey: "notifications",
    icon: Bell,
    mobile: true,
  },
  {
    href: "/admin/users",
    labelKey: "adminUsers",
    icon: Shield,
    allow: ["admin"],
  },
  {
    href: "/admin/sections",
    labelKey: "adminSections",
    icon: Building2,
    allow: ["admin"],
  },
  {
    href: "/admin/teams",
    labelKey: "adminTeams",
    icon: UsersRound,
    allow: ["admin"],
  },
];

export function visibleItems(role: UserRole | null | undefined) {
  return NAV_ITEMS.filter((it) => !it.allow || (role && it.allow.includes(role)));
}
