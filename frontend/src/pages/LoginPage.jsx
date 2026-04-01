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
    text: 'Xem tiến trình toàn hệ thống, các phòng ban cần chú ý và những cá nhân nổi bật.'
  },
  {
    title: 'Manager',
    text: 'Tập trung vào rủi ro của đội, objective tiến trình thấp và các check-ins còn thiếu.'
  },
  {
    title: 'Employee',
    text: 'Theo dõi objective của bạn, tiến trình KPI và các hành động cần ưu tiên tiếp theo.'
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
      setError(err?.response?.data?.message || 'Đăng nhập thất bại');
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
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">Không gian hiệu suất gọn gàng cho đội ngũ hiện đại.</h1>
            </div>
            <button type="button" onClick={toggleTheme} className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              {theme === 'dark' ? 'Dùng chế độ sáng' : 'Dùng chế độ tối'}
            </button>
          </div>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600">
            Theo dõi objectives, key results, KPIs và check-ins trong cùng một không gian hướng dẫn. Giao diện được thiết kế để mỗi vai trò thấy ngay thông tin cần thiết.
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Cần hướng dẫn nhanh?</p>
                <p className="mt-2 text-sm text-slate-700">Mở hướng dẫn sử dụng để đọc online, sau đó tải PDF trực tiếp trong trang hướng dẫn nếu cần.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={guideApi.viewUrl()} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Mở hướng dẫn</a>
              </div>
            </div>
          </div>
        </section>

        <Card title="Đăng nhập" subtitle="Sử dụng thông tin tài khoản để vào hệ thống" className="self-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">Email hoặc username</span>
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="you@company.com" required />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">Mật khẩu</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" required />
            </label>

            {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Vào hệ thống'}
            </Button>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Lượt demo Hackathon</p>
              <p className="mt-1 leading-relaxed">Đăng nhập vào dashboard, sau đó mở Funny Assistant để trình bày gợi ý, nhận định và phần tổng kết theo vai trò.</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

