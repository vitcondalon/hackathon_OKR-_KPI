import { formatValue } from '../../utils/format';
import { roleLabel, scopeLabel, statusLabel } from '../../utils/labels';

function statusTone(value) {
  const text = String(value || '').toLowerCase();
  if (['completed', 'success', 'active', 'on_track', 'true'].includes(text)) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (['planning', 'draft', 'warning', 'pending', 'closed'].includes(text)) return 'border-amber-200 bg-amber-50 text-amber-700';
  if (['at_risk', 'cancelled', 'error', 'false'].includes(text)) return 'border-red-200 bg-red-50 text-red-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function mapBadgeLabel(key, value) {
  const raw = String(value ?? '-');
  if (key === 'is_active') return value ? 'Đang hoạt động' : 'Ngừng hoạt động';
  if (key === 'status') return statusLabel(raw);
  if (key === 'role') return roleLabel(raw);
  if (key === 'scope_type' || key === 'type') return scopeLabel(raw);
  return raw.replaceAll('_', ' ');
}

function maybeBadge(colKey, value) {
  const key = String(colKey || '').toLowerCase();
  if (!['status', 'role', 'is_active', 'type', 'scope_type'].includes(key)) return null;
  const toneValue = key === 'is_active' ? (value ? 'active' : 'inactive') : String(value ?? '-');
  return <span className={`status-badge ${statusTone(toneValue)}`}>{mapBadgeLabel(key, value)}</span>;
}

export default function DataTable({ columns, data, emptyLabel = 'Không tìm thấy bản ghi nào', actions }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/95">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500">
              {columns.map((col) => <th key={col.key} className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em]">{col.label}</th>)}
              {actions ? <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em]">Thao tác</th> : null}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={String(row.id)} className={`border-b border-slate-100 align-top transition hover:bg-brand-50/50 ${index % 2 === 0 ? 'bg-white/95' : 'bg-slate-50/40'}`}>
                {columns.map((col) => <td key={col.key} className="px-4 py-4 text-slate-700">{col.render ? col.render(row) : maybeBadge(col.key, row[col.key]) || formatValue(row[col.key])}</td>)}
                {actions ? <td className="px-4 py-4">{actions(row)}</td> : null}
              </tr>
            ))}
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-14 text-center">
                  <div className="mx-auto max-w-md rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-8">
                    <p className="text-sm font-semibold text-slate-700">{emptyLabel}</p>
                    <p className="mt-2 text-sm text-slate-500">Thử từ khóa khác, tải lại dữ liệu hoặc tạo bản ghi mới.</p>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
