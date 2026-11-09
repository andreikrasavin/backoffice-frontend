const CSV_DELIMITER = ';';
const CSV_LINE_BREAK = '\r\n';
const UTF8_BOM = '\uFEFF';

function escapeCell(value: string): string {
  return /[";\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/**
 * Скачивает CSV-файл средствами браузера: UTF-8 BOM нужен, чтобы Excel
 * корректно открыл кириллицу, а `;` выбран разделителем для русской локали.
 */
export function downloadCsv(filename: string, rows: readonly (readonly string[])[]): void {
  const csv =
    UTF8_BOM + rows.map((row) => row.map(escapeCell).join(CSV_DELIMITER)).join(CSV_LINE_BREAK);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
