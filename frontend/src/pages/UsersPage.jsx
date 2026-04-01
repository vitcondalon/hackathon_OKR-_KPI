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
    <AppLayout title="Quản lý người dùng" description="Quản lý vai trò, kích hoạt tài khoản và phòng ban trong một màn hình rõ ràng hơn.">
      <EntityCrudPage
        title="Người dùng"
        description="Quản lý người dùng, vai trò và phòng ban"
        fields={[
          { name: 'full_name', label: 'Họ và tên', required: true },
          { name: 'username', label: 'Tên đăng nhập', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
          {
            name: 'role',
            label: 'Vai trò',
            type: 'select',
            required: true,
            options: [
              { label: 'Quản trị viên', value: 'admin' },
              { label: 'Quản lý', value: 'manager' },
              { label: 'Nhân viên', value: 'employee' }
            ]
          },
          {
            name: 'department_id',
            label: 'Phòng ban',
            type: 'select',
            nullable: true,
            options: departmentOptions
          },
          { name: 'is_active', label: 'Kích hoạt', type: 'checkbox' }
        ]}
        columns={[
          { key: 'full_name', label: 'Họ và tên' },
          { key: 'username', label: 'Tên đăng nhập' },
          { key: 'email', label: 'Email' },
          {
            key: 'role',
            label: 'Vai trò',
            render: (row) => {
              if (row.role === 'admin') return 'Quản trị viên';
              if (row.role === 'manager') return 'Quản lý';
              if (row.role === 'employee') return 'Nhân viên';
              return row.role;
            }
          },
          { key: 'department_name', label: 'Phòng ban' },
          { key: 'is_active', label: 'Kích hoạt', render: (row) => (row.is_active ? 'Có' : 'Không') }
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
