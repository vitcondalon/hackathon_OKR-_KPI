import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell title="Dashboard">
        <DashboardOverview />
      </AppShell>
    </AuthGuard>
  );
}
