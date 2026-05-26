import { StatusCard, type StatusCardEmployee } from "./StatusCard";
import { StatusBoardRealtime } from "./StatusBoardRealtime";

interface StatusBoardProps {
  employees: StatusCardEmployee[];
}

export function StatusBoard({ employees }: StatusBoardProps) {
  if (employees.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No employees yet. An admin can add team members from the Admin → Users
        page.
      </div>
    );
  }

  const counts = employees.reduce(
    (acc, e) => {
      const key = e.status ?? "absent";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <StatusBoardRealtime />

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 ring-1 ring-emerald-600/20">
          Present {counts.present ?? 0}
        </span>
        <span className="rounded-md bg-sky-50 px-2 py-1 font-medium text-sky-700 ring-1 ring-sky-600/20">
          WFH {counts.wfh ?? 0}
        </span>
        <span className="rounded-md bg-orange-50 px-2 py-1 font-medium text-orange-700 ring-1 ring-orange-600/20">
          Late {counts.late ?? 0}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700 ring-1 ring-slate-500/20">
          On Leave {counts.on_leave ?? 0}
        </span>
        <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-700 ring-1 ring-zinc-500/20">
          Absent {counts.absent ?? 0}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {employees.map((e) => (
          <StatusCard key={e.id} employee={e} />
        ))}
      </div>
    </>
  );
}
