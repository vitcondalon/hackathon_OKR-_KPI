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
    <AppLayout title="KPI Management" description="Monitor KPI ownership, current values, and status with a cleaner decision-friendly layout.">
      <EntityCrudPage
        title="KPI"
        description="Employee and department KPIs with progress tracking"
        fields={[
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { label: 'Employee', value: 'employee' },
              { label: 'Department', value: 'department' }
            ]
          },
          { name: 'name', label: 'Name', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'target_value', label: 'Target value', type: 'number', required: true },
          { name: 'current_value', label: 'Current value', type: 'number', required: true },
          { name: 'weight', label: 'Weight', type: 'number', required: true },
          { name: 'unit', label: 'Unit' },
          { name: 'cycle_id', label: 'Cycle', type: 'select', nullable: true, options: cycleOptions },
          { name: 'owner_id', label: 'Owner', type: 'select', nullable: true, options: ownerOptions },
          { name: 'department_id', label: 'Department', type: 'select', nullable: true, options: departmentOptions },
          {
            name: 'status',
            label: 'Status',
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
          { key: 'type', label: 'Type' },
          { key: 'name', label: 'Name' },
          { key: 'target_value', label: 'Target' },
          { key: 'current_value', label: 'Current' },
          {
            key: 'progress',
            label: 'Progress',
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
          { key: 'status', label: 'Status' }
        ]}
        loadItems={kpiApi.list}
        createItem={kpiApi.create}
        updateItem={kpiApi.update}
        deleteItem={kpiApi.remove}
      />
    </AppLayout>
  );
}
