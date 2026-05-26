import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PWAInstallPrompt } from "@/components/layout/PWAInstallPrompt";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar role={profile.role} fullName={profile.full_name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={profile} unreadCount={count ?? 0} />
        <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-4 md:px-6 md:pb-8 md:pt-6">
          {children}
        </main>
        <MobileBottomNav />
        <PWAInstallPrompt />
      </div>
    </div>
  );
}
