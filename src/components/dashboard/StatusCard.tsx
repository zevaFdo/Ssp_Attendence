import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { initials } from "@/lib/utils/format";
import { formatTime } from "@/lib/utils/date";
import type { AttendanceStatus } from "@/types/app";

export interface StatusCardEmployee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  section_name?: string | null;
  team_name?: string | null;
  status: AttendanceStatus | null;
  clock_in: string | null;
  clock_out: string | null;
}

interface StatusCardProps {
  employee: StatusCardEmployee;
}

export function StatusCard({ employee }: StatusCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm transition hover:shadow-md">
      <Avatar className="h-10 w-10">
        {employee.avatar_url ? (
          <AvatarImage src={employee.avatar_url} alt={employee.full_name} />
        ) : null}
        <AvatarFallback>{initials(employee.full_name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {employee.full_name}
          </p>
          <StatusBadge status={employee.status} />
        </div>

        <p className="truncate text-xs text-muted-foreground">
          {employee.section_name ?? "No section"}
          {employee.team_name ? ` · ${employee.team_name}` : ""}
        </p>

        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>
            In:{" "}
            <span className="font-medium text-foreground">
              {employee.clock_in ? formatTime(employee.clock_in) : "—"}
            </span>
          </span>
          <span>
            Out:{" "}
            <span className="font-medium text-foreground">
              {employee.clock_out ? formatTime(employee.clock_out) : "—"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
