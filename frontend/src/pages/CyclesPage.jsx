import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { cyclesApi } from '../api/cyclesApi';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('vi-VN');
}

export default function CyclesPage() {
  return (
    <AppLayout title="Chu ky OKR" description="Quan ly chu ky lap ke hoach va giu tien do bao cao ro rang cho toan bo doi ngu.">
      <EntityCrudPage
        title="Chu ky"
        description="Quan ly chu ky planning, active, closed"
        fields={[
          { name: 'name', label: 'Ten chu ky', required: true },
          { name: 'start_date', label: 'Ngay bat dau', type: 'date', required: true },
          { name: 'end_date', label: 'Ngay ket thuc', type: 'date', required: true },
          {
            name: 'status',
            label: 'Trang thai',
            type: 'select',
            required: true,
            options: [
              { label: 'Planning', value: 'planning' },
              { label: 'Active', value: 'active' },
              { label: 'Closed', value: 'closed' }
            ]
          }
        ]}
        columns={[
          { key: 'name', label: 'Ten chu ky' },
          { key: 'start_date', label: 'Ngay bat dau', render: (row) => formatDate(row.start_date) },
          { key: 'end_date', label: 'Ngay ket thuc', render: (row) => formatDate(row.end_date) },
          { key: 'status', label: 'Trang thai' }
        ]}
        loadItems={cyclesApi.list}
        createItem={cyclesApi.create}
        updateItem={cyclesApi.update}
        deleteItem={cyclesApi.remove}
      />
    </AppLayout>
  );
}
