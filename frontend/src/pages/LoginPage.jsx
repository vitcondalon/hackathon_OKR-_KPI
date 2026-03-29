import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(identifier, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ui-shell flex items-center justify-center">
      <div className="grid w-full max-w-6xl gap-5 lg:grid-cols-[1.05fr_0.95fr] ui-page-enter">
        <section className="ui-surface rounded-3xl p-8 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">OKR/KPI PLATFORM</p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-950 lg:text-5xl">
            OKR/KPI management platform for people and departments.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600">
            Manage goals, progress, and performance in one unified operational workspace.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Access</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Secure Authentication</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Data</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">PostgreSQL</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Focus</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Operational Performance</p>
            </div>
          </div>
        </section>

        <Card title="Sign in" subtitle="Enter your account credentials" className="self-center">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-slate-700">Email or Username</span>
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@company.com" required />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-slate-700">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required />
            </label>
            {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
