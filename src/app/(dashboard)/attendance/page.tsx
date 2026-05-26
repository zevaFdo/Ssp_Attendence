import Link from "next/link";
import { ClockInOutCard } from "@/components/attendance/ClockInOutCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils/date";
import { getCurrentProfile } from "@/lib/auth/session";
import { format, parseISO } from "date-fns";
import { History } from "lucide-react";

export const metadata = { title: "Attendance · Attendance Web" };

export default async function AttendancePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: today } = await supabase
    .from("attendance")
    .select("status, clock_in, clock_out")
    .eq("user_id", profile.id)
    .eq("date", todayISO())
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-sm text-muted-foreground">
          {format(parseISO(todayISO()), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <ClockInOutCard today={today ?? null} />

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="font-semibold">Need to review your records?</p>
            <p className="text-sm text-muted-foreground">
              See your full attendance history with date filters.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/attendance/history">
              <History className="h-4 w-4" />
              View history
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
