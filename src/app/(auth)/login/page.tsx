import { LoginForm } from "./LoginForm";
import { Clock } from "lucide-react";

export const metadata = { title: "Sign in · Attendance Web" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your Attendance Web account
        </p>
      </div>
      <LoginForm next={next} />
    </div>
  );
}
