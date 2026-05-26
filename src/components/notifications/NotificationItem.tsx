"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markRead } from "@/actions/notifications";
import { relativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_request_id: string | null;
}

export function NotificationItem(props: Props) {
  const [isPending, startTransition] = useTransition();

  function onRead() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", props.id);
      await markRead(fd);
    });
  }

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-4 transition",
        !props.is_read && "border-primary/30 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
          props.is_read ? "bg-zinc-300" : "bg-primary",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{props.title}</p>
        <p className="text-sm text-muted-foreground">{props.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {relativeTime(props.created_at)}
        </p>
        {props.related_request_id ? (
          <Link
            href={`/requests/${props.related_request_id}`}
            className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
          >
            Open request →
          </Link>
        ) : null}
      </div>
      {!props.is_read ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRead}
          disabled={isPending}
          aria-label="Mark as read"
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : null}
    </li>
  );
}
