import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { keyResultsApi } from '../api/keyResultsApi';
import { objectivesApi } from '../api/objectivesApi';

export default function KeyResultsPage() {
  const [objectiveOptions, setObjectiveOptions] = useState([]);

  useEffect(() => {
    objectivesApi
      .list()
      .then((data) => setObjectiveOptions((data || []).map((item) => ({ label: item.title, value: String(item.id) }))))
      .catch(() => setObjectiveOptions([]));
  }, []);

  return (
    <AppLayout title="Key Results">
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
          { key: 'progress', label: 'Progress' },
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
