export function roleLabel(role) {
  if (role === 'admin') return 'Quản trị viên';
  if (role === 'hr') return 'Nhân sự';
  if (role === 'manager') return 'Quản lý';
  if (role === 'employee') return 'Nhân viên';
  return role || '-';
}

export function statusLabel(status) {
  if (status === 'completed') return 'Hoàn thành';
  if (status === 'active') return 'Đang chạy';
  if (status === 'on_track') return 'Đúng tiến độ';
  if (status === 'planning') return 'Lên kế hoạch';
  if (status === 'draft') return 'Nhập liệu';
  if (status === 'pending') return 'Đang chờ';
  if (status === 'closed') return 'Đã đóng';
  if (status === 'at_risk') return 'Rủi ro';
  if (status === 'cancelled') return 'Đã hủy';
  return status || '-';
}

export function scopeLabel(value) {
  if (value === 'department') return 'Phòng ban';
  if (value === 'employee') return 'Nhân viên';
  return value || '-';
}

export const OBJECTIVE_STATUS_OPTIONS = [
  { label: statusLabel('draft'), value: 'draft' },
  { label: statusLabel('active'), value: 'active' },
  { label: statusLabel('completed'), value: 'completed' },
  { label: statusLabel('on_track'), value: 'on_track' },
  { label: statusLabel('at_risk'), value: 'at_risk' }
];

export const KEY_RESULT_STATUS_OPTIONS = [
  { label: statusLabel('draft'), value: 'draft' },
  { label: statusLabel('active'), value: 'active' },
  { label: statusLabel('completed'), value: 'completed' },
  { label: statusLabel('at_risk'), value: 'at_risk' }
];

export const CYCLE_STATUS_OPTIONS = [
  { label: statusLabel('planning'), value: 'planning' },
  { label: statusLabel('active'), value: 'active' },
  { label: statusLabel('closed'), value: 'closed' }
];

export const KPI_TYPE_OPTIONS = [
  { label: scopeLabel('employee'), value: 'employee' },
  { label: scopeLabel('department'), value: 'department' }
];
