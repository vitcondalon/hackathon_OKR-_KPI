export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

function pad(value) {
  return String(value).padStart(2, '0');
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

export function normalizeDateDisplay(value) {
  if (!value) return '';
  const text = String(value).trim();

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

  const vnMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (vnMatch) return `${pad(vnMatch[1])}/${pad(vnMatch[2])}/${vnMatch[3]}`;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function toDatePayloadValue(value) {
  if (!value) return value;
  const text = String(value).trim();

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return text;

  const vnMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (vnMatch) return `${vnMatch[3]}-${pad(vnMatch[2])}-${pad(vnMatch[1])}`;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateVN(value) {
  if (!value) return '-';
  return normalizeDateDisplay(value) || '-';
}

export function formatDateTimeVN(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
