import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { kpiApi } from '../api/kpiApi';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';
import { cyclesApi } from '../api/cyclesApi';
import { percent } from '../utils/format';
import { KPI_TYPE_OPTIONS, OBJECTIVE_STATUS_OPTIONS, scopeLabel } from '../utils/labels';
import { useAuth } from '../contexts/AuthContext';

function normalizeKpiPayload(payload, user, isEmployee) {
  const normalized = { ...payload };
  const type = String(normalized.type || normalized.scope_type || (isEmployee ? 'employee' : 'employee'));

  normalized.type = type;
  normalized.scope_type = type;

  if (isEmployee) {
    normalized.type = 'employee';
    normalized.scope_type = 'employee';
    normalized.owner_id = user?.id ? Number(user.id) : normalized.owner_id;
    normalized.owner_user_id = user?.id ? Number(user.id) : normalized.owner_user_id;
    normalized.department_id = null;
    return normalized;
  }

  if (type === 'employee') {
    normalized.department_id = null;
  } else {
    normalized.owner_id = null;
    normalized.owner_user_id = null;
  }

  return normalized;
}

export default function KPIPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [cycleOptions, setCycleOptions] = useState([]);

  useEffect(() => {
    const ownerPromise = isEmployee ? Promise.resolve([]) : usersApi.list();
    Promise.all([ownerPromise, departmentsApi.list(), cyclesApi.list()])
      .then(([users, departments, cycles]) => {
        setOwnerOptions((users || []).map((item) => ({ label: item.full_name, value: String(item.id) })));
        setDepartmentOptions((departments || []).map((item) => ({ label: item.name, value: String(item.id) })));
        setCycleOptions((cycles || []).map((item) => ({ label: item.name, value: String(item.id) })));
      })
      .catch(() => {
        setOwnerOptions([]);
        setDepartmentOptions([]);
        setCycleOptions([]);
      });
  }, [isEmployee]);

  const fields = useMemo(
    () => [
      ...(isEmployee ? [] : [{ name: 'type', label: 'Loại', type: 'select', required: true, options: KPI_TYPE_OPTIONS }]),
      { name: 'name', label: 'Tên KPI', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
      { name: 'target_value', label: 'Giá trị mục tiêu', type: 'number', required: true },
      { name: 'current_value', label: 'Giá trị hiện tại', type: 'number', required: true },
      { name: 'unit', label: 'Đơn vị đo (%, điểm, giờ...)' },
      { name: 'cycle_id', label: 'Chu kỳ', type: 'select', nullable: true, options: cycleOptions },
      ...(isEmployee ? [] : [{ name: 'owner_id', label: 'Người phụ trách (cho KPI Nhân viên)', type: 'select', nullable: true, options: ownerOptions }]),
      ...(isEmployee ? [] : [{ name: 'department_id', label: 'Phòng ban (cho KPI Phòng ban)', type: 'select', nullable: true, options: departmentOptions }]),
      { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: OBJECTIVE_STATUS_OPTIONS }
    ],
    [cycleOptions, departmentOptions, isEmployee, ownerOptions]
  );

  async function createKpi(payload) {
    return kpiApi.create(normalizeKpiPayload(payload, user, isEmployee));
  }

  async function updateKpi(id, payload) {
    return kpiApi.update(id, normalizeKpiPayload(payload, user, isEmployee));
  }

  return (
    <AppLayout
      title="Quản lý KPI"
      description={
        isEmployee
          ? 'Theo dõi KPI cá nhân của bạn theo chu kỳ, tiến trình và trạng thái.'
          : 'Theo dõi người phụ trách, giá trị hiện tại và trạng thái KPI trong một màn hình dễ quan sát hơn.'
      }
    >
      <EntityCrudPage
        title="KPI"
        description="Quản lý KPI theo nhân viên và phòng ban"
        fields={fields}
        columns={[
          { key: 'type', label: 'Loại', render: (row) => scopeLabel(row.type) },
          { key: 'name', label: 'Tên KPI' },
          { key: 'unit', label: 'Đơn vị' },
          { key: 'target_value', label: 'Mục tiêu' },
          { key: 'current_value', label: 'Hiện tại' },
          {
            key: 'progress',
            label: 'Tiến trình',
            render: (row) => (
              <div className="min-w-[150px]">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700">{percent(row.progress || 0)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: percent(row.progress || 0) }} />
                </div>
              </div>
            )
          },
          { key: 'status', label: 'Trạng thái' }
        ]}
        loadItems={kpiApi.list}
        createItem={createKpi}
        updateItem={updateKpi}
        deleteItem={kpiApi.remove}
      />
    </AppLayout>
  );
}
