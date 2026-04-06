function pad2(value) {
  return String(value).padStart(2, '0');
}

function toDateOnlyString(value) {
  if (value === null || value === undefined || value === '') {
    return value ?? null;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
}

function mapDateOnlyFields(row, fields = []) {
  if (!row || typeof row !== 'object') {
    return row;
  }

  const nextRow = { ...row };
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(nextRow, field)) {
      nextRow[field] = toDateOnlyString(nextRow[field]);
    }
  }
  return nextRow;
}

function mapDateOnlyFieldsInList(rows, fields = []) {
  return Array.isArray(rows) ? rows.map((row) => mapDateOnlyFields(row, fields)) : [];
}

module.exports = {
  toDateOnlyString,
  mapDateOnlyFields,
  mapDateOnlyFieldsInList
};
