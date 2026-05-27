"use client";

import { useTranslations } from "next-intl";
import type { Profile, Section, Team } from "@/types/app";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

interface Props {
  employees: Profile[];
  sections: Section[];
  teams: Team[];
}

export function EmployeeTable({ employees, sections, teams }: Props) {
  const t = useTranslations("employees.table");
  const tRoles = useTranslations("roles");

  const sectionMap = new Map(sections.map((s) => [s.id, s.name]));
  const teamMap = new Map(teams.map((t) => [t.id, t.name]));

  if (employees.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        {t("noEmployees")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("employee")}</th>
            <th className="px-4 py-3">{t("role")}</th>
            <th className="px-4 py-3">{t("section")}</th>
            <th className="px-4 py-3">{t("team")}</th>
            <th className="px-4 py-3">{t("status")}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {employees.map((e) => (
            <tr key={e.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {e.avatar_url ? (
                      <AvatarImage src={e.avatar_url} alt={e.full_name} />
                    ) : null}
                    <AvatarFallback>{initials(e.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline">{tRoles(e.role)}</Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {e.section_id ? (sectionMap.get(e.section_id) ?? "—") : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {e.team_id ? (teamMap.get(e.team_id) ?? "—") : "—"}
              </td>
              <td className="px-4 py-3">
                {e.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-600/20">
                    {t("active")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-500/20">
                    {t("inactive")}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
