"use client";

import { useRealtimeAttendance } from "@/hooks/useRealtimeStatus";

export function StatusBoardRealtime() {
  useRealtimeAttendance();
  return null;
}
