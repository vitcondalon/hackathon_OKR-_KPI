import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { guideApi } from '../../api/guideApi';

const navigationSections = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/dashboard', label: 'Dashboard', caption: 'Tổng quan và mức ưu tiên', roles: ['admin', 'manager', 'employee'] },
      { to: '/funny', label: 'Funny Assistant', caption: 'Không gian trợ lý', roles: ['admin', 'manager', 'employee'], featured: true },
      { to: '/profile', label: 'Hồ sơ', caption: 'Thông tin tài khoản', roles: ['admin', 'manager', 'employee'] }
    ]
  },
  {
    label: 'Hiệu suất',
    items: [
      { to: '/objectives', label: 'Objectives', caption: 'Lập mục tiêu và theo dõi tiến độ', roles: ['admin', 'manager', 'employee'] },
      { to: '/key-results', label: 'Key Results', caption: 'Đo lường kết quả', roles: ['admin', 'manager', 'employee'] },
      { to: '/kpis', label: 'KPIs', caption: 'Chỉ số vận hành', roles: ['admin', 'manager', 'employee'] },
      { to: '/checkins', label: 'Check-ins', caption: 'Cập nhật và theo dõi', roles: ['admin', 'manager', 'employee'] }
    ]
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/departments', label: 'Phòng ban', caption: 'Đội nhóm và phụ trách', roles: ['admin', 'manager'] },
      { to: '/cycles', label: 'Chu kỳ', caption: 'Khung thời gian lập kế hoạch', roles: ['admin', 'manager'] },
      { to: '/users', label: 'Người dùng', caption: 'Quản lý nhân sự', roles: ['admin', 'manager'] }
    ]
  }
];

const SIDEBAR_SCROLL_KEY = 'okr_sidebar_scroll_top';

const routeMeta = {
  '/dashboard': { eyebrow: 'Tổng quan', description: 'Không gian theo vai trò để theo dõi rủi ro, hiệu suất và hành động ưu tiên.' },
  '/funny': { eyebrow: 'Trợ lý', description: 'Đặt câu hỏi, nhận giải thích và theo dõi gợi ý theo ngữ cảnh OKR/KPI.' },
  '/objectives': { eyebrow: 'Lập kế hoạch', description: 'Tạo và cập nhật objectives với bộ lọc rõ ràng và theo dõi tiến trình dễ hơn.' },
  '/key-results': { eyebrow: 'Thực thi', description: 'Theo dõi kết quả đo lường được và nắm tiến trình hiện tại trong một màn hình.' },
  '/kpis': { eyebrow: 'Chỉ số', description: 'Theo dõi KPI, người phụ trách và trạng thái trong một giao diện vận hành.' },
  '/checkins': { eyebrow: 'Theo dõi', description: 'Ghi nhận cập nhật nhanh và làm rõ các mục cần xử lý tiếp.' },
  '/departments': { eyebrow: 'Cơ cấu', description: 'Quản lý phòng ban, người quản lý và phân quyền phụ trách.' },
  '/cycles': { eyebrow: 'Chu kỳ', description: 'Quản lý chu kỳ kế hoạch và đồng bộ báo cáo theo đúng khung thời gian.' },
  '/users': { eyebrow: 'Quản trị', description: 'Quản lý vai trò, quyền truy cập và hồ sơ nhân sự ngay trong không gian làm việc.' },
  '/profile': { eyebrow: 'Tài khoản', description: 'Thông tin định danh, vai trò truy cập và bối cảnh không gian hiện tại của bạn.' }
};

function initials(name) {
  return String(name || 'User').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function buildBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [{ label: 'Dashboard', to: '/dashboard' }];
  return parts.map((segment, index) => {
    const to = `/${parts.slice(0, index + 1).join('/')}`;
    const label = segment.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    return { label, to };
  });
}

function roleTone(role) {
  if (role === 'admin') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (role === 'manager') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-sky-200 bg-sky-50 text-sky-700';
}

function roleLabel(role) {
  if (role === 'admin') return 'Quản trị viên';
  if (role === 'manager') return 'Quản lý';
  if (role === 'employee') return 'Nhân viên';
  return role || 'Người dùng';
}

function NavSection({ section, isDark, onNavigate }) {
  return (
    <div>
      <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">{section.label}</p>
      <div className="space-y-1.5">
        {section.items.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onNavigate} preventScrollReset className={({ isActive }) => `group block rounded-[1.35rem] border px-3 py-3 transition ${isActive ? 'border-brand-200 bg-brand-500 text-white shadow-[0_16px_34px_rgba(36,107,255,0.24)]' : isDark ? 'border-transparent bg-transparent text-slate-200 hover:border-slate-500/50 hover:bg-slate-800/70' : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white/90'}`}>
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
  const sections = useMemo(() => navigationSections.map((section) => ({ ...section, items: section.items.filter((item) => item.roles.includes(user?.role || 'employee')) })).filter((section) => section.items.length > 0), [user?.role]);

  const persistSidebarScroll = () => {
    const nav = sidebarScrollRef.current;
    if (!nav) return;
    window.sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(nav.scrollTop));
  };

  useEffect(() => {
    const nav = sidebarScrollRef.current;
    if (!nav) return;
    const saved = Number(window.sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || '0');
    if (Number.isFinite(saved) && saved > 0) nav.scrollTop = saved;
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
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Không gian hiệu suất</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Hệ thống gọn gàng cho objectives, KPI tracking, check-ins và các bước theo dõi.</p>
          </div>

          <div ref={sidebarScrollRef} className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
            {sections.map((section) => <NavSection key={section.label} section={section} isDark={isDark} onNavigate={persistSidebarScroll} />)}
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
                      {index === breadcrumbs.length - 1 ? <span className="font-semibold text-slate-500">{item.label}</span> : <Link to={item.to} className="font-semibold text-slate-400 hover:text-brand-700">{item.label}</Link>}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-700">{eyebrow || meta.eyebrow || 'Không gian'}</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-[2.4rem]">{title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{description || meta.description || 'Không gian tập trung để ra quyết định nhanh và thực thi gọn gàng.'}</p>
              </div>

              <div className="w-full space-y-3 xl:w-[340px]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">{initials(user?.full_name)}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{user?.full_name || 'Người dùng hiện tại'}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email || user?.username || ''}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className={`status-badge ${roleTone(user?.role)}`}>{roleLabel(user?.role)}</span>
                    <Link to="/profile" className="text-xs font-semibold text-brand-700 hover:text-brand-800">Xem hồ sơ</Link>
                  </div>
                </div>

                <div className="flex w-full justify-center">
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button type="button" onClick={() => window.open(guideApi.viewUrl(), '_blank', 'noopener,noreferrer')} className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Mở hướng dẫn</button>
                      <button type="button" onClick={toggleTheme} className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">{theme === 'dark' ? 'Dùng chế độ sáng' : 'Dùng chế độ tối'}</button>
                    </div>
                    <button type="button" onClick={() => { logout(); navigate('/login'); }} className="ui-soft-hover rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Đăng xuất</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-1 xl:hidden">
              {sections.flatMap((section) => section.items).map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${isActive ? 'border-brand-200 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
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
