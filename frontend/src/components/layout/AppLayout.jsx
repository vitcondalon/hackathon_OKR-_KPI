import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Users' },
  { to: '/departments', label: 'Departments' },
  { to: '/cycles', label: 'Cycles' },
  { to: '/objectives', label: 'Objectives' },
  { to: '/key-results', label: 'Key Results' },
  { to: '/checkins', label: 'Check-ins' },
  { to: '/kpis', label: 'KPIs' },
  { to: '/funny', label: 'Funny AI' },
  { to: '/profile', label: 'Profile' }
];

export default function AppLayout({ title, children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="ui-shell">
      <div className="mx-auto flex w-full max-w-[1440px] gap-4 xl:gap-6">
        <aside className="ui-surface hidden w-72 shrink-0 rounded-3xl p-5 lg:block">
          <div className="rounded-2xl border border-brand-100 bg-brand-50/80 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-700">Enterprise Platform</p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">OKR/KPI Management</h1>
            <p className="mt-1 text-sm text-slate-600">Performance management system for teams and departments</p>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `ui-soft-hover flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                    isActive
                      ? 'border-brand-200 bg-brand-500 text-white shadow-[0_8px_18px_rgba(36,107,255,0.3)]'
                      : 'border-transparent bg-white text-slate-700 hover:border-brand-100 hover:bg-brand-50 hover:text-brand-700'
                  }`
                }
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Signed in</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{user?.full_name}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="ui-soft-hover mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1 ui-page-enter">
          <header className="ui-surface mb-5 rounded-3xl p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Workspace</p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-950 md:text-3xl">{title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="ui-soft-hover rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  Theme: {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm">
                  <p className="font-semibold text-slate-900">{user?.full_name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{user?.role}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg border px-2 py-2 text-center text-[11px] font-semibold ${
                      isActive
                        ? 'border-brand-200 bg-brand-500 text-white'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
