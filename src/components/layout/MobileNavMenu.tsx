"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { visibleItems } from "./nav-items";
import type { UserRole } from "@/types/app";

interface Props {
  role: UserRole;
}

/** モバイル: サイドバー非表示時の追加ナビ（休日・従業員など） */
export function MobileNavMenu({ role }: Props) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const items = visibleItems(role).filter((it) => !it.mobile);

  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 md:hidden"
          aria-label={tNav("openMenu")}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className={active ? "bg-accent font-medium" : undefined}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tNav(item.labelKey)}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
