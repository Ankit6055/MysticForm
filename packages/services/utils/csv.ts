function escapeCsvCell(value: unknown) {
  const text = Array.isArray(value)
    ? value.join("; ")
    : value instanceof Date
      ? value.toISOString()
      : value == null
        ? ""
        : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

export function serializeCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}
