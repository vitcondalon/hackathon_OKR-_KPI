import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { cyclesApi } from '../api/cyclesApi';

export default function CyclesPage() {
  return (
    <AppLayout title="OKR Cycles">
      <EntityCrudPage
        title="Cycle"
        description="Manage planning, active, and closed cycles"
        fields={[
          { name: 'name', label: 'Cycle name', required: true },
          { name: 'start_date', label: 'Start date', type: 'date', required: true },
          { name: 'end_date', label: 'End date', type: 'date', required: true },
          {
            name: 'status',
            label: 'Status',
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
          { key: 'name', label: 'Name' },
          { key: 'start_date', label: 'Start date' },
          { key: 'end_date', label: 'End date' },
          { key: 'status', label: 'Status' }
        ]}
        loadItems={cyclesApi.list}
        createItem={cyclesApi.create}
        updateItem={cyclesApi.update}
        deleteItem={async () => {}}
        canDelete={false}
      />
    </AppLayout>
  );
}
