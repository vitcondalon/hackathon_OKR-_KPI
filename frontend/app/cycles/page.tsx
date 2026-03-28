import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { ResourcePage } from "@/components/resources/resource-page";

export default function CyclesPage() {
  return (
    <AuthGuard>
      <AppShell title="Cycles">
        <ResourcePage
          title="cycle"
          description="Define OKR cycles with timeframe and current lifecycle status."
          resourcePath="/cycles"
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "start_date", label: "Start Date", type: "date", required: true },
            { name: "end_date", label: "End Date", type: "date", required: true },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: [
                { label: "Draft", value: "draft" },
                { label: "Active", value: "active" },
                { label: "Closed", value: "closed" }
              ]
            }
          ]}
        />
      </AppShell>
    </AuthGuard>
  );
}
