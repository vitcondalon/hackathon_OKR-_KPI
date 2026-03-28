import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { ResourcePage } from "@/components/resources/resource-page";

export default function ObjectivesPage() {
  return (
    <AuthGuard>
      <AppShell title="Objectives">
        <ResourcePage
          title="objective"
          description="Create and manage business objectives with owner, cycle, status, and progress."
          resourcePath="/objectives"
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: [
                { label: "Draft", value: "draft" },
                { label: "Active", value: "active" },
                { label: "Completed", value: "completed" },
                { label: "On Track", value: "on_track" },
                { label: "At Risk", value: "at_risk" }
              ]
            },
            { name: "progress", label: "Progress", type: "number", required: true },
            {
              name: "owner_id",
              label: "Owner",
              type: "select",
              required: true,
              optionResource: { path: "/users", labelField: "full_name", valueField: "id" }
            },
            {
              name: "cycle_id",
              label: "Cycle",
              type: "select",
              required: true,
              optionResource: { path: "/cycles", labelField: "name", valueField: "id" }
            }
          ]}
        />
      </AppShell>
    </AuthGuard>
  );
}
