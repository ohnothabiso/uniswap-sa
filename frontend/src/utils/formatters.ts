/**
 * Formatters and Data Utilities for UniSwap SA
 */

/**
 * Format numerical or string value into South African Rand (ZAR)
 * Examples: 250 -> "R 250.00", null -> "Free / Swap"
 */
export function formatZAR(price: number | string | null | undefined): string {
  if (price === null || price === undefined || price === '' || Number(price) === 0) {
    return 'Free / Swap';
  }
  const numeric = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numeric)) return 'R 0.00';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Friendly date formatter (e.g., "12 Oct 2026")
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Relative time formatter (e.g., "2 hours ago", "yesterday", "just now")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return formatDate(dateString);
}

/**
 * Safe CSV cell sanitizer preventing Excel formula injection (=, +, -, @)
 */
export function sanitizeCSVCell(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Prevent Excel formula injection: prepend single quote if cell starts with dangerous chars
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  // Escape internal quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Safe CSV export utility preventing formula injection (=, +, -, @)
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headers: { key: keyof T; label: string }[]
): void {
  if (!rows || rows.length === 0) return;

  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const dataRows = rows.map((row) =>
    headers.map((h) => sanitizeCSVCell(row[h.key])).join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}
