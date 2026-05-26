"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils/format";
import { updateEmployee } from "@/actions/employees";
import { Loader2, Save } from "lucide-react";
import type { Profile, Section, Team, UserRole } from "@/types/app";

interface Props {
  profile: Profile;
  sections: Section[];
  teams: Team[];
}

export function UserRow({ profile, sections, teams }: Props) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [role, setRole] = useState<UserRole>(profile.role);
  const [sectionId, setSectionId] = useState(profile.section_id ?? "");
  const [teamId, setTeamId] = useState(profile.team_id ?? "");
  const [isActive, setIsActive] = useState(profile.is_active);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredTeams = teams.filter((t) =>
    sectionId ? t.section_id === sectionId : true,
  );

  function save() {
    setError(null);
    setOk(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", profile.id);
      fd.set("full_name", fullName);
      fd.set("role", role);
      if (sectionId) fd.set("section_id", sectionId);
      if (teamId) fd.set("team_id", teamId);
      if (isActive) fd.set("is_active", "on");
      const result = await updateEmployee(fd);
      if (result?.error) setError(result.error);
      else setOk(true);
    });
  }

  return (
    <tr>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            ) : null}
            <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-8 max-w-[180px]"
            />
            <p className="mt-0.5 text-xs text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger className="h-8 max-w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="hr_supervisor">HR Supervisor</SelectItem>
            <SelectItem value="section_head">Section Head</SelectItem>
            <SelectItem value="team_leader">Team Leader</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-3">
        <Select
          value={sectionId}
          onValueChange={(v) => {
            setSectionId(v);
            setTeamId("");
          }}
        >
          <SelectTrigger className="h-8 max-w-[160px]">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-3">
        <Select value={teamId} onValueChange={setTeamId} disabled={!sectionId}>
          <SelectTrigger className="h-8 max-w-[160px]">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {filteredTeams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4"
          />
          Active
        </label>
      </td>
      <td className="px-3 py-3">
        <Button size="sm" onClick={save} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save
        </Button>
        {error ? (
          <p className="mt-1 text-xs text-rose-700">{error}</p>
        ) : ok ? (
          <p className="mt-1 text-xs text-emerald-700">Saved</p>
        ) : null}
      </td>
    </tr>
  );
}
