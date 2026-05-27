"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertTeam, deleteTeam } from "@/actions/teams";
import { Loader2, Trash2, Save } from "lucide-react";
import type { Section, Team, Profile } from "@/types/app";

interface Props {
  team?: Team;
  sections: Section[];
  candidates: Profile[];
  defaultSectionId?: string;
}

export function TeamForm({ team, sections, candidates, defaultSectionId }: Props) {
  const tCommon = useTranslations("common");
  const tTeams = useTranslations("admin.teams");

  const [name, setName] = useState(team?.name ?? "");
  const [sectionId, setSectionId] = useState(
    team?.section_id ?? defaultSectionId ?? "",
  );
  const [leaderId, setLeaderId] = useState(team?.team_leader_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      if (team?.id) fd.set("id", team.id);
      fd.set("name", name);
      fd.set("section_id", sectionId);
      if (leaderId) fd.set("team_leader_id", leaderId);
      const result = await upsertTeam(fd);
      if (result?.error) setError(result.error);
    });
  }

  function remove() {
    if (!team?.id) return;
    if (!confirm(tTeams("deleteConfirm", { name: team.name }))) return;
    startDelete(async () => {
      const fd = new FormData();
      fd.set("id", team.id);
      const result = await deleteTeam(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{tTeams("name")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{tTeams("section")}</Label>
          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger>
              <SelectValue placeholder={tTeams("selectSection")} />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{tTeams("leader")}</Label>
          <Select value={leaderId} onValueChange={setLeaderId}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error ? (
        <p className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button onClick={save} disabled={isPending} size="sm">
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {tCommon("save")}
        </Button>
        {team?.id ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={remove}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {tCommon("delete")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
