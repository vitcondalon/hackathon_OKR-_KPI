import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { departmentsApi } from '../api/departmentsApi';
import { usersApi } from '../api/usersApi';
import { useAuth } from '../contexts/AuthContext';

export default function DepartmentsPage() {
  const [managerOptions, setManagerOptions] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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
    <AppLayout title="Quản lý phòng ban" description="Sắp xếp phòng ban, người phụ trách và trách nhiệm rõ ràng hơn.">
      <EntityCrudPage
        title="Phòng ban"
        description="Tạo mới và quản lý phòng ban"
        fields={[
          { name: 'name', label: 'Tên phòng ban', required: true },
          { name: 'description', label: 'Mô tả', type: 'textarea' },
          { name: 'manager_id', label: 'Quản lý', type: 'select', nullable: true, options: managerOptions }
        ]}
        columns={[
          { key: 'name', label: 'Tên phòng ban' },
          { key: 'description', label: 'Mô tả' },
          { key: 'manager_name', label: 'Quản lý' }
        ]}
        loadItems={departmentsApi.list}
        createItem={departmentsApi.create}
        updateItem={departmentsApi.update}
        deleteItem={departmentsApi.remove}
        canDelete={isAdmin}
      />
    </AppLayout>
  );
}
