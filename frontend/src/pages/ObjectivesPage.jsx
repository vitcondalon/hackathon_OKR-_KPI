import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { objectivesApi } from '../api/objectivesApi';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';
import { cyclesApi } from '../api/cyclesApi';
import { percent } from '../utils/format';

export default function ObjectivesPage() {
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
    <AppLayout title="Muc tieu" description="Theo doi nguoi phu trach, chu ky, va tien trinh muc tieu trong mot giao dien gon gang hon.">
      <EntityCrudPage
        title="Muc tieu"
        description="Quan ly muc tieu, nguoi phu trach, chu ky, va trang thai"
        fields={[
          { name: 'title', label: 'Tieu de', required: true },
          { name: 'description', label: 'Mo ta', type: 'textarea' },
          { name: 'owner_id', label: 'Nguoi phu trach', type: 'select', required: true, options: ownerOptions },
          { name: 'department_id', label: 'Phong ban', type: 'select', nullable: true, options: departmentOptions },
          { name: 'cycle_id', label: 'Chu ky', type: 'select', required: true, options: cycleOptions },
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
          },
          { name: 'progress', label: 'Tien trinh', type: 'number' }
        ]}
        columns={[
          { key: 'title', label: 'Tieu de' },
          { key: 'owner_name', label: 'Nguoi phu trach' },
          { key: 'department_name', label: 'Phong ban' },
          { key: 'cycle_name', label: 'Chu ky' },
          { key: 'status', label: 'Trang thai' },
          {
            key: 'progress',
            label: 'Tien trinh',
            render: (row) => (
              <div className="min-w-[150px]">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700">{percent(row.progress || 0)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-brand-500" style={{ width: percent(row.progress || 0) }} />
                </div>
              </div>
            )
          }
        ]}
        loadItems={objectivesApi.list}
        createItem={objectivesApi.create}
        updateItem={objectivesApi.update}
        deleteItem={objectivesApi.remove}
      />
    </AppLayout>
  );
}
