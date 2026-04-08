import { useEffect, useMemo, useState } from 'react';
import { workspaceApi } from '../api/workspaceApi';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';
import { apiErrorMessage } from '../api/helpers';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import AppModeTabs from '../components/layout/AppModeTabs';
import PasswordField from '../components/common/PasswordField';

const statusClass = {
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  employee_submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  manager_reviewed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  hr_reviewed: 'bg-sky-50 text-sky-700 border-sky-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  locked: 'bg-red-50 text-red-700 border-red-200',
  returned: 'bg-amber-50 text-amber-700 border-amber-200'
};

const copy = {
  vi: {
    eyebrow: 'Không gian nghiệp vụ tập trung',
    appTitle: 'Hồ sơ đánh giá hiệu suất nhân sự',
    appSubtitle: 'Quản lý hồ sơ đánh giá theo chu kỳ bằng tài khoản mã nhân viên định dạng EMP-ENG-001@company',
    roleLabel: 'Vai trò',
    logout: 'Đăng xuất',
    loadWorkspace: 'Đang tải hồ sơ đánh giá...',
    employee: 'Nhân sự được đánh giá',
    employeeSearch: 'Tra cứu theo mã hoặc họ tên',
    employeeSearchPlaceholder: 'Ví dụ mã EMP-ENG-001 hoặc họ tên nhân sự',
    noEmployeeMatch: 'Không tìm thấy nhân viên phù hợp với từ khóa này.',
    businessEnglishNotice: 'Dữ liệu nghiệp vụ mới hiện bắt buộc nhập bằng tiếng Anh để đồng bộ cơ sở dữ liệu và phục vụ chuyển đổi đa ngôn ngữ sau này.',
    period: 'Chu kỳ đánh giá',
    reviewStatus: 'Trạng thái phê duyệt hồ sơ',
    noReview: 'Chưa tạo hồ sơ',
    systemDate: 'Ngày hệ thống',
    periodAdminTitle: 'Thiết lập chu kỳ đánh giá',
    periodAutoHint: 'Ngày bắt đầu và ngày kết thúc sẽ được tự động căn chỉnh theo loại chu kỳ đã chọn.',
    periodTypeLabel: 'Loại chu kỳ',
    startDateLabel: 'Ngày bắt đầu',
    endDateLabel: 'Ngày kết thúc',
    periodName: 'Tên chu kỳ',
    createPeriod: 'Khởi tạo chu kỳ',
    createReview: 'Khởi tạo hồ sơ đánh giá cho nhân sự đã chọn',
    profileName: 'Nhân sự được đánh giá',
    profileCode: 'Mã nhân viên',
    profileDepartment: 'Phòng ban',
    profileManager: 'Trưởng bộ phận',
    profileWindow: 'Thời gian áp dụng',
    profileEditWindow: 'Khung thời gian cập nhật',
    profileLastUpdated: 'Cập nhật hồ sơ gần nhất',
    profileScore: 'Tổng điểm',
    profileWeight: 'Tổng hệ số',
    profileRating: 'Xếp loại',
    snapshotTitle: 'Biểu đồ tổng quan',
    snapshotSubtitle: 'Theo dõi nhanh điểm số, số mục khóa và tiến độ từng tiêu chí.',
    snapshotScore: 'Điểm hiệu suất',
    snapshotOpenItems: 'Tiêu chí đang mở',
    snapshotLockedItems: 'Tiêu chí đã khóa',
    snapshotPlan: 'Kế hoạch',
    snapshotActual: 'Thực đạt',
    snapshotNoData: 'Chưa có dữ liệu tiêu chí để hiển thị biểu đồ.',
    lock: 'Khóa',
    tableTitle: 'Chi tiết tiêu chí đánh giá',
    tableSubtitle: 'Tổng hệ số tối đa là 7. Các tiêu chí đã khóa sẽ được đánh dấu bằng biểu tượng khóa màu đỏ.',
    employeeDateNotice: 'Nhân viên chỉ được cập nhật số liệu trong thời gian hiệu lực của chu kỳ đánh giá. Ngoài khoảng này, cần liên hệ quản lý hoặc quản trị viên để điều chỉnh.',
    stt: 'STT',
    category: 'Tiêu chí',
    description: 'Mô tả',
    project: 'Dự án',
    projectCodePlaceholder: 'Mã dự án',
    weight: 'Hệ số',
    plan: '% Kế hoạch',
    actual: '% Thực đạt',
    score: 'Điểm',
    itemUpdatedAt: 'Cập nhật gần nhất',
    itemLockedAt: 'Khóa lúc',
    notUpdatedYet: 'Chưa phát sinh cập nhật',
    save: 'Lưu',
    deleteItem: 'Xóa',
    confirmDeleteItem: 'Bạn có chắc muốn xóa tiêu chí này không?',
    addItem: 'Thêm tiêu chí',
    newItem: 'Tiêu chí mới',
    shortDesc: 'Mô tả ngắn',
    commentsAndFlow: 'Nhận xét và phê duyệt',
    commentHistory: 'Lịch sử phản hồi',
    noComments: 'Chưa có nhận xét.',
    writeComment: 'Nhập nhận xét...',
    sendComment: 'Gửi nhận xét',
    workflowActions: 'Thao tác phê duyệt',
    noAction: 'Không có hành động hợp lệ ở trạng thái này.',
    historyTitle: 'Lịch sử công tác và đánh giá',
    oldProjects: 'Dự án đã tham gia',
    noProjects: 'Chưa có dự án.',
    oldPeriods: 'Chu kỳ đã đánh giá',
    noReviewHint: 'Chưa có hồ sơ đánh giá cho nhân sự hoặc chu kỳ đang chọn. Quản trị viên, Quản lý hoặc bộ phận Nhân sự có thể khởi tạo hồ sơ ở phía trên.',
    adminUsersTitle: 'Quản trị tài khoản nhân sự',
    userCode: 'Mã NV',
    fullName: 'Họ tên',
    role: 'Vai trò',
    loginEmail: 'Email đăng nhập',
    resetPassword: 'Đổi mật khẩu',
    newPassword: 'Mật khẩu mới',
    update: 'Cập nhật',
    createUser: 'Tạo tài khoản',
    noDepartment: 'Không phòng ban',
    workingWith: 'Đang xử lý hồ sơ của:',
    noEmployeeSelected: 'Chưa chọn hồ sơ nhân sự.',
    reviewLocked: 'Đã khóa',
    unknownAuthor: 'Chưa xác định',
    roles: {
      admin: 'Quản trị viên',
      hr: 'Nhân sự',
      manager: 'Quản lý',
      employee: 'Nhân viên'
    },
    periodTypes: {
      monthly: 'Tháng',
      quarterly: 'Quý',
      yearly: 'Năm'
    },
    commentTypes: {
      employee_self: 'Nhân viên',
      manager: 'Quản lý',
      hr: 'Nhân sự',
      final: 'Kết luận cuối'
    },
    actionLabels: {
      submit: 'Gửi duyệt',
      manager_approve: 'Phê duyệt cấp quản lý',
      hr_approve: 'Phê duyệt nhân sự',
      approve: 'Phê duyệt hoàn tất',
      return: 'Trả về bổ sung',
      lock: 'Khóa hồ sơ',
      unlock: 'Mở khóa'
    },
    actionClass: {
      submit: 'bg-blue-600 text-white',
      manager_approve: 'bg-indigo-600 text-white',
      hr_approve: 'bg-sky-600 text-white',
      approve: 'bg-emerald-600 text-white',
      return: 'bg-amber-500 text-white',
      lock: 'bg-red-600 text-white',
      unlock: 'bg-slate-800 text-white'
    },
    statuses: {
      draft: 'Nhập liệu',
      employee_submitted: 'Đã gửi',
      manager_reviewed: 'Quản lý đã phê duyệt',
      hr_reviewed: 'Nhân sự đã phê duyệt',
      approved: 'Đã phê duyệt',
      locked: 'Đã khóa',
      returned: 'Cần bổ sung'
    },
    windowStates: {
      upcoming: 'Chưa đến thời gian cập nhật',
      active: 'Đang trong thời gian cập nhật',
      expired: 'Đã hết thời gian cập nhật'
    },
    fallback: {
      loadWorkspace: 'Không thể tải hồ sơ đánh giá',
      loadAdmin: 'Không thể tải dữ liệu quản trị',
      createPeriod: 'Không khởi tạo được chu kỳ đánh giá',
      createReview: 'Không tạo được hồ sơ đánh giá',
      addItem: 'Không thêm được tiêu chí',
      saveItem: 'Không lưu được tiêu chí',
      deleteItem: 'Không xóa được tiêu chí',
      addComment: 'Không thêm được nhận xét',
      action: 'Thao tác thất bại',
      createUser: 'Không tạo được tài khoản',
      resetPassword: 'Không đổi được mật khẩu'
    }
  },
  en: {
    eyebrow: 'Unified operations workspace',
    appTitle: 'Workforce performance review record',
    appSubtitle: 'Manage review records by cycle using employee-format accounts such as EMP-ENG-001@company',
    roleLabel: 'Role',
    logout: 'Sign out',
    loadWorkspace: 'Loading workspace...',
    employee: 'Employee under review',
    employeeSearch: 'Search by employee code',
    employeeSearchPlaceholder: 'Example EMP-ENG-001 or employee name',
    noEmployeeMatch: 'No employee matches this keyword.',
    businessEnglishNotice: 'New business data must currently be entered in English to keep the database consistent and ready for future multilingual translation.',
    period: 'Review cycle',
    reviewStatus: 'Approval status',
    noReview: 'No review yet',
    systemDate: 'System date',
    periodAdminTitle: 'Review cycle setup',
    periodAutoHint: 'Start and end dates are automatically aligned with the selected cycle type.',
    periodTypeLabel: 'Cycle type',
    startDateLabel: 'Start date',
    endDateLabel: 'End date',
    periodName: 'Cycle name',
    createPeriod: 'Create cycle',
    createReview: 'Create review record for this employee',
    profileName: 'Employee under review',
    profileCode: 'Employee code',
    profileDepartment: 'Department',
    profileManager: 'Department head',
    profileWindow: 'Applied period',
    profileEditWindow: 'Edit window',
    profileLastUpdated: 'Last record update',
    profileScore: 'Total score',
    profileWeight: 'Total weight',
    profileRating: 'Rating',
    snapshotTitle: 'Performance snapshot',
    snapshotSubtitle: 'Quick view of score, locked items, and progress by criteria.',
    snapshotScore: 'Performance score',
    snapshotOpenItems: 'Open criteria',
    snapshotLockedItems: 'Locked criteria',
    snapshotPlan: 'Plan',
    snapshotActual: 'Actual',
    snapshotNoData: 'No review criteria available for chart display.',
    lock: 'Lock',
    tableTitle: 'Review criteria details',
    tableSubtitle: 'Maximum total weight is 7. Locked criteria display a red lock icon.',
    employeeDateNotice: 'Employees can update review values only within the effective dates of the selected cycle.',
    stt: 'No.',
    category: 'Criteria',
    description: 'Description',
    project: 'Project',
    projectCodePlaceholder: 'Project code',
    weight: 'Weight',
    plan: '% Plan',
    actual: '% Actual',
    score: 'Score',
    itemUpdatedAt: 'Last updated',
    itemLockedAt: 'Locked at',
    notUpdatedYet: 'No update recorded yet',
    save: 'Save',
    deleteItem: 'Delete',
    confirmDeleteItem: 'Are you sure you want to delete this criteria item?',
    addItem: 'Add criteria',
    newItem: 'New criteria',
    shortDesc: 'Short description',
    commentsAndFlow: 'Comments and Approval',
    commentHistory: 'Feedback history',
    noComments: 'No comments yet.',
    writeComment: 'Write comment...',
    sendComment: 'Send comment',
    workflowActions: 'Approval actions',
    noAction: 'No valid action for current status.',
    historyTitle: 'Work and review history',
    oldProjects: 'Completed projects',
    noProjects: 'No project history.',
    oldPeriods: 'Reviewed cycles',
    noReviewHint: 'No review found for selected employee/period. Manager/Admin/HR can create a review template above.',
    adminUsersTitle: 'HR account administration',
    userCode: 'Employee Code',
    fullName: 'Full Name',
    role: 'Role',
    loginEmail: 'Login Email',
    resetPassword: 'Reset password',
    newPassword: 'New password',
    update: 'Update',
    createUser: 'Create account',
    noDepartment: 'No department',
    workingWith: 'Currently processing record for:',
    noEmployeeSelected: 'No employee selected.',
    reviewLocked: 'Locked',
    unknownAuthor: 'Unknown',
    roles: {
      admin: 'Admin',
      hr: 'HR',
      manager: 'Manager',
      employee: 'Employee'
    },
    periodTypes: {
      monthly: 'Month',
      quarterly: 'Quarter',
      yearly: 'Year'
    },
    commentTypes: {
      employee_self: 'Employee',
      manager: 'Manager',
      hr: 'HR',
      final: 'Final'
    },
    actionLabels: {
      submit: 'Submit for review',
      manager_approve: 'Manager approve',
      hr_approve: 'HR approve',
      approve: 'Final approve',
      return: 'Return for revision',
      lock: 'Lock review',
      unlock: 'Unlock review'
    },
    actionClass: {
      submit: 'bg-blue-600 text-white',
      manager_approve: 'bg-indigo-600 text-white',
      hr_approve: 'bg-sky-600 text-white',
      approve: 'bg-emerald-600 text-white',
      return: 'bg-amber-500 text-white',
      lock: 'bg-red-600 text-white',
      unlock: 'bg-slate-800 text-white'
    },
    statuses: {
      draft: 'Draft',
      employee_submitted: 'Submitted',
      manager_reviewed: 'Manager reviewed',
      hr_reviewed: 'HR reviewed',
      approved: 'Approved',
      locked: 'Locked',
      returned: 'Returned'
    },
    windowStates: {
      upcoming: 'Upcoming update window',
      active: 'Within update window',
      expired: 'Update window closed'
    },
    fallback: {
      loadWorkspace: 'Unable to load workspace',
      loadAdmin: 'Unable to load admin data',
      createPeriod: 'Unable to create review period',
      createReview: 'Unable to create review',
      addItem: 'Unable to add item',
      saveItem: 'Unable to save item',
      deleteItem: 'Unable to delete item',
      addComment: 'Unable to add comment',
      action: 'Action failed',
      createUser: 'Unable to create account',
      resetPassword: 'Unable to reset password'
    }
  }
};

