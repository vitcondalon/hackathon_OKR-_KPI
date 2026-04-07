import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import { classNames } from '../../utils/format';

const copy = {
  vi: {
    kpi: 'KPI',
    okr: 'OKR',
    logout: 'Đăng xuất'
  },
  en: {
    kpi: 'KPI',
    okr: 'OKR',
    logout: 'Sign out'
  }
};

function tabClass(active) {
  return classNames(
    'rounded-lg border px-3 py-2 text-sm font-semibold transition',
    active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
  );
}

export default function AppModeTabs({ active = 'kpi' }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { locale, setLocale } = useLocale();
  const t = copy[locale] || copy.vi;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-[1rem] border border-slate-200/90 bg-white/85 p-1.5 shadow-sm">
        <button type="button" onClick={() => navigate('/workspace')} className={tabClass(active === 'kpi')}>
          {t.kpi}
        </button>
        <button type="button" onClick={() => navigate('/okr')} className={tabClass(active === 'okr')}>
          {t.okr}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[1rem] border border-slate-200/90 bg-white/85 p-1.5 shadow-sm">
        <button type="button" onClick={() => setLocale('vi')} className={tabClass(locale === 'vi')}>
          VI
        </button>
        <button type="button" onClick={() => setLocale('en')} className={tabClass(locale === 'en')}>
          EN
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
}
