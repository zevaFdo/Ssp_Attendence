import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils/format";
import { LogOut, Bell, Clock as ClockIcon } from "lucide-react";
import { signOut } from "@/actions/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { Profile } from "@/types/app";

interface TopbarProps {
  profile: Profile;
  unreadCount: number;
}

export async function Topbar({ profile, unreadCount }: TopbarProps) {
  const tCommon = await getTranslations("common");
  const tRoles = await getTranslations("roles");
  const tNotif = await getTranslations("notifications");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-card/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ClockIcon className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold">{tCommon("appName")}</p>
      </div>

      <div className="hidden md:block">
        <p className="text-sm text-muted-foreground">
          {tCommon.rich("welcomeBack", {
            name: profile.full_name,
            b: (chunks) => (
              <span className="font-medium text-foreground">{chunks}</span>
            ),
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher variant="compact" className="hidden sm:inline-flex" />

        <Link
          href="/notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          aria-label={tNotif("ariaLabel")}
        >
          <Bell className="h-5 w-5" />
          <NotificationBell initialCount={unreadCount} />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
            <Avatar className="h-9 w-9">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              ) : null}
              <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{profile.full_name}</span>
                <span className="text-xs text-muted-foreground">
                  {profile.email}
                </span>
                <span className="mt-1 text-xs text-primary">
                  {tRoles(profile.role)}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {tCommon("signOut")}
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
