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
    <AppLayout title="Quan ly phong ban" description="Sap xep phong ban, nguoi phu trach, va trach nhiem ro rang hon.">
      <EntityCrudPage
        title="Phong ban"
        description="Tao moi va quan ly phong ban"
        fields={[
          { name: 'name', label: 'Ten phong ban', required: true },
          { name: 'description', label: 'Mo ta', type: 'textarea' },
          { name: 'manager_id', label: 'Quan ly', type: 'select', nullable: true, options: managerOptions }
        ]}
        columns={[
          { key: 'name', label: 'Ten phong ban' },
          { key: 'description', label: 'Mo ta' },
          { key: 'manager_name', label: 'Quan ly' }
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
