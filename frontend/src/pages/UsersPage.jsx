import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';

export default function UsersPage() {
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    departmentsApi
      .list()
      .then((data) => {
        setDepartmentOptions((data || []).map((dep) => ({ label: dep.name, value: String(dep.id) })));
      })
      .catch(() => setDepartmentOptions([]));
  }, []);

  return (
    <AppLayout title="Users Management">
      <EntityCrudPage
        title="User"
        description="Manage users, role, and department assignment"
        fields={[
          { name: 'full_name', label: 'Full name', required: true },
          { name: 'username', label: 'Username', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'Manager', value: 'manager' },
              { label: 'Employee', value: 'employee' }
            ]
          },
          {
            name: 'department_id',
            label: 'Department',
            type: 'select',
            nullable: true,
            options: departmentOptions
          },
          { name: 'is_active', label: 'Active', type: 'checkbox' }
        ]}
        columns={[
          { key: 'full_name', label: 'Full name' },
          { key: 'username', label: 'Username' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'department_id', label: 'Department ID' },
          { key: 'is_active', label: 'Active', render: (row) => (row.is_active ? 'Yes' : 'No') }
        ]}
        loadItems={usersApi.list}
        createItem={usersApi.create}
        updateItem={usersApi.update}
        deleteItem={usersApi.remove}
      />
    </AppLayout>
  );
}
