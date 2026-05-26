"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { hrDecide, sectionHeadDecide } from "@/actions/approvals";
import { Check, X, Loader2 } from "lucide-react";

interface Props {
  requestId: string;
  stage: "hr" | "section_head";
  disabled?: boolean;
}

export function ApprovalActions({ requestId, stage, disabled }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function decide(decision: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("requestId", requestId);
      fd.set("decision", decision);
      const action = stage === "hr" ? hrDecide : sectionHeadDecide;
      const result = await action(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          onClick={() => decide("approved")}
          disabled={disabled || isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Approve
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => decide("rejected")}
          disabled={disabled || isPending}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>
      {error ? (
        <p className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
