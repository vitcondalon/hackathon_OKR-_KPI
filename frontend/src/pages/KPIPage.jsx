import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { kpiApi } from '../api/kpiApi';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';
import { cyclesApi } from '../api/cyclesApi';
import { percent } from '../utils/format';
import { KPI_TYPE_OPTIONS, OBJECTIVE_STATUS_OPTIONS, scopeLabel } from '../utils/labels';

export default function KPIPage() {
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [cycleOptions, setCycleOptions] = useState([]);

  useEffect(() => {
    Promise.all([usersApi.list(), departmentsApi.list(), cyclesApi.list()])
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
  }, []);

  return (
    <AppLayout title="Quản lý KPI" description="Theo dõi người phụ trách, giá trị hiện tại và trạng thái KPI trong một màn hình dễ quan sát hơn.">
      <EntityCrudPage
        title="KPI"
        description="Quản lý KPI theo nhân viên và phòng ban"
        fields={[
          { name: 'type', label: 'Loại', type: 'select', required: true, options: KPI_TYPE_OPTIONS },
          { name: 'name', label: 'Tên KPI', required: true },
          { name: 'description', label: 'Mô tả', type: 'textarea' },
          { name: 'target_value', label: 'Giá trị mục tiêu', type: 'number', required: true },
          { name: 'current_value', label: 'Giá trị hiện tại', type: 'number', required: true },
          { name: 'unit', label: 'Đơn vị' },
          { name: 'cycle_id', label: 'Chu kỳ', type: 'select', nullable: true, options: cycleOptions },
          { name: 'owner_id', label: 'Người phụ trách', type: 'select', nullable: true, options: ownerOptions },
          { name: 'department_id', label: 'Phòng ban', type: 'select', nullable: true, options: departmentOptions },
          { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: OBJECTIVE_STATUS_OPTIONS }
        ]}
        columns={[
          { key: 'type', label: 'Loại', render: (row) => scopeLabel(row.type) },
          { key: 'name', label: 'Tên KPI' },
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
        createItem={kpiApi.create}
        updateItem={kpiApi.update}
        deleteItem={kpiApi.remove}
      />
    </AppLayout>
  );
}
