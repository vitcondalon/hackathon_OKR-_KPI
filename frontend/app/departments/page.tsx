import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { ResourcePage } from "@/components/resources/resource-page";

export default function DepartmentsPage() {
  return (
    <AuthGuard>
      <AppShell title="Departments">
        <ResourcePage
          title="department"
          description="Keep department records simple and ready for demo management flows."
          resourcePath="/departments"
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "description", label: "Description", type: "textarea" }
          ]}
        />
      </AppShell>
    </AuthGuard>
  );
}
