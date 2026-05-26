"use client";

import { useState, useTransition } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { inviteEmployee } from "@/actions/employees";
import type { Section, Team, UserRole } from "@/types/app";

interface Props {
  isAdmin: boolean;
  sections: Section[];
  teams: Team[];
}

export function InviteEmployeeForm({ isAdmin, sections, teams }: Props) {
  const [role, setRole] = useState<UserRole>("employee");
  const [sectionId, setSectionId] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTeams = teams.filter((t) =>
    sectionId ? t.section_id === sectionId : true,
  );

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    formData.set("role", role);
    if (sectionId) formData.set("section_id", sectionId);
    if (teamId) formData.set("team_id", teamId);
    startTransition(async () => {
      const result = await inviteEmployee(formData);
      if (result?.error) setError(result.error);
      else setSuccess("Invitation sent. The user will receive an email.");
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <h2 className="text-base font-semibold">Invite a new employee</h2>
            <p className="text-xs text-muted-foreground">
              They’ll receive a secure invite email and can set their password
              on first sign-in.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
              disabled={!isAdmin}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                {isAdmin ? (
                  <>
                    <SelectItem value="team_leader">Team Leader</SelectItem>
                    <SelectItem value="section_head">Section Head</SelectItem>
                    <SelectItem value="hr_supervisor">HR Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </>
                ) : null}
              </SelectContent>
            </Select>
            {!isAdmin ? (
              <p className="text-xs text-muted-foreground">
                Only admins can invite higher-level roles.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Section</Label>
            <Select
              value={sectionId}
              onValueChange={(v) => {
                setSectionId(v);
                setTeamId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a section..." />
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
          <div className="space-y-2 md:col-span-2">
            <Label>Team (optional)</Label>
            <Select
              value={teamId}
              onValueChange={setTeamId}
              disabled={!sectionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team..." />
              </SelectTrigger>
              <SelectContent>
                {filteredTeams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-600/20 md:col-span-2">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-600/20 md:col-span-2">
              {success}
            </p>
          ) : null}

          <div className="md:col-span-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Send invite
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
