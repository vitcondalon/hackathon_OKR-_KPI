import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { ResourcePage } from "@/components/resources/resource-page";

export default function KeyResultsPage() {
  return (
    <AuthGuard>
      <AppShell title="Key Results">
        <ResourcePage
          title="key result"
          description="Track measurable outcomes for each objective with baseline and target values."
          resourcePath="/key-results"
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "metric_type", label: "Metric Type" },
            { name: "start_value", label: "Start Value", type: "number", required: true },
            { name: "target_value", label: "Target Value", type: "number", required: true },
            { name: "current_value", label: "Current Value", type: "number", required: true },
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: [
                { label: "Draft", value: "draft" },
                { label: "Active", value: "active" },
                { label: "Completed", value: "completed" },
                { label: "At Risk", value: "at_risk" }
              ]
            },
            {
              name: "objective_id",
              label: "Objective",
              type: "select",
              required: true,
              optionResource: { path: "/objectives", labelField: "title", valueField: "id" }
            }
          ]}
        />
      </AppShell>
    </AuthGuard>
  );
}
