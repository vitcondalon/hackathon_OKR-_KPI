import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';

function roleLabel(role) {
  if (role === 'admin') return 'Quản trị viên';
  if (role === 'manager') return 'Quản lý';
  if (role === 'employee') return 'Nhân viên';
  return role || '-';
}

export default function ProfilePage() {
  const { user } = useAuth();

  const profileItems = [
    { label: 'Họ và tên', value: user?.full_name },
    { label: 'Tên đăng nhập', value: user?.username },
    { label: 'Email', value: user?.email },
    { label: 'Vai trò', value: roleLabel(user?.role) },
    { label: 'Phòng ban', value: user?.department_name || user?.department_id || '-' },
    { label: 'Mã nhân viên', value: user?.employee_code || '-' }
  ];

  return (
    <AppLayout title="Hồ sơ" description="Xem nhanh thông tin định danh, quyền truy cập hiện tại và bối cảnh làm việc của bạn.">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Tài khoản hiện tại" subtitle="Thông tin người dùng đã xác thực">
          <div className="grid gap-3 sm:grid-cols-2">
            {profileItems.map((item) => (
              <div key={item.label} className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.value || '-'}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Ghi chú workspace" subtitle="Cách hệ thống điều chỉnh trải nghiệm cho tài khoản này">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-[1.4rem] border border-brand-100 bg-brand-50/80 p-4">
              Điều hướng, phần tóm tắt dashboard và gợi ý từ Funny đều dựa trên role, nên hồ sơ này ảnh hưởng trực tiếp tới những gì bạn nhìn thấy đầu tiên.
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
              Mở dashboard để xem góc nhìn khởi đầu của bạn, sau đó dùng Funny Assistant để nhận gợi ý và phần giải thích phù hợp với role hiện tại.
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
