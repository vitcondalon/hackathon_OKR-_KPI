import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { cyclesApi } from '../api/cyclesApi';
import { formatDateVN } from '../utils/format';
import { CYCLE_STATUS_OPTIONS } from '../utils/labels';

export default function CyclesPage() {
  return (
    <AppLayout title="Chu kỳ OKR" description="Quản lý chu kỳ lập kế hoạch và giữ tiến độ báo cáo rõ ràng cho toàn bộ đội ngũ.">
      <EntityCrudPage
        title="Chu kỳ"
        description="Quản lý chu kỳ theo các trạng thái lập kế hoạch, đang chạy và đã đóng"
        fields={[
          { name: 'name', label: 'Tên chu kỳ', required: true },
          { name: 'start_date', label: 'Ngày bắt đầu', type: 'date', required: true },
          { name: 'end_date', label: 'Ngày kết thúc', type: 'date', required: true },
          { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: CYCLE_STATUS_OPTIONS }
        ]}
        columns={[
          { key: 'name', label: 'Tên chu kỳ' },
          { key: 'start_date', label: 'Ngày bắt đầu', render: (row) => formatDateVN(row.start_date) },
          { key: 'end_date', label: 'Ngày kết thúc', render: (row) => formatDateVN(row.end_date) },
          { key: 'status', label: 'Trạng thái' }
        ]}
        loadItems={cyclesApi.list}
        createItem={cyclesApi.create}
        updateItem={cyclesApi.update}
        deleteItem={cyclesApi.remove}
      />
    </AppLayout>
  );
}
