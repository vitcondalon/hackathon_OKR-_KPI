import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { guideApi } from '../../api/guideApi';

const navigationSections = [
  {
    label: 'Tong quan',
    items: [
      { to: '/dashboard', label: 'Dashboard', caption: 'Tong quan va muc uu tien', roles: ['admin', 'manager', 'employee'] },
      { to: '/funny', label: 'Funny Assistant', caption: 'Khong gian tro ly', roles: ['admin', 'manager', 'employee'], featured: true },
      { to: '/profile', label: 'Ho so', caption: 'Thong tin tai khoan', roles: ['admin', 'manager', 'employee'] }
    ]
  },
  {
    label: 'Hieu suat',
    items: [
      { to: '/objectives', label: 'Objectives', caption: 'Lap muc tieu va theo doi tien do', roles: ['admin', 'manager', 'employee'] },
      { to: '/key-results', label: 'Key Results', caption: 'Do luong ket qua', roles: ['admin', 'manager', 'employee'] },
      { to: '/kpis', label: 'KPIs', caption: 'Chi so van hanh', roles: ['admin', 'manager', 'employee'] },
      { to: '/checkins', label: 'Check-ins', caption: 'Cap nhat va theo doi', roles: ['admin', 'manager', 'employee'] }
    ]
  },
  {
    label: 'He thong',
    items: [
      { to: '/departments', label: 'Phong ban', caption: 'Doi nhom va phu trach', roles: ['admin', 'manager'] },
      { to: '/cycles', label: 'Chu ky', caption: 'Khung thoi gian lap ke hoach', roles: ['admin', 'manager'] },
      { to: '/users', label: 'Nguoi dung', caption: 'Quan ly nhan su', roles: ['admin', 'manager'] }
    ]
  }
];
const SIDEBAR_SCROLL_KEY = 'okr_sidebar_scroll_top';

const routeMeta = {
  '/dashboard': {
    eyebrow: 'Tong quan',
    description: 'Khong gian theo vai tro de theo doi rui ro, hieu suat, va hanh dong uu tien.'
  },
  '/funny': {
    eyebrow: 'Tro ly',
    description: 'Dat cau hoi, nhan giai thich, va theo doi goi y theo ngu canh OKR/KPI.'
  },
  '/objectives': {
    eyebrow: 'Lap ke hoach',
    description: 'Tao va cap nhat objectives voi bo loc ro rang va theo doi tien trinh de hon.'
  },
  '/key-results': {
    eyebrow: 'Thuc thi',
    description: 'Theo doi ket qua do luong duoc va nam tien trinh hien tai trong mot man hinh.'
  },
  '/kpis': {
    eyebrow: 'Chi so',
    description: 'Theo doi KPI, nguoi phu trach, va trang thai trong mot giao dien van hanh.'
  },
  '/checkins': {
    eyebrow: 'Theo doi',
    description: 'Ghi nhan cap nhat nhanh va lam ro cac muc can xu ly tiep.'
  },
  '/departments': {
    eyebrow: 'Co cau',
    description: 'Quan ly phong ban, nguoi quan ly, va phan quyen phu trach.'
  },
  '/cycles': {
    eyebrow: 'Chu ky',
    description: 'Quan ly chu ky ke hoach va dong bo bao cao theo dung khung thoi gian.'
  },
  '/users': {
    eyebrow: 'Quan tri',
    description: 'Quan ly vai tro, quyen truy cap, va ho so nhan su ngay trong khong gian lam viec.'
  },
  '/profile': {
    eyebrow: 'Tai khoan',
    description: 'Thong tin dinh danh, vai tro truy cap, va boi canh khong gian hien tai cua ban.'
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

function NavSection({ section, isDark, onNavigate }) {
  return (
    <div>
      <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">{section.label}</p>
      <div className="space-y-1.5">
        {section.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            preventScrollReset
            className={({ isActive }) =>
              `group block rounded-[1.35rem] border px-3 py-3 transition ${
                isActive
                  ? 'border-brand-200 bg-brand-500 text-white shadow-[0_16px_34px_rgba(36,107,255,0.24)]'
                  : isDark
                    ? 'border-transparent bg-transparent text-slate-200 hover:border-slate-500/50 hover:bg-slate-800/70'
                    : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white/90'
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${isActive ? 'text-white' : isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.label}</p>
                  <p className={`mt-1 text-xs leading-relaxed ${isActive ? 'text-brand-50' : isDark ? 'text-slate-300' : 'text-slate-500'}`}>{item.caption}</p>
                </div>
                <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${isActive ? 'bg-white' : item.featured ? 'bg-brand-500' : isDark ? 'bg-slate-500' : 'bg-slate-300'}`} />
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
  const { theme, isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarScrollRef = useRef(null);

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
  const persistSidebarScroll = () => {
    const nav = sidebarScrollRef.current;
    if (!nav) return;
    window.sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(nav.scrollTop));
  };

  useEffect(() => {
    const nav = sidebarScrollRef.current;
    if (!nav) return;

    const saved = Number(window.sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || '0');
    if (Number.isFinite(saved) && saved > 0) {
      nav.scrollTop = saved;
    }

    const onScroll = () => persistSidebarScroll();

    nav.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      onScroll();
      nav.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const nav = sidebarScrollRef.current;
    if (!nav) return;
    const saved = Number(window.sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || '0');
    if (Number.isFinite(saved) && saved >= 0) {
      window.requestAnimationFrame(() => {
        nav.scrollTop = saved;
        window.requestAnimationFrame(() => {
          nav.scrollTop = saved;
        });
      });
    }
  }, [location.pathname]);

  return (
    <div className="ui-shell">
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="ui-surface flex flex-col rounded-[2rem] p-5 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
          <div className="ui-highlight rounded-[1.8rem] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-brand-700">OKR/KPI HR</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Khong gian hieu suat</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">He thong gon gang cho objectives, KPI tracking, check-ins, va cac buoc theo doi.</p>
          </div>

          <div ref={sidebarScrollRef} className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
            {sections.map((section) => (
              <NavSection key={section.label} section={section} isDark={isDark} onNavigate={persistSidebarScroll} />
            ))}
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
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-700">{eyebrow || meta.eyebrow || 'Khong gian'}</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-[2.4rem]">{title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{description || meta.description || 'Khong gian tap trung de ra quyet dinh nhanh va thuc thi gon gang.'}</p>
              </div>

              <div className="w-full space-y-3 xl:w-[340px]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                      {initials(user?.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{user?.full_name || 'Nguoi dung hien tai'}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email || user?.username || ''}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className={`status-badge ${roleTone(user?.role)}`}>{user?.role || 'employee'}</span>
                    <Link to="/profile" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                      Xem ho so
                    </Link>
                  </div>
                </div>

                <div className="flex w-full justify-center">
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(guideApi.viewUrl(), '_blank', 'noopener,noreferrer')}
                        className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        Mo huong dan
                      </button>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        {theme === 'dark' ? 'Dung che do sang' : 'Dung che do toi'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="ui-soft-hover rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Dang xuat
                    </button>
                  </div>
                </div>
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
