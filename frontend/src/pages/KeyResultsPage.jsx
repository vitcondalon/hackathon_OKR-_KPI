import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { keyResultsApi } from '../api/keyResultsApi';
import { objectivesApi } from '../api/objectivesApi';
import { percent } from '../utils/format';
import { KEY_RESULT_STATUS_OPTIONS } from '../utils/labels';

export default function KeyResultsPage() {
  const [objectiveOptions, setObjectiveOptions] = useState([]);

  useEffect(() => {
    objectivesApi
      .list()
      .then((data) => setObjectiveOptions((data || []).map((item) => ({ label: item.title, value: String(item.id) }))))
      .catch(() => setObjectiveOptions([]));
  }, []);

  return (
    <AppLayout title="Key Results" description="Theo dõi kết quả đo lường được và cập nhật nhanh hơn với giao diện rõ ràng.">
      <EntityCrudPage
        title="Key Result"
        description="Quản lý kết quả đo lường cho từng mục tiêu"
        fields={[
          { name: 'objective_id', label: 'Mục tiêu', type: 'select', required: true, options: objectiveOptions },
          { name: 'title', label: 'Tiêu đề', required: true },
          { name: 'description', label: 'Mô tả', type: 'textarea' },
          { name: 'start_value', label: 'Giá trị bắt đầu', type: 'number', required: true },
          { name: 'target_value', label: 'Giá trị mục tiêu', type: 'number', required: true },
          { name: 'current_value', label: 'Giá trị hiện tại', type: 'number', required: true },
          { name: 'unit', label: 'Đơn vị' },
          { name: 'status', label: 'Trạng thái', type: 'select', required: true, options: KEY_RESULT_STATUS_OPTIONS }
        ]}
        columns={[
          { key: 'objective_title', label: 'Mục tiêu' },
          { key: 'title', label: 'Tiêu đề' },
          { key: 'target_value', label: 'Mục tiêu' },
          { key: 'current_value', label: 'Hiện tại' },
          {
            key: 'progress',
            label: 'Tiến trình',
            render: (row) => (
              <div className="min-w-[150px]">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700">{percent(row.progress || 0)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-sky-500" style={{ width: percent(row.progress || 0) }} />
                </div>
              </div>
            )
          },
          { key: 'status', label: 'Trạng thái' }
        ]}
        loadItems={keyResultsApi.list}
        createItem={keyResultsApi.create}
        updateItem={keyResultsApi.update}
        deleteItem={keyResultsApi.remove}
      />
    </AppLayout>
  );
}
