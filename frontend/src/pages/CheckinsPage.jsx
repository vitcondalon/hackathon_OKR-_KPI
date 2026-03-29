import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import EntityCrudPage from '../components/forms/EntityCrudPage';
import { checkinsApi } from '../api/checkinsApi';
import { keyResultsApi } from '../api/keyResultsApi';

export default function CheckinsPage() {
  const [keyResultOptions, setKeyResultOptions] = useState([]);

  useEffect(() => {
    keyResultsApi
      .list()
      .then((data) => setKeyResultOptions((data || []).map((item) => ({ label: item.title, value: String(item.id) }))))
      .catch(() => setKeyResultOptions([]));
  }, []);

  return (
    <AppLayout title="Check-ins">
      <EntityCrudPage
        title="Check-in"
        description="Submit progress updates and notes"
        fields={[
          { name: 'key_result_id', label: 'Key result', type: 'select', required: true, options: keyResultOptions },
          { name: 'value', label: 'Value', type: 'number' },
          { name: 'progress', label: 'Progress', type: 'number' },
          { name: 'note', label: 'Note', type: 'textarea' }
        ]}
        columns={[
          { key: 'key_result_title', label: 'Key result' },
          { key: 'value', label: 'Value' },
          { key: 'progress', label: 'Progress' },
          { key: 'note', label: 'Note' },
          { key: 'user_name', label: 'Created by' },
          { key: 'created_at', label: 'Created at' }
        ]}
        loadItems={checkinsApi.list}
        createItem={checkinsApi.create}
        updateItem={async () => {}}
        deleteItem={async () => {}}
        canDelete={false}
      />
    </AppLayout>
  );
}
