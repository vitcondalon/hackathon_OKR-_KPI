export function EmptyChartState({ label = 'Chưa có dữ liệu biểu đồ' }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-sm text-slate-500">
      {label}
    </div>
  );
}
