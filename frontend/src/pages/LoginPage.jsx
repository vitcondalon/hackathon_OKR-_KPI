import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { guideApi } from '../api/guideApi';

const roleCards = [
  {
    title: 'Admin',
    text: 'See system-wide progress, departments that need attention, and top performers.'
  },
  {
    title: 'Manager',
    text: 'Focus on team risks, low progress objectives, and missing check-ins.'
  },
  {
    title: 'Employee',
    text: 'Land on your objectives, KPI progress, and the next actions that matter.'
  }
];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      <div className="grid w-full max-w-7xl gap-5 ui-page-enter xl:grid-cols-[1.1fr_0.9fr]">
        <section className="ui-surface overflow-hidden rounded-[2.2rem] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-700">OKR/KPI HR Management</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">A cleaner performance workspace for modern teams.</h1>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
            </button>
          </div>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600">
            Track objectives, key results, KPIs, and check-ins in one guided workspace. The new frontend is built to help each role see the right story immediately.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roleCards.map((item) => (
              <div key={item.title} className="rounded-[1.6rem] border border-slate-200 bg-white/90 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-brand-100 bg-brand-50/80 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Need a quick walkthrough?</p>
                <p className="mt-2 text-sm text-slate-700">Open the user guide to read online, then download PDF directly inside the guide page if needed.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={guideApi.viewUrl()} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Open guide
                </a>
              </div>
            </div>
          </div>
        </section>

        <Card title="Sign in" subtitle="Use your account credentials to enter the workspace" className="self-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">Email or username</span>
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="you@company.com" required />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
            </label>

            {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Enter workspace'}
            </Button>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Hackathon-friendly flow</p>
              <p className="mt-1 leading-relaxed">Sign in, land on the dashboard, then open Funny Assistant to show recommendations, insights, and role-based summaries.</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
