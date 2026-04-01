import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { keyResultsApi } from '../api/keyResultsApi';
import { objectivesApi } from '../api/objectivesApi';
import { percent } from '../utils/format';

export default function KeyResultsPage() {
  const [objectiveOptions, setObjectiveOptions] = useState([]);

  useEffect(() => {
    objectivesApi
      .list()
      .then((data) => setObjectiveOptions((data || []).map((item) => ({ label: item.title, value: String(item.id) }))))
      .catch(() => setObjectiveOptions([]));
  }, []);

  return (
    <AppLayout title="Key Results" description="Theo doi ket qua do luong duoc va cap nhat nhanh hon voi giao dien ro rang.">
      <EntityCrudPage
        title="Key Result"
        description="Quan ly ket qua do luong cho tung muc tieu"
        fields={[
          { name: 'objective_id', label: 'Muc tieu', type: 'select', required: true, options: objectiveOptions },
          { name: 'title', label: 'Tieu de', required: true },
          { name: 'description', label: 'Mo ta', type: 'textarea' },
          { name: 'start_value', label: 'Gia tri bat dau', type: 'number', required: true },
          { name: 'target_value', label: 'Gia tri muc tieu', type: 'number', required: true },
          { name: 'current_value', label: 'Gia tri hien tai', type: 'number', required: true },
          { name: 'unit', label: 'Don vi' },
          {
            name: 'status',
            label: 'Trang thai',
            type: 'select',
            required: true,
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Completed', value: 'completed' },
              { label: 'At risk', value: 'at_risk' }
            ]
          }
        ]}
        columns={[
          { key: 'objective_title', label: 'Muc tieu' },
          { key: 'title', label: 'Tieu de' },
          { key: 'target_value', label: 'Muc tieu' },
          { key: 'current_value', label: 'Hien tai' },
          {
            key: 'progress',
            label: 'Tien trinh',
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
          { key: 'status', label: 'Trang thai' }
        ]}
        loadItems={keyResultsApi.list}
        createItem={keyResultsApi.create}
        updateItem={keyResultsApi.update}
        deleteItem={keyResultsApi.remove}
      />
    </AppLayout>
  );
}
