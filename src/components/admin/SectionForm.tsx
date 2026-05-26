"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertSection, deleteSection } from "@/actions/sections";
import { Loader2, Trash2, Save } from "lucide-react";
import type { Section, Profile } from "@/types/app";

interface Props {
  section?: Section;
  candidates: Profile[];
}

export function SectionForm({ section, candidates }: Props) {
  const [name, setName] = useState(section?.name ?? "");
  const [description, setDescription] = useState(section?.description ?? "");
  const [headId, setHeadId] = useState(section?.section_head_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      if (section?.id) fd.set("id", section.id);
      fd.set("name", name);
      fd.set("description", description);
      if (headId) fd.set("section_head_id", headId);
      const result = await upsertSection(fd);
      if (result?.error) setError(result.error);
    });
  }

  function remove() {
    if (!section?.id) return;
    if (!confirm(`Delete section "${section.name}"? Teams will be removed.`))
      return;
    startDelete(async () => {
      const fd = new FormData();
      fd.set("id", section.id);
      const result = await deleteSection(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Section Head</Label>
          <Select value={headId} onValueChange={setHeadId}>
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
      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Textarea
          rows={2}
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
        />
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
          Save
        </Button>
        {section?.id ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={remove}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}
