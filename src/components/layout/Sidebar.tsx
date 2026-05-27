"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { visibleItems } from "./nav-items";
import type { UserRole } from "@/types/app";
import { Clock } from "lucide-react";

interface SidebarProps {
  role: UserRole;
  fullName: string;
}

export function Sidebar({ role, fullName }: SidebarProps) {
  const pathname = usePathname();
  const items = visibleItems(role);
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tRoles = useTranslations("roles");

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">
            {tCommon("appName")}
          </p>
          <p className="text-xs text-muted-foreground">{tRoles(role)}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tNav(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        {tCommon("signedInAs")}{" "}
        <span className="font-medium text-foreground">{fullName}</span>
      </div>
    </aside>
  );
}
