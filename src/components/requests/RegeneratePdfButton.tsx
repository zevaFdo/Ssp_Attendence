"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, RefreshCw } from "lucide-react";
import { regeneratePdf } from "@/actions/approvals";
import { Button } from "@/components/ui/button";

interface Props {
  requestId: string;
}

export function RegeneratePdfButton({ requestId }: Props) {
  const t = useTranslations("requests.detail");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function retry() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("requestId", requestId);
      const result = await regeneratePdf(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setMessage(t("regenerateSuccess"));
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 text-right">
      <Button onClick={retry} disabled={isPending} size="sm">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {t("regeneratePdf")}
      </Button>
      {message ? (
        <p className="text-xs text-emerald-800">{message}</p>
      ) : null}
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
