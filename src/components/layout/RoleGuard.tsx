import type { UserRole } from "@/types/app";

interface RoleGuardProps {
  role: UserRole | null | undefined;
  allow: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  role,
  allow,
  children,
  fallback = null,
}: RoleGuardProps) {
  if (!role || !allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
