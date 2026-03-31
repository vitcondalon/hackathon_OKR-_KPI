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
    <AppLayout title="Key Results" description="Keep measurable outcomes visible and update them with less friction.">
      <EntityCrudPage
        title="Key Result"
        description="Define measurable outcomes under each objective"
        fields={[
          { name: 'objective_id', label: 'Objective', type: 'select', required: true, options: objectiveOptions },
          { name: 'title', label: 'Title', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'start_value', label: 'Start value', type: 'number', required: true },
          { name: 'target_value', label: 'Target value', type: 'number', required: true },
          { name: 'current_value', label: 'Current value', type: 'number', required: true },
          { name: 'unit', label: 'Unit' },
          {
            name: 'status',
            label: 'Status',
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
          { key: 'objective_title', label: 'Objective' },
          { key: 'title', label: 'Title' },
          { key: 'target_value', label: 'Target' },
          { key: 'current_value', label: 'Current' },
          {
            key: 'progress',
            label: 'Progress',
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
          { key: 'status', label: 'Status' }
        ]}
        loadItems={keyResultsApi.list}
        createItem={keyResultsApi.create}
        updateItem={keyResultsApi.update}
        deleteItem={keyResultsApi.remove}
      />
    </AppLayout>
  );
}
