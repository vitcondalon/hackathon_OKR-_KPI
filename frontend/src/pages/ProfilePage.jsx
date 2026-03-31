import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  const profileItems = [
    { label: 'Full name', value: user?.full_name },
    { label: 'Username', value: user?.username },
    { label: 'Email', value: user?.email },
    { label: 'Role', value: user?.role },
    { label: 'Department', value: user?.department_name || user?.department_id || '-' },
    { label: 'Employee code', value: user?.employee_code || '-' }
  ];

  return (
    <AppLayout title="Profile" description="A quick view of your identity, current access level, and workspace context.">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Current account" subtitle="Authenticated user profile">
          <div className="grid gap-3 sm:grid-cols-2">
            {profileItems.map((item) => (
              <div key={item.label} className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.value || '-'}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Workspace note" subtitle="How this account experience is tailored">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-[1.4rem] border border-brand-100 bg-brand-50/80 p-4">
              The navigation, dashboard summary, and Funny recommendations are role-aware, so this profile directly affects what you see first.
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
              Open the dashboard to review your starting view, then launch Funny Assistant for role-specific recommendations and explainers.
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
