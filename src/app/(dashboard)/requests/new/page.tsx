import { RequestForm } from "@/components/requests/RequestForm";

export const metadata = { title: "New Request · Attendance Web" };

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Request</h1>
        <p className="text-sm text-muted-foreground">
          Submit a leave or late-arrival request. HR will be notified
          immediately, then your Section Head once HR approves.
        </p>
      </div>
      <RequestForm />
    </div>
  );
}
