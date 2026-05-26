import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";
import { SectionForm } from "@/components/admin/SectionForm";
import type { Profile } from "@/types/app";

export const metadata = { title: "Admin · Sections" };
export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  const profile = await getCurrentProfile();
  if (!isAdmin(profile?.role)) redirect("/");

  const supabase = await createClient();
  const [{ data: sections }, { data: profiles }] = await Promise.all([
    supabase.from("sections").select("*").order("name"),
    supabase
      .from("profiles")
      .select("*")
      .in("role", ["section_head", "admin"])
      .order("full_name"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin · Sections</h1>
        <p className="text-sm text-muted-foreground">
          Manage organizational sections and their Section Heads.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">New section</h2>
        <SectionForm candidates={(profiles ?? []) as Profile[]} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Existing sections</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {(sections ?? []).map((s) => (
            <SectionForm
              key={s.id}
              section={s}
              candidates={(profiles ?? []) as Profile[]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
