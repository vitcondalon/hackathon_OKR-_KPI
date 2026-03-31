import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { guideApi } from '../../api/guideApi';

const navigationSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', caption: 'Overview and priorities', roles: ['admin', 'manager', 'employee'] },
      { to: '/funny', label: 'Funny Assistant', caption: 'Assistant workspace', roles: ['admin', 'manager', 'employee'], featured: true },
      { to: '/profile', label: 'Profile', caption: 'Account details', roles: ['admin', 'manager', 'employee'] }
    ]
  },
  {
    label: 'Performance',
    items: [
      { to: '/objectives', label: 'Objectives', caption: 'Goal planning and progress', roles: ['admin', 'manager', 'employee'] },
      { to: '/key-results', label: 'Key Results', caption: 'Measure outcomes', roles: ['admin', 'manager', 'employee'] },
      { to: '/kpis', label: 'KPIs', caption: 'Operational metrics', roles: ['admin', 'manager', 'employee'] },
      { to: '/checkins', label: 'Check-ins', caption: 'Updates and follow-ups', roles: ['admin', 'manager', 'employee'] }
    ]
  },
  {
    label: 'Workspace',
    items: [
      { to: '/departments', label: 'Departments', caption: 'Teams and ownership', roles: ['admin', 'manager', 'employee'] },
      { to: '/cycles', label: 'Cycles', caption: 'Planning windows', roles: ['admin', 'manager', 'employee'] },
      { to: '/users', label: 'Users', caption: 'People management', roles: ['admin', 'manager'] }
    ]
  }
];

const routeMeta = {
  '/dashboard': {
    eyebrow: 'Overview',
    description: 'A role-aware workspace for risk signals, performance, and your next best actions.'
  },
  '/funny': {
    eyebrow: 'Assistant',
    description: 'Ask, explain, and follow through with contextual OKR/KPI guidance.'
  },
  '/objectives': {
    eyebrow: 'Planning',
    description: 'Create and maintain objectives with cleaner scanning, filters, and progress context.'
  },
  '/key-results': {
    eyebrow: 'Execution',
    description: 'Track measurable outcomes and keep delivery moving with current progress at a glance.'
  },
  '/kpis': {
    eyebrow: 'Metrics',
    description: 'Watch KPI performance, ownership, and status in one operational view.'
  },
  '/checkins': {
    eyebrow: 'Follow-up',
    description: 'Capture updates quickly and surface what still needs attention.'
  },
  '/departments': {
    eyebrow: 'Structure',
    description: 'Organize departments, managers, and operating ownership.'
  },
  '/cycles': {
    eyebrow: 'Cadence',
    description: 'Manage planning cycles and keep reporting aligned to the right window.'
  },
  '/users': {
    eyebrow: 'Administration',
    description: 'Manage roles, access, and people records without leaving the workspace.'
  },
  '/profile': {
    eyebrow: 'Account',
    description: 'Your identity, access role, and current workspace context.'
  }
};

function initials(name) {
  return String(name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function buildBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return [{ label: 'Dashboard', to: '/dashboard' }];
  }

  return parts.map((segment, index) => {
    const to = `/${parts.slice(0, index + 1).join('/')}`;
    const label = segment
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return { label, to };
  });
}

function roleTone(role) {
  if (role === 'admin') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (role === 'manager') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-sky-200 bg-sky-50 text-sky-700';
}

function NavSection({ section }) {
  return (
    <div>
      <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">{section.label}</p>
      <div className="space-y-1.5">
        {section.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group block rounded-[1.35rem] border px-3 py-3 transition ${
                isActive
                  ? 'border-brand-200 bg-brand-500 text-white shadow-[0_16px_34px_rgba(36,107,255,0.24)]'
                  : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white/90'
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-900'}`}>{item.label}</p>
                  <p className={`mt-1 text-xs leading-relaxed ${isActive ? 'text-brand-50' : 'text-slate-500'}`}>{item.caption}</p>
                </div>
                <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${isActive ? 'bg-white' : item.featured ? 'bg-brand-500' : 'bg-slate-300'}`} />
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function AppLayout({ title, description, eyebrow, actions, children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbs = useMemo(() => buildBreadcrumbs(location.pathname), [location.pathname]);
  const meta = routeMeta[location.pathname] || {};
  const sections = useMemo(
    () =>
      navigationSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.roles.includes(user?.role || 'employee'))
        }))
        .filter((section) => section.items.length > 0),
    [user?.role]
  );

  return (
    <div className="ui-shell">
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="ui-surface flex flex-col rounded-[2rem] p-5 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
          <div className="ui-highlight rounded-[1.8rem] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-brand-700">OKR/KPI HR</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Performance Workspace</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">A cleaner operating system for objectives, KPI tracking, check-ins, and guided follow-up.</p>
          </div>

          <div className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
            {sections.map((section) => (
              <NavSection key={section.label} section={section} />
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                  {initials(user?.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user?.full_name || 'Current user'}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email || user?.username || ''}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className={`status-badge ${roleTone(user?.role)}`}>{user?.role || 'employee'}</span>
                <Link to="/profile" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                  View profile
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-900 p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Need help?</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-100">Open the user guide to read, then use the download button inside the guide page if needed.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={guideApi.viewUrl()} target="_blank" rel="noreferrer" className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900">
                  Open guide
                </a>
                <Link to="/funny" className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white">
                  Ask Funny
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-5 ui-page-enter">
          <header className="ui-surface rounded-[2rem] p-5 md:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {breadcrumbs.map((item, index) => (
                    <span key={item.to} className="flex items-center gap-2">
                      {index > 0 ? <span className="text-slate-300">/</span> : null}
                      {index === breadcrumbs.length - 1 ? (
                        <span className="font-semibold text-slate-500">{item.label}</span>
                      ) : (
                        <Link to={item.to} className="font-semibold text-slate-400 hover:text-brand-700">
                          {item.label}
                        </Link>
                      )}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-700">{eyebrow || meta.eyebrow || 'Workspace'}</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-[2.4rem]">{title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{description || meta.description || 'A focused workspace designed for fast decision-making and clean execution.'}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(guideApi.viewUrl(), '_blank', 'noopener,noreferrer')}
                  className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Open guide
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="ui-soft-hover rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-1 xl:hidden">
              {sections.flatMap((section) => section.items).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
                      isActive
                        ? 'border-brand-200 bg-brand-500 text-white'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {actions ? <div className="mt-5">{actions}</div> : null}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
