export function titleCase(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}
