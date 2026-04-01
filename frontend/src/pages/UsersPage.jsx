import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { usersApi } from '../api/usersApi';
import { departmentsApi } from '../api/departmentsApi';
import { useAuth } from '../contexts/AuthContext';

export default function UsersPage() {
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    departmentsApi
      .list()
      .then((data) => {
        setDepartmentOptions((data || []).map((dep) => ({ label: dep.name, value: String(dep.id) })));
      })
      .catch(() => setDepartmentOptions([]));
  }, []);

  return (
    <AppLayout title="Quan ly nguoi dung" description="Quan ly vai tro, kich hoat tai khoan va phong ban trong mot man hinh ro rang hon.">
      <EntityCrudPage
        title="Nguoi dung"
        description="Quan ly nguoi dung, vai tro, va phong ban"
        fields={[
          { name: 'full_name', label: 'Ho va ten', required: true },
          { name: 'username', label: 'Username', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Mat khau', type: 'password', required: true },
          {
            name: 'role',
            label: 'Vai tro',
            type: 'select',
            required: true,
            options: [
              { label: 'Quan tri vien', value: 'admin' },
              { label: 'Quan ly', value: 'manager' },
              { label: 'Nhan vien', value: 'employee' }
            ]
          },
          {
            name: 'department_id',
            label: 'Phong ban',
            type: 'select',
            nullable: true,
            options: departmentOptions
          },
          { name: 'is_active', label: 'Kich hoat', type: 'checkbox' }
        ]}
        columns={[
          { key: 'full_name', label: 'Ho va ten' },
          { key: 'username', label: 'Username' },
          { key: 'email', label: 'Email' },
          {
            key: 'role',
            label: 'Vai tro',
            render: (row) => {
              if (row.role === 'admin') return 'Quan tri vien';
              if (row.role === 'manager') return 'Quan ly';
              if (row.role === 'employee') return 'Nhan vien';
              return row.role;
            }
          },
          { key: 'department_name', label: 'Phong ban' },
          { key: 'is_active', label: 'Kich hoat', render: (row) => (row.is_active ? 'Co' : 'Khong') }
        ]}
        loadItems={usersApi.list}
        createItem={usersApi.create}
        updateItem={usersApi.update}
        deleteItem={usersApi.remove}
        canCreate={isAdmin}
        canUpdate={isAdmin}
        canDelete={isAdmin}
      />
    </AppLayout>
  );
}
