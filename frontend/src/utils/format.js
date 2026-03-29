export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return Number(value.toFixed(2));
  return String(value);
}

export function percent(value) {
  const n = Number(value || 0);
  return `${Math.max(0, Math.min(100, n)).toFixed(1)}%`;
}
