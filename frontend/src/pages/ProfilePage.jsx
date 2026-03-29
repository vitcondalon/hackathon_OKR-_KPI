import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AppLayout title="Profile">
      <Card title="Current User" subtitle="Authenticated account details" className="max-w-3xl">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-semibold">Full name:</span> {user?.full_name}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-semibold">Username:</span> {user?.username}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-semibold">Email:</span> {user?.email}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-semibold">Role:</span> {user?.role}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2"><span className="font-semibold">Department ID:</span> {user?.department_id ?? '-'}</div>
        </div>
      </Card>
    </AppLayout>
  );
}
