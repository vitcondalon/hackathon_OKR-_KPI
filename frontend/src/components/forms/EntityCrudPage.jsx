import { useEffect, useMemo, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import DataTable from '../tables/DataTable';
import { apiErrorMessage } from '../../api/helpers';
import { normalizeDateDisplay, toDatePayloadValue } from '../../utils/format';

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

    if (field.type === 'date') {
      payload[field.name] = toDatePayloadValue(value);
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

function inferHighlightValue(items, columns) {
  if (!Array.isArray(items) || items.length === 0) return '0';
  const statusColumn = columns.find((column) => String(column.key).toLowerCase() === 'status');
  if (!statusColumn) return String(items.length);
  const liveCount = items.filter((item) => ['active', 'on_track', 'planning'].includes(String(item.status || '').toLowerCase())).length;
  return String(liveCount);
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
  canDelete = true,
  canUpdate = true,
  canCreate = true
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

  const stats = useMemo(
    () => [
      { label: `Tổng ${title}`, value: items.length, tone: 'text-slate-900' },
      { label: 'Đang hiển thị', value: filteredItems.length, tone: 'text-brand-600' },
      { label: 'Đang hoạt động', value: inferHighlightValue(items, columns), tone: 'text-emerald-600' }
    ],
    [columns, filteredItems.length, items, title]
  );

  const hasActions = canUpdate || canDelete;

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const data = await loadItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiErrorMessage(err, `Không thể tải dữ liệu ${title}`));
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
        return;
      }

      if (field.type === 'date') {
        next[field.name] = normalizeDateDisplay(value);
        return;
      }

      next[field.name] = value ?? '';
    });
    if ('password' in next) next.password = '';
    setForm(next);
    setEditingId(item.id);
  }

  async function submit(event) {
    event.preventDefault();
    if (!canCreate && !editingId) return;
    if (!canUpdate && editingId) return;

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
      setError(apiErrorMessage(err, 'Không thể lưu dữ liệu'));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return;
    try {
      await deleteItem(id);
      if (editingId === id) resetForm();
      await refresh();
    } catch (err) {
      setError(apiErrorMessage(err, 'Không thể xóa bản ghi'));
    }
  }

  return (
    <div className="space-y-5 ui-page-enter">
      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="rounded-[1.6rem]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className={`mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl ${item.tone}`}>{item.value}</p>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[400px_minmax(0,1fr)]">
        <Card
          title={editingId ? `Cập nhật ${title}` : `Tạo ${title}`}
          subtitle={description}
          className="h-fit"
          actions={editingId ? <span className="status-badge border-amber-200 bg-amber-50 text-amber-700">Đang sửa</span> : null}
        >
          {canCreate || canUpdate ? (
            <form onSubmit={submit} className="space-y-4">
              {formFields.map((field) => (
                <label key={field.name} className="block space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      value={form[field.name]}
                      required={Boolean(field.required && !editingId)}
                      onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={form[field.name]}
                      required={Boolean(field.required && !editingId)}
                      onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    >
                      <option value="">Chọn {field.label}</option>
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <span className="text-sm text-slate-600">Bật trường này</span>
                      <input
                        type="checkbox"
                        checked={Boolean(form[field.name])}
                        onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-brand-500"
                      />
                    </div>
                  ) : field.type === 'date' ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/yyyy"
                      value={form[field.name]}
                      required={Boolean(field.required && !editingId)}
                      onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                      onBlur={(event) => setForm((prev) => ({ ...prev, [field.name]: normalizeDateDisplay(event.target.value) }))}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={form[field.name]}
                      step={field.type === 'number' ? '0.01' : undefined}
                      required={Boolean(field.required && !editingId)}
                      onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))}
                    />
                  )}
                </label>
              ))}

              {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Xóa form
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
              Vai trò hiện tại chỉ có quyền xem.
            </div>
          )}
        </Card>

        <Card
          title={`Danh sách ${title}`}
          subtitle="Dữ liệu API thực tế để theo dõi và thao tác nhanh"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={refresh}>
                Tải lại
              </Button>
              <span className="status-badge border-slate-200 bg-white text-slate-600">{filteredItems.length} bản ghi</span>
            </div>
          }
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <input
                placeholder={`Tìm ${title.toLowerCase()} theo cột đang hiển thị...`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="max-w-xl w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.map((item) => (
                <span key={item.label} className="status-badge border-slate-200 bg-slate-50 text-slate-600">
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredItems}
              emptyLabel={`Không có bản ghi ${title.toLowerCase()} phù hợp với bộ lọc hiện tại`}
              actions={
                hasActions
                  ? (row) => (
                      <div className="flex flex-wrap gap-2">
                        {canUpdate ? (
                          <Button type="button" variant="ghost" className="px-3 py-2 text-xs" onClick={() => startEdit(row)}>
                            Sửa
                          </Button>
                        ) : null}
                        {canDelete ? (
                          <Button type="button" variant="danger" className="px-3 py-2 text-xs" onClick={() => remove(row.id)}>
                            Xóa
                          </Button>
                        ) : null}
                      </div>
                    )
                  : null
              }
            />
          )}
        </Card>
      </div>
    </div>
  );
}
