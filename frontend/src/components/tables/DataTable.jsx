import { formatValue } from '../../utils/format';

function statusTone(value) {
  const text = String(value || '').toLowerCase();
  if (['completed', 'success', 'active', 'on_track', 'true'].includes(text)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (['planning', 'draft', 'warning', 'pending', 'closed'].includes(text)) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  if (['at_risk', 'cancelled', 'error', 'false'].includes(text)) {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function maybeBadge(colKey, value) {
  const key = String(colKey || '').toLowerCase();
  if (!['status', 'role', 'is_active', 'type', 'scope_type'].includes(key)) {
    return null;
  }
  const label = key === 'is_active' ? (value ? 'active' : 'inactive') : String(value ?? '-');
  return <span className={`status-badge ${statusTone(label)}`}>{label.replaceAll('_', ' ')}</span>;
}

export default function DataTable({ columns, data, emptyLabel = 'No records found', actions }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
        <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
            {columns.map((col) => (
                <th key={col.key} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">
                {col.label}
              </th>
            ))}
              {actions ? <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
              <tr key={String(row.id)} className="border-b border-slate-100 align-top transition hover:bg-brand-50/50">
              {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-slate-700">
                    {col.render
                      ? col.render(row)
                      : maybeBadge(col.key, row[col.key]) || formatValue(row[col.key])}
                </td>
              ))}
                {actions ? <td className="px-4 py-3.5">{actions(row)}</td> : null}
            </tr>
          ))}
          {data.length === 0 ? (
            <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-10 text-center text-slate-500">
                {emptyLabel}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>
    </div>
  );
}
