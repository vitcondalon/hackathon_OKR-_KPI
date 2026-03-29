import { useEffect, useMemo, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import DataTable from '../tables/DataTable';
import { apiErrorMessage } from '../../api/helpers';

function toPayload(fields, form, mode) {
  const payload = {};
  fields.forEach((field) => {
    const value = form[field.name];

    if (field.type === 'checkbox') {
      payload[field.name] = Boolean(value);
      return;
    }

    if (value === '' || value === null || value === undefined) {
      if (mode === 'edit' && !field.alwaysSend) return;
      if (field.nullable) payload[field.name] = null;
      return;
    }

    if (field.type === 'number') {
      payload[field.name] = Number(value);
      return;
    }

    payload[field.name] = value;
  });
  return payload;
}

function initialState(fields) {
  const state = {};
  fields.forEach((field) => {
    state[field.name] = field.type === 'checkbox' ? false : '';
  });
  return state;
}

export default function EntityCrudPage({
  title,
  description,
  fields,
  columns,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  canDelete = true
}) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialState(fields));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const formFields = useMemo(() => fields, [fields]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      columns.some((col) => {
        const raw = col.render ? null : item[col.key];
        return String(raw ?? '').toLowerCase().includes(q);
      })
    );
  }, [columns, items, search]);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const data = await loadItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiErrorMessage(err, `Cannot load ${title}`));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function resetForm() {
    setForm(initialState(fields));
    setEditingId(null);
  }

  function startEdit(item) {
    const next = initialState(fields);
    fields.forEach((field) => {
      const value = item[field.name];
      if (field.type === 'checkbox') {
        next[field.name] = Boolean(value);
      } else {
        next[field.name] = value ?? '';
      }
    });
    if ('password' in next) next.password = '';
    setForm(next);
    setEditingId(item.id);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(fields, form, editingId ? 'edit' : 'create');
      if (!editingId) {
        await createItem(payload);
      } else {
        await updateItem(editingId, payload);
      }
      resetForm();
      await refresh();
    } catch (err) {
      setError(apiErrorMessage(err, 'Cannot save data'));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteItem(id);
      if (editingId === id) resetForm();
      await refresh();
    } catch (err) {
      setError(apiErrorMessage(err, 'Cannot delete item'));
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr] ui-page-enter">
      <Card title={editingId ? `Edit ${title}` : `Create ${title}`} subtitle={description} className="h-fit">
        <form onSubmit={submit} className="space-y-3">
          {formFields.map((field) => (
            <label key={field.name} className="block space-y-1 text-sm">
              <span className="font-semibold text-slate-700">{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  rows={4}
                  value={form[field.name]}
                  required={Boolean(field.required && !editingId)}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                />
              ) : field.type === 'select' ? (
                <select
                  value={form[field.name]}
                  required={Boolean(field.required && !editingId)}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                >
                  <option value="">Select {field.label}</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.name])}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-brand-500"
                  />
                  <span className="text-sm text-slate-600">Enable</span>
                </div>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={form[field.name]}
                  step={field.type === 'number' ? '0.01' : undefined}
                  required={Boolean(field.required && !editingId)}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                />
              )}
            </label>
          ))}

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Clear</Button>
          </div>
        </form>
      </Card>

      <Card title={`${title} List`} subtitle="Live data from API">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {filteredItems.length} result(s)
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            emptyLabel={`No ${title} records`}
            actions={(row) => (
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="px-3 py-1.5" onClick={() => startEdit(row)}>
                  Edit
                </Button>
                {canDelete ? (
                  <Button type="button" variant="danger" className="px-3 py-1.5" onClick={() => remove(row.id)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
}
