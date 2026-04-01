import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { checkinsApi } from '../api/checkinsApi';
import { keyResultsApi } from '../api/keyResultsApi';
import { kpiApi } from '../api/kpiApi';

export default function CheckinsPage() {
  const [keyResultOptions, setKeyResultOptions] = useState([]);
  const [kpiOptions, setKpiOptions] = useState([]);

  useEffect(() => {
    Promise.all([keyResultsApi.list(), kpiApi.list()])
      .then(([keyResults, kpis]) => {
        setKeyResultOptions((keyResults || []).map((item) => ({ label: item.title, value: String(item.id) })));
        setKpiOptions((kpis || []).map((item) => ({ label: item.name, value: String(item.id) })));
      })
      .catch(() => {
        setKeyResultOptions([]);
        setKpiOptions([]);
      });
  }, []);

  const metricTypeOptions = useMemo(() => [
    { label: 'Key Result', value: 'key_result' },
    { label: 'KPI', value: 'kpi' }
  ], []);

  async function createCheckin(payload) {
    const metricType = payload.metric_type || 'key_result';
    const normalized = {
      ...payload,
      key_result_id: metricType === 'key_result' ? payload.key_result_id || undefined : undefined,
      kpi_metric_id: metricType === 'kpi' ? payload.kpi_metric_id || undefined : undefined
    };
    delete normalized.metric_type;
    return checkinsApi.create(normalized);
  }

  function normalizeRow(item) {
    return {
      ...item,
      value: item.value_after ?? item.value ?? '-',
      progress: item.progress_percent ?? item.progress ?? '-',
      metric_name: item.key_result_title || item.kpi_name || '-'
    };
  }

  return (
    <AppLayout title="Check-in" description="Cập nhật tiến độ nhanh và theo dõi lịch sử gần đây để dễ đối chiếu.">
      <EntityCrudPage
        title="Check-in"
        description="Gửi cập nhật tiến độ và ghi chú"
        fields={[
          { name: 'metric_type', label: 'Loại check-in', type: 'select', required: true, options: metricTypeOptions },
          { name: 'key_result_id', label: 'Key Result', type: 'select', nullable: true, options: keyResultOptions },
          { name: 'kpi_metric_id', label: 'KPI', type: 'select', nullable: true, options: kpiOptions },
          { name: 'value', label: 'Giá trị', type: 'number' },
          { name: 'progress', label: 'Tiến trình (%)', type: 'number' },
          { name: 'note', label: 'Ghi chú', type: 'textarea', required: true }
        ]}
        columns={[
          { key: 'checkin_type', label: 'Loại' },
          { key: 'metric_name', label: 'Chỉ số' },
          { key: 'value', label: 'Giá trị' },
          { key: 'progress', label: 'Tiến trình' },
          { key: 'note', label: 'Ghi chú' },
          { key: 'user_name', label: 'Người tạo' },
          { key: 'created_at', label: 'Thời gian tạo', render: (row) => (row.created_at ? new Date(row.created_at).toLocaleString('vi-VN') : '-') }
        ]}
        loadItems={async () => {
          const items = await checkinsApi.list();
          return (items || []).map(normalizeRow);
        }}
        createItem={createCheckin}
        updateItem={null}
        deleteItem={null}
        canUpdate={false}
        canDelete={false}
      />
    </AppLayout>
  );
}
