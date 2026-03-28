import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { ResourcePage } from "@/components/resources/resource-page";

export default function UsersPage() {
  return (
    <AuthGuard>
      <AppShell title="Users">
        <ResourcePage
          title="user"
          description="Manage user accounts and access roles for the demo workspace."
          resourcePath="/users"
          fields={[
            { name: "full_name", label: "Full Name", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Password", type: "password", required: true },
            {
              name: "role",
              label: "Role",
              type: "select",
              required: true,
              options: [
                { label: "Admin", value: "admin" },
                { label: "Manager", value: "manager" },
                { label: "Employee", value: "employee" }
              ]
            },
            { name: "is_active", label: "Active", type: "checkbox" }
          ]}
        />
      </AppShell>
    </AuthGuard>
  );
}
