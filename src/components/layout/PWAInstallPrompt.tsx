"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "aw_pwa_dismissed_at";
const DISMISS_DAYS = 7;

export function PWAInstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (dismissed && Date.now() - dismissed < DISMISS_DAYS * 86_400_000) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!evt) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setEvt(null);
  }

  async function install() {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setEvt(null);
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-40 flex w-[min(420px,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-3 rounded-xl border bg-card p-3 shadow-lg md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Install Attendance Web</p>
        <p className="text-xs text-muted-foreground">
          Get one-tap access from your home screen.
        </p>
      </div>
      <Button size="sm" onClick={install}>
        <Download className="h-4 w-4" />
        Install
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={dismiss}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
