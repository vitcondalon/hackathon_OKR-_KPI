import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { departmentsApi } from '../api/departmentsApi';
import { usersApi } from '../api/usersApi';

export default function DepartmentsPage() {
  const [managerOptions, setManagerOptions] = useState([]);

  useEffect(() => {
    usersApi
      .list()
      .then((data) => {
        setManagerOptions(
          (data || [])
            .filter((item) => item.role === 'manager' || item.role === 'admin')
            .map((item) => ({ label: item.full_name, value: String(item.id) }))
        );
      })
      .catch(() => setManagerOptions([]));
  }, []);

  return (
    <AppLayout title="Departments Management" description="Organize departments, ownership, and accountability with fewer clicks.">
      <EntityCrudPage
        title="Department"
        description="Create and organize departments"
        fields={[
          { name: 'name', label: 'Department name', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'manager_id', label: 'Manager', type: 'select', nullable: true, options: managerOptions }
        ]}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
          { key: 'manager_name', label: 'Manager' }
        ]}
        loadItems={departmentsApi.list}
        createItem={departmentsApi.create}
        updateItem={departmentsApi.update}
        deleteItem={departmentsApi.remove}
      />
    </AppLayout>
  );
}