copy.vi.emptyItemsHint = 'Ho so nay da co trang thai danh gia nhung chua co tieu chi chi tiet trong du lieu hien tai. Hay chay lai seed de dong bo du lieu demo.';
copy.en.emptyItemsHint = 'This review already has an approval status, but the current dataset does not include detailed criteria rows yet. Rerun the seed to sync demo data.';

function LockBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </svg>
      {label}
    </span>
  );
}

function StatusBadge({ status, labels }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass[status] || statusClass.draft}`}>
      {labels?.[status] || status}
    </span>
  );
}

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function PerformanceSnapshot({ review, locale, t }) {
  const totalScore = clampPercent(review?.total_score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * totalScore) / 100;
  const items = review?.items || [];
  const lockedItems = items.filter((item) => item.is_locked).length;
  const openItems = items.length - lockedItems;

  return (
    <aside className="ui-note-card h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="ui-section-title">{t.snapshotTitle}</h3>
          <p className="ui-section-subtitle">{t.snapshotSubtitle}</p>
        </div>
        <StatusBadge status={review?.status || 'draft'} labels={t.statuses} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1rem] border border-slate-200 bg-white px-3 py-4">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {t.snapshotScore}
          </p>
          <div className="mt-3 flex flex-col items-center justify-center">
            <div className="relative h-32 w-32">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#2563eb"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <strong className="text-2xl font-semibold text-slate-950">{Number(review?.total_score || 0).toFixed(2)}</strong>
              <span className="mt-1 text-xs font-medium text-slate-500">/ 100</span>
            </div>
          </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              {locale === 'en' ? 'Current weighted review score' : 'Điểm tổng hợp hiện tại của hồ sơ'}
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.snapshotOpenItems}</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{openItems}</p>
          </div>
          <div className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t.snapshotLockedItems}</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{lockedItems}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">{t.snapshotNoData}</p> : null}
        {items.map((item) => {
          const plan = clampPercent(item.plan_percent);
          const actual = clampPercent(item.actual_percent);

          return (
            <div key={`snapshot-${item.id}`} className="rounded-[1rem] border border-slate-200 bg-white px-3.5 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{localizeCategoryName(item.category, locale)}</p>
                <span className="text-xs text-slate-500">{Number(item.weight || 0).toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{t.snapshotPlan}: {plan.toFixed(0)}%</span>
                <span>{t.snapshotActual}: {actual.toFixed(0)}%</span>
              </div>
              <div className="relative mt-2 h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${actual}%` }} />
                <span
                  className="absolute top-[-3px] h-4 w-[2px] rounded-full bg-slate-700"
                  style={{ left: `calc(${plan}% - 1px)` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function roleLabel(role, labels) {
  if (labels?.[role]) return labels[role];
  if (role === 'admin') return 'Admin';
  if (role === 'hr') return 'HR';
  if (role === 'manager') return 'Manager';
  if (role === 'employee') return 'Employee';
  return role || '-';
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function currentDateInput() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function parseDateInput(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDateInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function buildPeriodSuggestion(periodType, anchorValue, locale) {
  const anchorDate = parseDateInput(anchorValue) || parseDateInput(currentDateInput()) || new Date();
  let startDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  let endDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  let suggestedName = '';

  if (periodType === 'quarterly') {
    const quarterIndex = Math.floor(anchorDate.getMonth() / 3);
    startDate = new Date(anchorDate.getFullYear(), quarterIndex * 3, 1);
    endDate = new Date(anchorDate.getFullYear(), quarterIndex * 3 + 3, 0);
    suggestedName = `Quarter ${quarterIndex + 1} / ${anchorDate.getFullYear()}`;
  } else if (periodType === 'yearly') {
    startDate = new Date(anchorDate.getFullYear(), 0, 1);
    endDate = new Date(anchorDate.getFullYear(), 11, 31);
    suggestedName = `Year ${anchorDate.getFullYear()}`;
  } else {
    suggestedName = `Month ${pad2(anchorDate.getMonth() + 1)} / ${anchorDate.getFullYear()}`;
  }

  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
    suggestedName
  };
}

function formatDisplayDate(value, locale) {
  if (!value) return '-';
  const raw = String(value);
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? parseDateInput(raw) : new Date(raw);
  if (!parsed) return value;
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN').format(parsed);
}

function formatDisplayDateTime(value, locale) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(parsed);
}

function localizeDepartmentName(value, locale) {
  return value || '-';
}

function localizeRatingLabel(value, locale) {
  const raw = String(value || '').trim();
  if (!raw) return '-';

  const ratingMap = {
    excellent: 'Excellent',
    good: 'Good',
    meets_expectations: 'Meets expectations',
    needs_improvement: 'Needs improvement',
    does_not_meet_expectations: 'Does not meet expectations',
    not_rated: 'Not rated',
    xuat_sac: 'Excellent',
    tot: 'Good',
    dat: 'Meets expectations',
    can_cai_thien: 'Needs improvement',
    khong_dat: 'Does not meet expectations'
  };

  return ratingMap[raw] || raw;
}

function localizeCategoryName(value, locale) {
  return value || '-';
}

function localizeBusinessText(value, locale) {
  return value || '';
}

function canonicalBusinessText(value) {
  return value || '';
}

function buildItemDrafts(items, locale) {
  const drafts = {};

  (items || []).forEach((item) => {
    drafts[item.id] = {
      category: item.category || '',
      project_code: item.project_code || '',
      project_name: item.project_name || '',
      description: item.description || '',
      weight: item.weight ?? '',
      plan_percent: item.plan_percent ?? '',
      actual_percent: item.actual_percent ?? '',
      evidence_note: item.evidence_note || '',
      manager_note: item.manager_note || '',
      is_required: Boolean(item.is_required),
      is_locked: Boolean(item.is_locked)
    };
  });

  return drafts;
}

function buildPeriodDisplayName(period, locale) {
  if (!period) return '-';
  return period.period_name || period.name || period.period_code || period.code || '-';
}

function getWindowState(startDate, endDate) {
  if (!startDate || !endDate) return 'active';
  const today = currentDateInput();
  if (today < startDate) return 'upcoming';
  if (today > endDate) return 'expired';
  return 'active';
}

function WorkspacePage() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const t = copy[locale] || copy.vi;
  const passwordToggleLabels = locale === 'en'
    ? { show: 'Show password', hide: 'Hide password' }
    : { show: 'Hiện mật khẩu', hide: 'Ẩn mật khẩu' };
  const panelClass = 'ui-panel';
  const roleOptions = ['employee', 'manager', 'hr', 'admin'];

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [bootstrap, setBootstrap] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [itemDrafts, setItemDrafts] = useState({});
  const [commentText, setCommentText] = useState('');
  const [newItem, setNewItem] = useState({ category: '', weight: '1', description: '' });
  const [newPeriod, setNewPeriod] = useState({ name: '', period_type: 'quarterly', start_date: '', end_date: '' });
  const [isPeriodNameManual, setIsPeriodNameManual] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newUser, setNewUser] = useState({
    employee_code: '',
    full_name: '',
    role: 'employee',
    department_id: '',
    password: 'Employee@123'
  });
  const [passwordDraft, setPasswordDraft] = useState({});

  const review = bootstrap?.review || null;
  const canManage = bootstrap?.permissions?.can_create_review;
  const isAdmin = user?.role === 'admin';

  async function loadWorkspace(params = {}) {
    setLoading(true);
    setError('');
    try {
      const data = await workspaceApi.bootstrap(params);
      setBootstrap(data);
      setSelectedEmployeeId(data?.selected?.employee_user_id ? String(data.selected.employee_user_id) : '');
      setSelectedPeriodId(data?.selected?.period_id ? String(data.selected.period_id) : '');
      setItemDrafts(buildItemDrafts(data?.review?.items || [], locale));
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.loadWorkspace));
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminData() {
    if (!isAdmin) return;
    try {
      const [users, deps] = await Promise.all([usersApi.list(), departmentsApi.list()]);
      setAdminUsers(Array.isArray(users) ? users : []);
      setDepartments(Array.isArray(deps) ? deps : []);
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.loadAdmin));
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  useEffect(() => {
    if (!review) {
      setItemDrafts({});
      return;
    }

    setItemDrafts(buildItemDrafts(review.items || [], locale));
  }, [review]);

  useEffect(() => {
    const suggestion = buildPeriodSuggestion(newPeriod.period_type, newPeriod.start_date || currentDateInput(), locale);
    setNewPeriod((prev) => {
      let changed = false;
      const next = { ...prev };

      if (prev.start_date !== suggestion.startDate) {
        next.start_date = suggestion.startDate;
        changed = true;
      }

      if (prev.end_date !== suggestion.endDate) {
        next.end_date = suggestion.endDate;
        changed = true;
      }

      if (!isPeriodNameManual && prev.name !== suggestion.suggestedName) {
        next.name = suggestion.suggestedName;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [newPeriod.period_type, newPeriod.start_date, locale, isPeriodNameManual]);

  const selectedEmployee = useMemo(() => {
    return (bootstrap?.employees || []).find((item) => String(item.id) === String(selectedEmployeeId)) || null;
  }, [bootstrap?.employees, selectedEmployeeId]);

  const selectedPeriod = useMemo(() => {
    return (bootstrap?.periods || []).find((item) => String(item.id) === String(selectedPeriodId)) || null;
  }, [bootstrap?.periods, selectedPeriodId]);

  const filteredEmployees = useMemo(() => {
    const employees = bootstrap?.employees || [];
    const keyword = employeeSearch.trim().toLowerCase();

    if (!keyword) {
      return employees;
    }

    return employees.filter((item) => {
      const haystack = [item.employee_code, item.full_name, `${item.employee_code || ''} ${item.full_name || ''}`]
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [bootstrap?.employees, employeeSearch]);

  const employeeOptions = useMemo(() => {
    const employees = bootstrap?.employees || [];
    const currentEmployee = employees.find((item) => String(item.id) === String(selectedEmployeeId));

    if (!currentEmployee) {
      return filteredEmployees;
    }

    if (filteredEmployees.some((item) => String(item.id) === String(currentEmployee.id))) {
      return filteredEmployees;
    }

    return [currentEmployee, ...filteredEmployees];
  }, [bootstrap?.employees, filteredEmployees, selectedEmployeeId]);

  const noEmployeeMatch = employeeSearch.trim().length > 0 && filteredEmployees.length === 0;
  const reviewWindowState = useMemo(() => getWindowState(review?.start_date, review?.end_date), [review?.start_date, review?.end_date]);
  const reviewWindowLabel = useMemo(() => t.windowStates?.[reviewWindowState] || reviewWindowState, [reviewWindowState, t.windowStates]);
  const employeeDateLocked = user?.role === 'employee' && reviewWindowState !== 'active';
  const systemDateLabel = useMemo(() => formatDisplayDate(currentDateInput(), locale), [locale]);

  const canEditRows = useMemo(() => {
    if (!review) return false;
    if (review.status === 'locked' && !isAdmin) return false;
    if (employeeDateLocked) return false;
    if (user?.role === 'employee') return Number(review.employee_user_id) === Number(user.id);
    return true;
  }, [employeeDateLocked, isAdmin, review, user?.id, user?.role]);

  async function refreshCurrent() {
    await loadWorkspace({ employee_id: selectedEmployeeId || undefined, period_id: selectedPeriodId || undefined });
  }

  async function onChangeEmployee(value) {
    setSelectedEmployeeId(value);
    await loadWorkspace({ employee_id: value || undefined, period_id: selectedPeriodId || undefined });
  }

  async function onChangePeriod(value) {
    setSelectedPeriodId(value);
    await loadWorkspace({ employee_id: selectedEmployeeId || undefined, period_id: value || undefined });
  }

  async function createPeriod(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await workspaceApi.createPeriod(newPeriod);
      setIsPeriodNameManual(false);
      setNewPeriod({ name: '', period_type: 'quarterly', start_date: '', end_date: '' });
      await refreshCurrent();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.createPeriod));
    } finally {
      setBusy(false);
    }
  }

  async function createReview() {
    if (!selectedEmployeeId || !selectedPeriodId) return;
    setBusy(true);
    setError('');
    try {
      await workspaceApi.createReview({
        employee_user_id: Number(selectedEmployeeId),
        period_id: Number(selectedPeriodId)
      });
      await refreshCurrent();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.createReview));
    } finally {
      setBusy(false);
    }
  }

  async function addItem(event) {
    event.preventDefault();
    if (!review) return;
    setBusy(true);
    setError('');
    try {
      await workspaceApi.addItem(review.id, {
        category: canonicalBusinessText(newItem.category),
        weight: Number(newItem.weight || 1),
        description: canonicalBusinessText(newItem.description || '')
      });
      setNewItem({ category: '', weight: '1', description: '' });
      await refreshCurrent();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.addItem));
    } finally {
      setBusy(false);
    }
  }

  async function saveItem(itemId) {
    if (!review) return;
    const draft = itemDrafts[itemId];
    if (!draft) return;

    const payload = {
      category: canonicalBusinessText(draft.category),
      project_code: draft.project_code || null,
      project_name: canonicalBusinessText(draft.project_name || '') || null,
      description: canonicalBusinessText(draft.description || '') || null,
      weight: toNumberOrNull(draft.weight),
      plan_percent: toNumberOrNull(draft.plan_percent),
      actual_percent: toNumberOrNull(draft.actual_percent),
      evidence_note: canonicalBusinessText(draft.evidence_note || '') || null,
      manager_note: canonicalBusinessText(draft.manager_note || '') || null,
      is_required: Boolean(draft.is_required),
      is_locked: Boolean(draft.is_locked)
    };

    if (user?.role === 'employee') {
      delete payload.category;
      delete payload.weight;
      delete payload.manager_note;
      delete payload.is_required;
      delete payload.is_locked;
    }

    setBusy(true);
    setError('');
    try {
      await workspaceApi.updateItem(review.id, itemId, payload);
      await refreshCurrent();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.saveItem));
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(itemId) {
    if (!review) return;
    if (!window.confirm(t.confirmDeleteItem)) return;

    setBusy(true);
    setError('');
    try {
      await workspaceApi.removeItem(review.id, itemId);
      await refreshCurrent();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.deleteItem));
    } finally {
      setBusy(false);
    }
  }

  async function addComment(event) {
    event.preventDefault();
    if (!review || !commentText.trim()) return;
    setBusy(true);
    setError('');
    try {
      await workspaceApi.addComment(review.id, { content: canonicalBusinessText(commentText.trim()) });
      setCommentText('');
      await refreshCurrent();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.addComment));
    } finally {
      setBusy(false);
    }
  }

  async function runAction(action) {
    if (!review) return;
    setBusy(true);
    setError('');
    try {
      await workspaceApi.applyAction(review.id, { action });
      await refreshCurrent();
    } catch (err) {
      const message = err?.response?.data?.errors?.[0]?.message || apiErrorMessage(err, t.fallback.action);
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function createUser(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await usersApi.create({
        employee_code: newUser.employee_code,
        full_name: newUser.full_name,
        role: newUser.role,
        department_id: newUser.department_id ? Number(newUser.department_id) : null,
        password: newUser.password
      });
      setNewUser({
        employee_code: '',
        full_name: '',
        role: 'employee',
        department_id: '',
        password: 'Employee@123'
      });
      await loadAdminData();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.createUser));
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(targetUserId) {
    const password = passwordDraft[targetUserId];
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      await usersApi.update(targetUserId, { password });
      setPasswordDraft((prev) => ({ ...prev, [targetUserId]: '' }));
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.resetPassword));
    } finally {
      setBusy(false);
    }
  }

  const actionButtons = useMemo(() => {
    if (!review) return [];
    const list = [];
    if (['draft', 'returned'].includes(review.status)) {
      list.push('submit');
    }
    if (review.status === 'employee_submitted' && ['manager', 'hr', 'admin'].includes(user?.role)) {
      list.push('manager_approve');
    }
    if (review.status === 'manager_reviewed' && ['hr', 'admin'].includes(user?.role)) {
      list.push('hr_approve');
    }
    if (['manager_reviewed', 'hr_reviewed'].includes(review.status) && ['hr', 'admin'].includes(user?.role)) {
      list.push('approve');
    }
    if (['employee_submitted', 'manager_reviewed', 'hr_reviewed'].includes(review.status) && ['manager', 'hr', 'admin'].includes(user?.role)) {
      list.push('return');
    }
    if (['approved', 'hr_reviewed'].includes(review.status) && ['hr', 'admin'].includes(user?.role)) {
      list.push('lock');
    }
    if (review.status === 'locked' && user?.role === 'admin') {
      list.push('unlock');
    }
    return list;
  }, [review, user?.role]);

  if (loading) {
    return (
      <div className="ui-shell" lang={locale === 'en' ? 'en' : 'vi'}>
        <div className="ui-panel text-sm text-slate-600">{t.loadWorkspace}</div>
      </div>
    );
  }

  return (
    <div className="ui-shell" lang={locale === 'en' ? 'en' : 'vi'}>
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-5">
        <section className={`${panelClass} ui-hero`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="ui-kicker">{t.eyebrow}</p>
              <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{t.appTitle}</h1>
              <p className="ui-section-subtitle">
                {t.appSubtitle} | {t.roleLabel}: {roleLabel(user?.role, t.roles)}
              </p>
              <p className="mt-2 text-sm text-amber-700">{t.businessEnglishNotice}</p>
            </div>
            <AppModeTabs active="kpi" />
          </div>

          {error ? <p className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.35fr_1.35fr_0.8fr]">
            <label className="text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">{t.employee}</span>
              <span className="mb-1.5 block text-xs font-medium text-slate-500">{t.employeeSearch}</span>
              <input
                value={employeeSearch}
                onChange={(event) => setEmployeeSearch(event.target.value)}
                placeholder={t.employeeSearchPlaceholder}
                className="mb-2"
                disabled={!bootstrap?.permissions?.can_select_employee}
              />
              <select
                value={selectedEmployeeId}
                onChange={(event) => onChangeEmployee(event.target.value)}
                disabled={!bootstrap?.permissions?.can_select_employee}
              >
                {employeeOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.employee_code} - {item.full_name}
                  </option>
                ))}
              </select>
              {noEmployeeMatch ? <p className="mt-2 text-xs text-amber-600">{t.noEmployeeMatch}</p> : null}
            </label>

            <label className="text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">{t.period}</span>
              <select value={selectedPeriodId} onChange={(event) => onChangePeriod(event.target.value)}>
                {(bootstrap?.periods || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {buildPeriodDisplayName(item, locale)}
                  </option>
                ))}
              </select>
            </label>

            <div className="ui-note-card text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">{t.reviewStatus}</span>
              {review ? <StatusBadge status={review.status} labels={t.statuses} /> : <span className="text-slate-500">{t.noReview}</span>}
              <div className="mt-3 border-t border-slate-200 pt-3">
                <span className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{t.systemDate}</span>
                <p className="font-semibold text-slate-800">{systemDateLabel}</p>
              </div>
            </div>
          </div>
        </section>

        {canManage ? (
          <section className={panelClass}>
            <h2 className="ui-section-title">{t.periodAdminTitle}</h2>
            <form onSubmit={createPeriod} className="mt-3 grid gap-3 md:grid-cols-4">
              <label className="text-sm">
                <span className="mb-1.5 block font-semibold text-slate-700">{t.periodName}</span>
                <input
                  placeholder={t.periodName}
                  value={newPeriod.name}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    setIsPeriodNameManual(nextName.trim().length > 0);
                    setNewPeriod((prev) => ({ ...prev, name: nextName }));
                  }}
                  required
                />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-semibold text-slate-700">{t.periodTypeLabel}</span>
                <select value={newPeriod.period_type} onChange={(event) => setNewPeriod((prev) => ({ ...prev, period_type: event.target.value }))}>
                  <option value="monthly">{t.periodTypes.monthly}</option>
                  <option value="quarterly">{t.periodTypes.quarterly}</option>
                  <option value="yearly">{t.periodTypes.yearly}</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-semibold text-slate-700">{t.startDateLabel}</span>
                <input type="date" lang={locale === 'en' ? 'en-GB' : 'vi-VN'} value={newPeriod.start_date} onChange={(event) => setNewPeriod((prev) => ({ ...prev, start_date: event.target.value }))} required />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-semibold text-slate-700">{t.endDateLabel}</span>
                <input type="date" lang={locale === 'en' ? 'en-GB' : 'vi-VN'} value={newPeriod.end_date} readOnly required />
              </label>
              <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white md:col-span-4 md:w-fit" disabled={busy}>
                {t.createPeriod}
              </button>
            </form>
            <p className="mt-3 text-sm text-slate-500">{t.periodAutoHint}</p>
            {!review ? (
              <button type="button" onClick={createReview} className="mt-3 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white" disabled={busy || !selectedEmployeeId || !selectedPeriodId}>
                {t.createReview}
              </button>
            ) : null}
          </section>
        ) : null}

        {review ? (
          <>
            <section className={`${panelClass} grid gap-4 xl:grid-cols-[1.45fr_0.78fr]`}>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileManager}</p>
                  <p className="ui-metric-value">{review.manager_name || '-'}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileDepartment}</p>
                  <p className="ui-metric-value">{localizeDepartmentName(review.department_name, locale)}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileName}</p>
                  <p className="ui-metric-value">{review.employee_name}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileCode}</p>
                  <p className="ui-metric-value">{review.employee_code}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileWindow}</p>
                  <p className="ui-metric-value">{formatDisplayDate(review.start_date, locale)} - {formatDisplayDate(review.end_date, locale)}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileEditWindow}</p>
                  <p className="ui-metric-value">{reviewWindowLabel}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileLastUpdated}</p>
                  <p className="ui-metric-value">{formatDisplayDateTime(review.updated_at, locale) || '-'}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileScore}</p>
                  <p className="ui-metric-value">{review.total_score}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileWeight}</p>
                  <p className="ui-metric-value">{review.total_weight} / 7</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileRating}</p>
                  <p className="ui-metric-value">{localizeRatingLabel(review.rating_label || review.rating_level, locale)}</p>
                </div>
                <div className="ui-metric flex items-center">{review.status === 'locked' ? <LockBadge label={t.reviewLocked} /> : <StatusBadge status={review.status} labels={t.statuses} />}</div>
              </div>
              <PerformanceSnapshot review={review} locale={locale} t={t} />
            </section>

            <section className={panelClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="ui-section-title">{t.tableTitle}</h2>
                  <p className="ui-section-subtitle">{t.tableSubtitle}</p>
                  {employeeDateLocked ? <p className="mt-2 text-sm text-amber-600">{t.employeeDateNotice}</p> : null}
                </div>
              </div>
              <div className="ui-table-wrap">
                <table className="ui-table min-w-[1220px]">
                  <thead>
                    <tr>
                      <th>{t.stt}</th>
                      <th>{t.category}</th>
                      <th>{t.description}</th>
                      <th>{t.project}</th>
                      <th>{t.weight}</th>
                      <th>{t.plan}</th>
                      <th>{t.actual}</th>
                      <th>{t.score}</th>
                      <th>{t.itemUpdatedAt}</th>
                      <th>{t.lock}</th>
                      <th>{t.save}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(review.items || []).map((item) => {
                      const draft = itemDrafts[item.id] || {};
                      const disabled = !canEditRows || (item.is_locked && !isAdmin);
                      return (
                        <tr key={item.id}>
                          <td className="border border-slate-200 px-2 py-2">{item.item_order}</td>
                          <td className="border border-slate-200 px-2 py-2">
                            <input
                              value={draft.category ?? ''}
                              onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], category: event.target.value } }))}
                              disabled={disabled || user?.role === 'employee'}
                            />
                          </td>
                          <td className="border border-slate-200 px-2 py-2">
                            <textarea
                              rows={2}
                              value={draft.description ?? ''}
                              onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], description: event.target.value } }))}
                              disabled={disabled}
                            />
                          </td>
                          <td className="border border-slate-200 px-2 py-2">
                            <input
                              placeholder={t.projectCodePlaceholder}
                              value={draft.project_code ?? ''}
                              onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], project_code: event.target.value } }))}
                              disabled={disabled}
                            />
                          </td>
                          <td className="border border-slate-200 px-2 py-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max="7"
                              value={draft.weight ?? ''}
                              onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], weight: event.target.value } }))}
                              disabled={disabled || user?.role === 'employee'}
                            />
                          </td>
                          <td className="border border-slate-200 px-2 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={draft.plan_percent ?? ''}
                              onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], plan_percent: event.target.value } }))}
                              disabled={disabled}
                            />
                          </td>
                          <td className="border border-slate-200 px-2 py-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={draft.actual_percent ?? ''}
                              onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], actual_percent: event.target.value } }))}
                              disabled={disabled}
                            />
                          </td>
                          <td className="border border-slate-200 px-2 py-2">{item.achievement_score ?? '-'}</td>
                          <td className="border border-slate-200 px-2 py-2 text-xs text-slate-600">
                            <p>{formatDisplayDateTime(item.updated_at, locale) || t.notUpdatedYet}</p>
                            {item.locked_at ? <p className="mt-1 text-red-600">{t.itemLockedAt}: {formatDisplayDateTime(item.locked_at, locale)}</p> : null}
                          </td>
                          <td className="border border-slate-200 px-2 py-2">
                            {item.is_locked ? (
                              <LockBadge label={t.lock} />
                            ) : (
                              <label className="inline-flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={Boolean(draft.is_locked)}
                                  onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], is_locked: event.target.checked } }))}
                                  disabled={disabled || !['admin', 'hr', 'manager'].includes(user?.role)}
                                />
                                {t.lock}
                              </label>
                            )}
                          </td>
                          <td className="border border-slate-200 px-2 py-2">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => saveItem(item.id)} className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white" disabled={busy || disabled}>
                                {t.save}
                              </button>
                              {canManage ? (
                                <button
                                  type="button"
                                  onClick={() => deleteItem(item.id)}
                                  className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                                  disabled={busy || disabled}
                                >
                                  {t.deleteItem}
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {(review.items || []).length === 0 ? (
                      <tr>
                        <td colSpan={11} className="border border-slate-200 px-3 py-6 text-sm text-amber-700">
                          {t.emptyItemsHint}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {canManage ? (
                <form onSubmit={addItem} className="mt-3 grid gap-2 md:grid-cols-4">
                  <input placeholder={t.newItem} value={newItem.category} onChange={(event) => setNewItem((prev) => ({ ...prev, category: event.target.value }))} required />
                  <input placeholder={t.weight} type="number" min="0.01" max="7" step="0.01" value={newItem.weight} onChange={(event) => setNewItem((prev) => ({ ...prev, weight: event.target.value }))} />
                  <input placeholder={t.shortDesc} value={newItem.description} onChange={(event) => setNewItem((prev) => ({ ...prev, description: event.target.value }))} />
                  <button type="submit" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white" disabled={busy}>
                    {t.addItem}
                  </button>
                </form>
              ) : null}
            </section>

            <section className={panelClass}>
              <h2 className="ui-section-title">{t.commentsAndFlow}</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div className="ui-note-card">
                  <p className="text-sm font-semibold text-slate-700">{t.commentHistory}</p>
                  <div className="mt-2 max-h-56 space-y-2 overflow-y-auto text-sm">
                    {(review.comments || []).map((item) => (
                      <div key={item.id} className="ui-note-card bg-white">
                        <p className="font-semibold">{t.commentTypes[item.comment_type] || item.comment_type} - {item.author_name || t.unknownAuthor}</p>
                        <p className="text-slate-700">{localizeBusinessText(item.content, locale)}</p>
                      </div>
                    ))}
                    {review.comments?.length === 0 ? <p className="text-slate-500">{t.noComments}</p> : null}
                  </div>
                  <form onSubmit={addComment} className="mt-3 space-y-2">
                    <textarea rows={3} placeholder={t.writeComment} value={commentText} onChange={(event) => setCommentText(event.target.value)} />
                    <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white" disabled={busy || !commentText.trim()}>
                      {t.sendComment}
                    </button>
                  </form>
                </div>

                <div className="ui-note-card">
                  <p className="text-sm font-semibold text-slate-700">{t.workflowActions}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {actionButtons.map((action) => (
                      <button key={action} type="button" onClick={() => runAction(action)} className={`rounded-md px-3 py-2 text-sm font-semibold ${t.actionClass[action]}`} disabled={busy}>
                        {t.actionLabels[action]}
                      </button>
                    ))}
                    {actionButtons.length === 0 ? <p className="text-sm text-slate-500">{t.noAction}</p> : null}
                  </div>
                </div>
              </div>
            </section>

            <section className={panelClass}>
              <h2 className="ui-section-title">{t.historyTitle}</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">{t.oldProjects}</p>
                  <div className="space-y-2 text-sm">
                    {(review.project_history || []).map((item) => (
                      <div key={`${item.project_code}-${item.assigned_at}`} className="ui-note-card">
                        <p className="font-semibold">{item.project_code} - {localizeBusinessText(item.project_name, locale)}</p>
                        <p className="text-slate-600">{localizeBusinessText(item.role_name, locale) || '-'}</p>
                      </div>
                    ))}
                    {review.project_history?.length === 0 ? <p className="text-slate-500">{t.noProjects}</p> : null}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">{t.oldPeriods}</p>
                  <div className="space-y-2 text-sm">
                    {(review.period_history || []).map((item) => (
                      <div key={item.id} className="ui-note-card flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{item.period_code}</p>
                          <p className="text-slate-600">{buildPeriodDisplayName(item, locale)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.total_score}</p>
                          <StatusBadge status={item.status} labels={t.statuses} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className={panelClass}>
            <h2 className="ui-section-title">{t.noReview}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.noReviewHint}</p>
            {selectedEmployee ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileName}</p>
                  <p className="ui-metric-value">{selectedEmployee.full_name || '-'}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileCode}</p>
                  <p className="ui-metric-value">{selectedEmployee.employee_code || '-'}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileDepartment}</p>
                  <p className="ui-metric-value">{localizeDepartmentName(selectedEmployee.department_name, locale)}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.profileManager}</p>
                  <p className="ui-metric-value">{selectedEmployee.manager_name || '-'}</p>
                </div>
                <div className="ui-metric">
                  <p className="ui-metric-label">{t.period}</p>
                  <p className="ui-metric-value">{selectedPeriod ? buildPeriodDisplayName(selectedPeriod, locale) : '-'}</p>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {isAdmin ? (
          <section className={panelClass}>
            <h2 className="ui-section-title">{t.adminUsersTitle}</h2>
            <form onSubmit={createUser} className="mt-3 grid gap-2 md:grid-cols-6">
              <input placeholder={t.userCode} value={newUser.employee_code} onChange={(event) => setNewUser((prev) => ({ ...prev, employee_code: event.target.value }))} required />
              <input placeholder={t.fullName} value={newUser.full_name} onChange={(event) => setNewUser((prev) => ({ ...prev, full_name: event.target.value }))} required />
              <select value={newUser.role} onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{roleLabel(role, t.roles)}</option>
                ))}
              </select>
              <select value={newUser.department_id} onChange={(event) => setNewUser((prev) => ({ ...prev, department_id: event.target.value }))}>
                <option value="">{t.noDepartment}</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>{localizeDepartmentName(dep.name, locale)}</option>
                ))}
              </select>
              <PasswordField
                placeholder={t.resetPassword}
                value={newUser.password}
                onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
                autoComplete="new-password"
                toggleLabels={passwordToggleLabels}
                required
              />
              <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white" disabled={busy}>
                {t.createUser}
              </button>
            </form>

            <div className="ui-table-wrap mt-4">
              <table className="ui-table min-w-[920px]">
                <thead>
                  <tr>
                    <th>{t.userCode}</th>
                    <th>{t.fullName}</th>
                    <th>{t.role}</th>
                    <th>{t.loginEmail}</th>
                    <th>{t.resetPassword}</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-slate-200 px-2 py-2">{item.employee_code}</td>
                      <td className="border border-slate-200 px-2 py-2">{item.full_name}</td>
                      <td className="border border-slate-200 px-2 py-2">{roleLabel(item.role, t.roles)}</td>
                      <td className="border border-slate-200 px-2 py-2">{item.email}</td>
                      <td className="border border-slate-200 px-2 py-2">
                        <div className="flex gap-2">
                          <PasswordField
                            wrapperClassName="flex-1"
                            placeholder={t.newPassword}
                            value={passwordDraft[item.id] || ''}
                            onChange={(event) => setPasswordDraft((prev) => ({ ...prev, [item.id]: event.target.value }))}
                            autoComplete="new-password"
                            toggleLabels={passwordToggleLabels}
                          />
                          <button type="button" onClick={() => resetPassword(item.id)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white" disabled={busy || !passwordDraft[item.id]}>
                            {t.update}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className={`${panelClass} text-sm text-slate-600`}>
          {selectedEmployee ? (
            <p>
              {t.workingWith} <strong>{selectedEmployee.employee_code} - {selectedEmployee.full_name}</strong>.
            </p>
          ) : (
            <p>{t.noEmployeeSelected}</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default WorkspacePage;
