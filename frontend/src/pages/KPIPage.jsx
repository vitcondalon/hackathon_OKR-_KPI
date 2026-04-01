import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { kpiApi } from '../api/kpiApi';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';
import { cyclesApi } from '../api/cyclesApi';
import { percent } from '../utils/format';

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
    <AppLayout title="Quan ly KPI" description="Theo doi nguoi phu trach, gia tri hien tai, va trang thai KPI trong mot man hinh de quan sat hon.">
      <EntityCrudPage
        title="KPI"
        description="Quan ly KPI theo nhan vien va phong ban"
        fields={[
          {
            name: 'type',
            label: 'Loai',
            type: 'select',
            required: true,
            options: [
              { label: 'Nhan vien', value: 'employee' },
              { label: 'Phong ban', value: 'department' }
            ]
          },
          { name: 'name', label: 'Ten KPI', required: true },
          { name: 'description', label: 'Mo ta', type: 'textarea' },
          { name: 'target_value', label: 'Gia tri muc tieu', type: 'number', required: true },
          { name: 'current_value', label: 'Gia tri hien tai', type: 'number', required: true },
          { name: 'unit', label: 'Don vi' },
          { name: 'cycle_id', label: 'Chu ky', type: 'select', nullable: true, options: cycleOptions },
          { name: 'owner_id', label: 'Nguoi phu trach', type: 'select', nullable: true, options: ownerOptions },
          { name: 'department_id', label: 'Phong ban', type: 'select', nullable: true, options: departmentOptions },
          {
            name: 'status',
            label: 'Trang thai',
            type: 'select',
            required: true,
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Completed', value: 'completed' },
              { label: 'On track', value: 'on_track' },
              { label: 'At risk', value: 'at_risk' }
            ]
          }
        ]}
        columns={[
          {
            key: 'type',
            label: 'Loai',
            render: (row) => (row.type === 'department' ? 'Phong ban' : 'Nhan vien')
          },
          { key: 'name', label: 'Ten KPI' },
          { key: 'target_value', label: 'Muc tieu' },
          { key: 'current_value', label: 'Hien tai' },
          {
            key: 'progress',
            label: 'Tien trinh',
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
          { key: 'status', label: 'Trang thai' }
        ]}
        loadItems={kpiApi.list}
        createItem={kpiApi.create}
        updateItem={kpiApi.update}
        deleteItem={kpiApi.remove}
      />
    </AppLayout>
  );
}
