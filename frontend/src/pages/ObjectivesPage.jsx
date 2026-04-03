import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { objectivesApi } from '../api/objectivesApi';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';
import { cyclesApi } from '../api/cyclesApi';
import { percent } from '../utils/format';
import { OBJECTIVE_STATUS_OPTIONS } from '../utils/labels';
import { useAuth } from '../contexts/AuthContext';

export default function ObjectivesPage() {
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

  const fields = [
    { name: 'title', label: 'Tiêu đề', required: true },
    { name: 'description', label: 'Mô tả', type: 'textarea' },
    ...(isEmployee ? [] : [{ name: 'owner_id', label: 'Người phụ trách', type: 'select', required: true, options: ownerOptions }]),
    ...(isEmployee ? [] : [{ name: 'department_id', label: 'Phòng ban', type: 'select', nullable: true, options: departmentOptions }]),
    { name: 'cycle_id', label: 'Chu kỳ', type: 'select', required: true, options: cycleOptions },
    { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: OBJECTIVE_STATUS_OPTIONS },
    { name: 'progress', label: 'Tiến trình', type: 'number' }
  ];

  return (
    <AppLayout
      title="Mục tiêu"
      description={
        isEmployee
          ? 'Theo dõi mục tiêu cá nhân theo chu kỳ, trạng thái và tiến trình.'
          : 'Theo dõi người phụ trách, chu kỳ và tiến trình mục tiêu trong một giao diện gọn gàng hơn.'
      }
    >
      <EntityCrudPage
        title="Mục tiêu"
        description="Quản lý mục tiêu, người phụ trách, chu kỳ và trạng thái"
        fields={fields}
        columns={[
          { key: 'title', label: 'Tiêu đề' },
          { key: 'owner_name', label: 'Người phụ trách' },
          { key: 'department_name', label: 'Phòng ban' },
          { key: 'cycle_name', label: 'Chu kỳ' },
          { key: 'status', label: 'Trạng thái' },
          {
            key: 'progress',
            label: 'Tiến trình',
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
