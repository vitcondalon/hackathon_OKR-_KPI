import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { objectivesApi } from '../api/objectivesApi';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';
import { cyclesApi } from '../api/cyclesApi';

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
    <AppLayout title="Objectives">
      <EntityCrudPage
        title="Objective"
        description="Track objective owners, cycle, and status"
        fields={[
          { name: 'title', label: 'Title', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'owner_id', label: 'Owner', type: 'select', required: true, options: ownerOptions },
          { name: 'department_id', label: 'Department', type: 'select', nullable: true, options: departmentOptions },
          { name: 'cycle_id', label: 'Cycle', type: 'select', required: true, options: cycleOptions },
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
          },
          { name: 'progress', label: 'Progress', type: 'number' }
        ]}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'owner_name', label: 'Owner' },
          { key: 'department_name', label: 'Department' },
          { key: 'cycle_name', label: 'Cycle' },
          { key: 'status', label: 'Status' },
          { key: 'progress', label: 'Progress' }
        ]}
        loadItems={objectivesApi.list}
        createItem={objectivesApi.create}
        updateItem={objectivesApi.update}
        deleteItem={objectivesApi.remove}
      />
    </AppLayout>
  );
}
