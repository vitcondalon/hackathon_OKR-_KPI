import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { ResourcePage } from "@/components/resources/resource-page";

export default function CheckinsPage() {
  return (
    <AuthGuard>
      <AppShell title="Check-ins">
        <ResourcePage
          title="check-in"
          description="Record incremental updates against key results with progress notes and values."
          resourcePath="/checkins"
          fields={[
            {
              name: "key_result_id",
              label: "Key Result",
              type: "select",
              required: true,
              optionResource: { path: "/key-results", labelField: "title", valueField: "id" }
            },
            { name: "value", label: "Value", type: "number" },
            { name: "progress", label: "Progress", type: "number" },
            { name: "note", label: "Note", type: "textarea" },
            { name: "checkin_date", label: "Check-in Date", type: "date" }
          ]}
        />
      </AppShell>
    </AuthGuard>
  );
}
