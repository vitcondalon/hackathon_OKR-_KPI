import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const copy = {
  vi: {
    eyebrow: 'Nền tảng quản trị hiệu suất',
    title: 'Hệ thống quản lý đánh giá hiệu suất nhân sự',
    subtitle:
      'Đăng nhập bằng tài khoản mã nhân viên theo định dạng EMP-ENG-001@company. Toàn bộ quy trình cập nhật, phê duyệt và khóa hồ sơ được thực hiện trên một không gian làm việc thống nhất.',
    roleCards: [
      { title: 'Quản trị hệ thống', text: 'Quản trị tài khoản, thiết lập phân quyền, mở khóa hồ sơ và giám sát toàn hệ thống.' },
      { title: 'Quản lý bộ phận', text: 'Khởi tạo biểu mẫu đánh giá, theo dõi tiến độ và thực hiện phê duyệt cấp quản lý.' },
      { title: 'Nhân viên', text: 'Cập nhật kết quả công việc, bổ sung minh chứng và gửi hồ sơ phê duyệt.' }
    ],
    loginTitle: 'Đăng nhập',
    loginSubtitle: 'Sử dụng thông tin tài khoản do quản trị hệ thống cấp',
    idLabel: 'Email hoặc mã nhân viên',
    idPlaceholder: 'EMP-ENG-001@company',
    passLabel: 'Mật khẩu',
    passPlaceholder: 'Nhập mật khẩu',
    loginLoading: 'Đang đăng nhập...',
    loginButton: 'Truy cập hệ thống',
    loginFailed: 'Đăng nhập thất bại',
    accountHintTitle: 'Tài khoản truy cập mẫu',
    accountHintBody: 'ADM-001@company / Admin@123'
  },
  en: {
    eyebrow: 'Performance management platform',
    title: 'Workforce Performance Review Management System',
    subtitle:
      'Sign in with the employee account format, for example EMP-ENG-001@company. The full update, approval, and record-lock workflow is handled in one unified workspace.',
    roleCards: [
      { title: 'Admin', text: 'Manage accounts, configure permissions, unlock records, and oversee the full system.' },
      { title: 'Manager', text: 'Initiate review templates, track progress, and complete manager-level approvals.' },
      { title: 'Employee', text: 'Update work results, attach evidence, and submit review records for approval.' }
    ],
    loginTitle: 'Sign In',
    loginSubtitle: 'Use the credentials issued by the system administrator',
    idLabel: 'Email or employee code',
    idPlaceholder: 'EMP-ENG-001@company',
    passLabel: 'Password',
    passPlaceholder: 'Enter password',
    loginLoading: 'Signing in...',
    loginButton: 'Open workspace',
    loginFailed: 'Login failed',
    accountHintTitle: 'Demo account',
    accountHintBody: 'ADM-001@company / Admin@123'
  }
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const t = copy[locale] || copy.vi;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(identifier, password);
      navigate('/workspace', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || t.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ui-shell flex items-center justify-center" lang={locale === 'en' ? 'en' : 'vi'}>
      <div className="grid w-full max-w-7xl gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="ui-panel ui-hero rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="ui-kicker">{t.eyebrow}</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.8rem]">
                {t.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-[1rem] border border-slate-200/90 bg-white/80 p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setLocale('vi')}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${locale === 'vi' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${locale === 'en' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
              >
                EN
              </button>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{t.subtitle}</p>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {t.roleCards.map((item) => (
              <div key={item.title} className="ui-note-card">
                <p className="ui-kicker">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <Card title={t.loginTitle} subtitle={t.loginSubtitle} className="self-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">{t.idLabel}</span>
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={t.idPlaceholder} required />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">{t.passLabel}</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t.passPlaceholder} required />
            </label>

            {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loginLoading : t.loginButton}
            </Button>

            <div className="ui-note-card text-sm text-slate-600">
              <p className="font-semibold text-slate-800">{t.accountHintTitle}</p>
              <p className="mt-1">{t.accountHintBody}</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
